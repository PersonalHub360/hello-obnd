import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import multer from "multer";
import * as XLSX from "xlsx";
import express from "express";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { pool } from "./db";
import { loginSchema, insertDepositSchema, insertCallReportSchema, updateAuthUserSchema, insertAuthUserSchema, insertRoleSchema, insertDepartmentSchema, type SessionData as UserSessionData } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    user?: UserSessionData;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const sessionSecret = process.env.SESSION_SECRET || "aurora-my-secret-key-change-in-production";
  
  // Set up PostgreSQL session store for persistence
  const PgSession = connectPgSimple(session);
  
  app.use(
    session({
      store: new PgSession({
        pool: pool, // Use the same database connection pool
        tableName: 'session', // Table name for storing sessions
        createTableIfMissing: true, // Automatically create the session table
      }),
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      proxy: true, // Trust the reverse proxy
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax", // Provides CSRF protection while working on same-site requests
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        // Don't set domain - allows cookie to work on any domain (including custom domains)
      },
    })
  );

  // Serve static files from public directory
  app.use('/uploads', express.static('public/uploads'));

  // Multer setup for file uploads (Excel/CSV)
  const upload = multer({ storage: multer.memoryStorage() });
  
  // Multer setup for staff photo uploads
  const photoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/staff-photos');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = file.originalname.split('.').pop();
      cb(null, `staff-${uniqueSuffix}.${ext}`);
    }
  });
  
  const photoUpload = multer({ 
    storage: photoStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif/;
      const ext = file.originalname.split('.').pop()?.toLowerCase();
      const mimetype = allowedTypes.test(file.mimetype);
      const extname = ext ? allowedTypes.test(ext) : false;
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
      }
    }
  });

  // Health check endpoint for deployment
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Alternative health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Auth endpoints
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const result = loginSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: result.error.errors 
        });
      }

      const { username, password } = result.data;
      const user = await storage.getAuthUserByUsername(username);

      if (!user) {
        return res.status(401).json({ 
          message: "Invalid username or password" 
        });
      }

      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ 
          message: "Invalid username or password" 
        });
      }

      req.session.user = {
        userId: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.json({ 
        message: "Login successful",
        user: {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      await new Promise<void>((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/session", (req: Request, res: Response) => {
    if (req.session.user) {
      res.json(req.session.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Middleware to check authentication
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Middleware to check admin role
  const requireAdmin = (req: Request, res: Response, next: Function) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (req.session.user.role.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // User Management endpoints (Admin only)
  app.get("/api/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllAuthUsers();
      // Don't send passwords to frontend
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = insertAuthUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: result.error.errors 
        });
      }

      const newUser = await storage.createAuthUser(result.data);
      
      // Don't send password to frontend
      const { password, ...user } = newUser;
      res.status(201).json(user);
    } catch (error: any) {
      console.error("Create user error:", error);
      if (error.message?.includes("duplicate key") || error.message?.includes("unique constraint")) {
        res.status(400).json({ message: "Email address already exists" });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.patch("/api/users/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = updateAuthUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: result.error.errors 
        });
      }

      const { role, status } = result.data;
      const updated = await storage.updateAuthUser(req.params.id, { role, status });
      
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't send password to frontend
      const { password, ...user } = updated;
      res.json(user);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteAuthUser(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Staff endpoints
  app.get("/api/staff", requireAuth, async (req: Request, res: Response) => {
    try {
      const staffList = await storage.getAllStaff();
      res.json(staffList);
    } catch (error) {
      console.error("Get staff error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/staff/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const staffMember = await storage.getStaffById(req.params.id);
      
      if (!staffMember) {
        return res.status(404).json({ message: "Staff member not found" });
      }

      res.json(staffMember);
    } catch (error) {
      console.error("Get staff by ID error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/staff", requireAuth, async (req: Request, res: Response) => {
    try {
      const staffMember = await storage.createStaff(req.body);
      res.status(201).json(staffMember);
    } catch (error) {
      console.error("Create staff error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/staff/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const staffMember = await storage.updateStaff(req.params.id, req.body);
      
      if (!staffMember) {
        return res.status(404).json({ message: "Staff member not found" });
      }

      res.json(staffMember);
    } catch (error) {
      console.error("Update staff error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/staff/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteStaff(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Staff member not found" });
      }

      res.json({ message: "Staff member deleted successfully" });
    } catch (error) {
      console.error("Delete staff error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Upload staff photo
  app.post("/api/staff/:id/upload-photo", requireAuth, photoUpload.single("photo"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Get the file path relative to public directory
      const photoUrl = `/uploads/staff-photos/${req.file.filename}`;
      
      // Update staff member with new photo URL
      const staffMember = await storage.updateStaff(req.params.id, {
        photoUrl: photoUrl
      });

      if (!staffMember) {
        return res.status(404).json({ message: "Staff member not found" });
      }

      res.json({ 
        message: "Photo uploaded successfully", 
        photoUrl: photoUrl,
        staff: staffMember
      });
    } catch (error) {
      console.error("Upload photo error:", error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  app.get("/api/staff/export/csv", requireAuth, async (req: Request, res: Response) => {
    try {
      const staffList = await storage.getAllStaff();
      
      const headers = [
        "Employee ID",
        "Name",
        "Email",
        "Role",
        "Brand",
        "Country",
        "Status",
        "Joining Date",
        "Date of Birth",
        "Available Leave"
      ];
      
      const rows = staffList.map(staff => [
        staff.employeeId,
        staff.name,
        staff.email,
        staff.role || "",
        staff.brand || "",
        staff.country,
        staff.status,
        staff.joinDate ? new Date(staff.joinDate).toISOString().split('T')[0] : "",
        staff.dateOfBirth || "",
        staff.availableLeave !== null && staff.availableLeave !== undefined ? staff.availableLeave.toString() : ""
      ]);
      
      const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="staff-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error("Export CSV error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Excel import endpoint for staff
  app.post("/api/staff/import/excel", requireAuth, upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const staffList = data.map((row: any) => {
        let joinDate = row["Joining Date"] || row.joinDate || row["join_date"];
        
        // Convert Excel date serial number to date-only string (YYYY-MM-DD)
        if (typeof joinDate === 'number') {
          const millisecondsPerDay = 24 * 60 * 60 * 1000;
          const excelEpochOffset = 25569;
          const unixTimestamp = (joinDate - excelEpochOffset) * millisecondsPerDay;
          // Use UTC to avoid timezone shifts, then extract date-only string
          joinDate = new Date(unixTimestamp).toISOString().slice(0, 10);
        } else if (joinDate && typeof joinDate === 'string') {
          // Try to parse string date and normalize to YYYY-MM-DD
          const parsedDate = new Date(joinDate);
          if (!isNaN(parsedDate.getTime())) {
            // Extract date-only to avoid timezone issues
            joinDate = parsedDate.toISOString().slice(0, 10);
          } else {
            joinDate = undefined;
          }
        }
        
        return {
          employeeId: String(row["Employee ID"] || row.employeeId || row["employee_id"] || "").trim(),
          name: String(row.Name || row.name || "").trim(),
          email: String(row.Email || row.email || "").trim().toLowerCase(),
          role: String(row.Role || row.role || "").trim() || undefined,
          brand: String(row.Brand || row.brand || row["Brand Name"] || "").trim() || undefined,
          country: String(row.Country || row.country || "").trim(),
          status: String(row.Status || row.status || "active").trim(),
          joinDate: joinDate,
        };
      });

      const validStaff = staffList.filter(s => 
        s.employeeId && s.employeeId.length > 0 &&
        s.name && s.name.length > 0 &&
        s.email && s.email.length > 0 &&
        s.country && s.country.length > 0
      );

      if (validStaff.length === 0) {
        return res.status(400).json({ 
          message: "No valid staff members found in Excel file. Required fields: Employee ID, Name, Email, Country" 
        });
      }

      const createdStaff = await storage.createManyStaff(validStaff);

      res.status(201).json({
        message: `Successfully imported ${createdStaff.length} staff members`,
        imported: createdStaff.length,
        staff: createdStaff,
      });
    } catch (error: any) {
      console.error("Excel import error:", error);
      if (error.message?.includes("duplicate key") || error.message?.includes("unique constraint")) {
        res.status(400).json({ message: "One or more email addresses already exist in the system" });
      } else {
        res.status(500).json({ message: "Failed to import Excel file" });
      }
    }
  });

  // Sample Excel template download for staff
  app.get("/api/staff/sample/template", requireAuth, async (req: Request, res: Response) => {
    try {
      const sampleData = [
        {
          "Employee ID": "EMP001",
          "Name": "John Doe",
          "Email": "john.doe@example.com",
          "Role": "Manager",
          "Brand": "JB BDT",
          "Country": "Cambodia",
          "Status": "active",
          "Joining Date": "2024-01-15",
        },
        {
          "Employee ID": "EMP002",
          "Name": "Jane Smith",
          "Email": "jane.smith@example.com",
          "Role": "Sales Executive",
          "Brand": "BJ PKR",
          "Country": "UAE",
          "Status": "active",
          "Joining Date": "2024-02-20",
        },
        {
          "Employee ID": "EMP003",
          "Name": "Bob Johnson",
          "Email": "bob.johnson@example.com",
          "Role": "Team Leader",
          "Brand": "NPR",
          "Country": "India",
          "Status": "active",
          "Joining Date": "2024-03-10",
        },
      ];

      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Staff");

      const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="staff-template.xlsx"');
      res.send(excelBuffer);
    } catch (error) {
      console.error("Sample template error:", error);
      res.status(500).json({ message: "Failed to generate sample template" });
    }
  });

  // Deposit endpoints
  app.get("/api/deposits", requireAuth, async (req: Request, res: Response) => {
    try {
      const depositsList = await storage.getAllDeposits();
      res.json(depositsList);
    } catch (error) {
      console.error("Get deposits error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/deposits/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deposit = await storage.getDepositById(req.params.id);
      
      if (!deposit) {
        return res.status(404).json({ message: "Deposit not found" });
      }

      res.json(deposit);
    } catch (error) {
      console.error("Get deposit by ID error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/deposits", requireAuth, async (req: Request, res: Response) => {
    try {
      const result = insertDepositSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: result.error.errors 
        });
      }

      const deposit = await storage.createDeposit(result.data);
      res.status(201).json(deposit);
    } catch (error) {
      console.error("Create deposit error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/deposits/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deposit = await storage.updateDeposit(req.params.id, req.body);
      
      if (!deposit) {
        return res.status(404).json({ message: "Deposit not found" });
      }

      res.json(deposit);
    } catch (error) {
      console.error("Update deposit error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/deposits/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteDeposit(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Deposit not found" });
      }

      res.json({ message: "Deposit deleted successfully" });
    } catch (error) {
      console.error("Delete deposit error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Excel import endpoint for deposits
  app.post("/api/deposits/import/excel", requireAuth, upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const deposits = data.map((row: any) => {
        let date = row.Date || row.date;
        
        // Convert Excel date serial number to date-only string
        if (typeof date === 'number') {
          const millisecondsPerDay = 24 * 60 * 60 * 1000;
          const excelEpochOffset = 25569;
          const unixTimestamp = (date - excelEpochOffset) * millisecondsPerDay;
          // Extract date-only to avoid timezone shifts
          date = new Date(unixTimestamp).toISOString().slice(0, 10);
        } else if (date && typeof date === 'string') {
          // Try to parse string date and normalize
          const parsedDate = new Date(date);
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate.toISOString().slice(0, 10);
          } else {
            date = undefined;
          }
        } else {
          date = undefined;
        }
        
        return {
          staffName: String(row["Staff Name"] || row.staffName || row["Staff name"] || ""),
          type: String(row.Type || row.type || ""),
          date: date,
          brandName: String(row["Brand Name"] || row.brandName || row["Brand name"] || ""),
          ftdCount: typeof row["FTD Count"] === 'number' ? row["FTD Count"] : (typeof row.ftdCount === 'number' ? row.ftdCount : 0),
          depositCount: typeof row["Deposit Count"] === 'number' ? row["Deposit Count"] : (typeof row.depositCount === 'number' ? row.depositCount : 0),
          totalCalls: typeof row["Total Calls"] === 'number' ? row["Total Calls"] : (typeof row.totalCalls === 'number' ? row.totalCalls : 0),
          successfulCalls: typeof row["Successful Calls"] === 'number' ? row["Successful Calls"] : (typeof row.successfulCalls === 'number' ? row.successfulCalls : 0),
          unsuccessfulCalls: typeof row["Unsuccessful Calls"] === 'number' ? row["Unsuccessful Calls"] : (typeof row.unsuccessfulCalls === 'number' ? row.unsuccessfulCalls : 0),
          failedCalls: typeof row["Failed Calls"] === 'number' ? row["Failed Calls"] : (typeof row.failedCalls === 'number' ? row.failedCalls : 0),
        };
      });

      const validDeposits = deposits.filter(d => 
        d.staffName && 
        d.type && 
        (d.type === "FTD" || d.type === "Deposit") &&
        d.brandName
      ) as { staffName: string; type: "FTD" | "Deposit"; date?: string; brandName: string }[];

      if (validDeposits.length === 0) {
        return res.status(400).json({ message: "No valid deposits found in Excel file. Ensure Staff Name, Type (FTD or Deposit), and Brand Name are provided." });
      }

      const createdDeposits = await storage.createManyDeposits(validDeposits);

      res.status(201).json({
        message: `Successfully imported ${createdDeposits.length} deposits`,
        deposits: createdDeposits,
      });
    } catch (error) {
      console.error("Excel import error:", error);
      res.status(500).json({ message: "Failed to import Excel file" });
    }
  });

  // Sample Excel template download for deposits
  app.get("/api/deposits/sample/template", requireAuth, async (req: Request, res: Response) => {
    try {
      const sampleData = [
        {
          "Staff Name": "John Smith",
          "Type": "FTD",
          "Date": new Date().toISOString(),
          "Brand Name": "JB BDT",
          "FTD Count": 5,
          "Deposit Count": 10,
          "Total Calls": 50,
          "Successful Calls": 30,
          "Unsuccessful Calls": 15,
          "Failed Calls": 5,
        },
        {
          "Staff Name": "Jane Doe",
          "Type": "Deposit",
          "Date": new Date().toISOString(),
          "Brand Name": "BJ BDT",
          "FTD Count": 3,
          "Deposit Count": 7,
          "Total Calls": 40,
          "Successful Calls": 25,
          "Unsuccessful Calls": 10,
          "Failed Calls": 5,
        },
        {
          "Staff Name": "Bob Johnson",
          "Type": "FTD",
          "Date": new Date().toISOString(),
          "Brand Name": "JB PKR",
          "FTD Count": 8,
          "Deposit Count": 12,
          "Total Calls": 60,
          "Successful Calls": 40,
          "Unsuccessful Calls": 15,
          "Failed Calls": 5,
        },
      ];

      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Deposits");

      const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="deposits-template.xlsx"');
      res.send(excelBuffer);
    } catch (error) {
      console.error("Sample template error:", error);
      res.status(500).json({ message: "Failed to generate sample template" });
    }
  });

  // Call Reports endpoints
  app.get("/api/call-reports", requireAuth, async (req: Request, res: Response) => {
    try {
      const callReportsList = await storage.getAllCallReports();
      res.json(callReportsList);
    } catch (error) {
      console.error("Get call reports error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/call-reports/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const callReport = await storage.getCallReportById(req.params.id);
      
      if (!callReport) {
        return res.status(404).json({ message: "Call report not found" });
      }

      res.json(callReport);
    } catch (error) {
      console.error("Get call report by ID error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/call-reports", requireAuth, async (req: Request, res: Response) => {
    try {
      const result = insertCallReportSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: result.error.errors 
        });
      }

      const callReport = await storage.createCallReport(result.data);
      res.status(201).json(callReport);
    } catch (error) {
      console.error("Create call report error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/call-reports/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const callReport = await storage.updateCallReport(req.params.id, req.body);
      
      if (!callReport) {
        return res.status(404).json({ message: "Call report not found" });
      }

      res.json(callReport);
    } catch (error) {
      console.error("Update call report error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/call-reports/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteCallReport(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Call report not found" });
      }

      res.json({ message: "Call report deleted successfully" });
    } catch (error) {
      console.error("Delete call report error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Excel import endpoint for call reports
  app.post("/api/call-reports/import/excel", requireAuth, upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const callReports = data.map((row: any) => {
        let dateTime = row["Date Time"] || row.dateTime || row["date_time"];
        
        // Convert Excel date serial number to ISO string
        if (typeof dateTime === 'number') {
          const millisecondsPerDay = 24 * 60 * 60 * 1000;
          const excelEpochOffset = 25569;
          const unixTimestamp = (dateTime - excelEpochOffset) * millisecondsPerDay;
          dateTime = new Date(unixTimestamp).toISOString();
        } else if (dateTime && typeof dateTime === 'string') {
          // Try to parse string date
          const parsedDate = new Date(dateTime);
          if (!isNaN(parsedDate.getTime())) {
            dateTime = parsedDate.toISOString();
          } else {
            dateTime = undefined;
          }
        } else {
          dateTime = undefined;
        }
        
        return {
          userName: String(row["User Name"] || row.userName || row["user_name"] || ""),
          callAgentName: String(row["Call Agent Name"] || row.callAgentName || row["call_agent_name"] || ""),
          phoneNumber: String(row["Phone Number"] || row.phoneNumber || row["phone_number"] || ""),
          callStatus: String(row["Call Status"] || row.callStatus || row["call_status"] || "Completed"),
          duration: String(row.Duration || row.duration || ""),
          callType: String(row["Call Type"] || row.callType || row["call_type"] || ""),
          remarks: String(row.Remarks || row.remarks || ""),
          dateTime: dateTime,
        };
      });

      const validCallReports = callReports.filter(c => c.userName && c.callAgentName && c.phoneNumber && c.callStatus);

      if (validCallReports.length === 0) {
        return res.status(400).json({ message: "No valid call reports found in Excel file" });
      }

      const createdCallReports = await storage.createManyCallReports(validCallReports);

      res.status(201).json({
        message: `Successfully imported ${createdCallReports.length} call reports`,
        callReports: createdCallReports,
      });
    } catch (error) {
      console.error("Excel import error:", error);
      res.status(500).json({ message: "Failed to import Excel file" });
    }
  });

  // Sample Excel template download for call reports
  app.get("/api/call-reports/sample/template", requireAuth, async (req: Request, res: Response) => {
    try {
      const sampleData = [
        {
          "User Name": "John Customer",
          "Call Agent Name": "Sarah Agent",
          "Phone Number": "+1-555-0101",
          "Call Status": "Completed",
          "Duration": "15 mins",
          "Call Type": "Support",
          "Remarks": "Issue resolved successfully",
          "Date Time": new Date().toISOString(),
        },
        {
          "User Name": "Jane Smith",
          "Call Agent Name": "Mike Support",
          "Phone Number": "+1-555-0102",
          "Call Status": "Follow-up Required",
          "Duration": "8 mins",
          "Call Type": "Sales",
          "Remarks": "Customer interested in premium plan",
          "Date Time": new Date().toISOString(),
        },
        {
          "User Name": "Bob Johnson",
          "Call Agent Name": "Emily Care",
          "Phone Number": "+1-555-0103",
          "Call Status": "Missed",
          "Duration": "0 mins",
          "Call Type": "Support",
          "Remarks": "Left voicemail",
          "Date Time": new Date().toISOString(),
        },
      ];

      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Call Reports");

      const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="call-reports-template.xlsx"');
      res.send(excelBuffer);
    } catch (error) {
      console.error("Sample template error:", error);
      res.status(500).json({ message: "Failed to generate sample template" });
    }
  });

  // Performance Check endpoint
  app.get("/api/performance/:staffName", requireAuth, async (req: Request, res: Response) => {
    try {
      const staffName = decodeURIComponent(req.params.staffName);
      const performanceData = await storage.getStaffPerformance(staffName);
      
      res.json(performanceData);
    } catch (error) {
      console.error("Get staff performance error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Role endpoints
  app.get("/api/roles", requireAuth, async (req: Request, res: Response) => {
    try {
      const roles = await storage.getAllRoles();
      res.json(roles);
    } catch (error) {
      console.error("Get all roles error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/roles/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const role = await storage.getRoleById(req.params.id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      console.error("Get role error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/roles", requireAdmin, async (req: Request, res: Response) => {
    try {
      const result = insertRoleSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: result.error.errors 
        });
      }

      const role = await storage.createRole(result.data);
      res.status(201).json(role);
    } catch (error: any) {
      console.error("Create role error:", error);
      if (error.code === '23505') {
        return res.status(400).json({ message: "Role name already exists" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/roles/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const result = insertRoleSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: result.error.errors 
        });
      }

      const role = await storage.updateRole(req.params.id, result.data);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error: any) {
      console.error("Update role error:", error);
      if (error.code === '23505') {
        return res.status(400).json({ message: "Role name already exists" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/roles/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteRole(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete role error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Department endpoints
  app.get("/api/departments", requireAuth, async (req: Request, res: Response) => {
    try {
      const departments = await storage.getAllDepartments();
      res.json(departments);
    } catch (error) {
      console.error("Get all departments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/departments/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const department = await storage.getDepartmentById(req.params.id);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      console.error("Get department error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/departments", requireAdmin, async (req: Request, res: Response) => {
    try {
      const result = insertDepartmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: result.error.errors 
        });
      }

      const department = await storage.createDepartment(result.data);
      res.status(201).json(department);
    } catch (error: any) {
      console.error("Create department error:", error);
      if (error.code === '23505') {
        return res.status(400).json({ message: "Department name already exists" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/departments/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const result = insertDepartmentSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: result.error.errors 
        });
      }

      const department = await storage.updateDepartment(req.params.id, result.data);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(department);
    } catch (error: any) {
      console.error("Update department error:", error);
      if (error.code === '23505') {
        return res.status(400).json({ message: "Department name already exists" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/departments/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteDepartment(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete department error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Google Sheets Integration endpoints
  app.get("/api/google-sheets/auth-url", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { GoogleSheetsService } = await import("./google-sheets");
      
      const redirectUri = `${req.protocol}://${req.get('host')}/api/google-sheets/callback`;
      
      const service = new GoogleSheetsService({
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri,
      });

      const authUrl = service.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error("Get auth URL error:", error);
      res.status(500).json({ message: "Failed to generate auth URL" });
    }
  });

  app.get("/api/google-sheets/callback", async (req: Request, res: Response) => {
    try {
      const { code } = req.query;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: "Authorization code is required" });
      }

      const { GoogleSheetsService } = await import("./google-sheets");
      
      const redirectUri = `${req.protocol}://${req.get('host')}/api/google-sheets/callback`;
      
      const service = new GoogleSheetsService({
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri,
      });

      const tokens = await service.getTokenFromCode(code);
      
      // Store tokens in database - first check if config exists
      const existingConfig = await pool.query('SELECT id FROM google_sheets_config LIMIT 1');
      
      if (existingConfig.rows.length > 0) {
        // Update existing config
        await pool.query(
          `UPDATE google_sheets_config
           SET access_token = $1, refresh_token = $2, token_expiry = $3, is_connected = 1, updated_at = NOW()
           WHERE id = $4`,
          [tokens.access_token, tokens.refresh_token, tokens.expiry_date ? new Date(tokens.expiry_date) : null, existingConfig.rows[0].id]
        );
      } else {
        // Insert new config
        await pool.query(
          `INSERT INTO google_sheets_config (access_token, refresh_token, token_expiry, is_connected)
           VALUES ($1, $2, $3, 1)`,
          [tokens.access_token, tokens.refresh_token, tokens.expiry_date ? new Date(tokens.expiry_date) : null]
        );
      }

      // Redirect to settings page
      res.redirect('/settings?tab=integrations&success=google-sheets-connected');
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect('/settings?tab=integrations&error=google-sheets-failed');
    }
  });

  app.get("/api/google-sheets/status", requireAdmin, async (req: Request, res: Response) => {
    try {
      const result = await pool.query(
        'SELECT id, spreadsheet_id, spreadsheet_url, is_connected, last_sync_at FROM google_sheets_config LIMIT 1'
      );

      if (result.rows.length === 0) {
        return res.json({ connected: false });
      }

      const config = result.rows[0];
      res.json({
        connected: !!config.is_connected,
        spreadsheetId: config.spreadsheet_id,
        spreadsheetUrl: config.spreadsheet_url,
        lastSyncAt: config.last_sync_at,
      });
    } catch (error) {
      console.error("Get status error:", error);
      res.status(500).json({ message: "Failed to get status" });
    }
  });

  app.post("/api/google-sheets/create-spreadsheet", requireAdmin, async (req: Request, res: Response) => {
    try {
      // Get tokens from database
      const tokenResult = await pool.query(
        'SELECT access_token, refresh_token FROM google_sheets_config WHERE is_connected = 1 LIMIT 1'
      );

      if (tokenResult.rows.length === 0) {
        return res.status(400).json({ message: "Google Sheets not connected. Please authorize first." });
      }

      const tokens = tokenResult.rows[0];
      
      const { GoogleSheetsService } = await import("./google-sheets");
      
      const redirectUri = `${req.protocol}://${req.get('host')}/api/google-sheets/callback`;
      
      const service = new GoogleSheetsService({
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri,
      });

      service.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });

      const spreadsheet = await service.createSpreadsheet('AuroraMY Data');
      
      // Update database with spreadsheet info
      await pool.query(
        `UPDATE google_sheets_config
         SET spreadsheet_id = $1, spreadsheet_url = $2, updated_at = NOW()
         WHERE is_connected = 1`,
        [spreadsheet.spreadsheetId, spreadsheet.spreadsheetUrl]
      );

      res.json({
        spreadsheetId: spreadsheet.spreadsheetId,
        spreadsheetUrl: spreadsheet.spreadsheetUrl,
      });
    } catch (error) {
      console.error("Create spreadsheet error:", error);
      res.status(500).json({ message: "Failed to create spreadsheet" });
    }
  });

  app.post("/api/google-sheets/link-spreadsheet", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { spreadsheetUrl } = req.body;

      if (!spreadsheetUrl) {
        return res.status(400).json({ message: "Spreadsheet URL is required" });
      }

      // Extract spreadsheet ID from URL
      // Format: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit...
      const spreadsheetIdMatch = spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      
      if (!spreadsheetIdMatch) {
        return res.status(400).json({ message: "Invalid Google Sheets URL format" });
      }

      const spreadsheetId = spreadsheetIdMatch[1];

      // Get tokens from database
      const tokenResult = await pool.query(
        'SELECT access_token, refresh_token FROM google_sheets_config WHERE is_connected = 1 LIMIT 1'
      );

      if (tokenResult.rows.length === 0) {
        return res.status(400).json({ message: "Google Sheets not connected. Please authorize first." });
      }

      // Update database with spreadsheet info
      await pool.query(
        `UPDATE google_sheets_config
         SET spreadsheet_id = $1, spreadsheet_url = $2, updated_at = NOW()
         WHERE is_connected = 1`,
        [spreadsheetId, spreadsheetUrl]
      );

      res.json({
        spreadsheetId,
        spreadsheetUrl,
        message: "Spreadsheet linked successfully",
      });
    } catch (error) {
      console.error("Link spreadsheet error:", error);
      res.status(500).json({ message: "Failed to link spreadsheet" });
    }
  });

  app.post("/api/google-sheets/sync", requireAdmin, async (req: Request, res: Response) => {
    try {
      // Get tokens and spreadsheet ID from database
      const configResult = await pool.query(
        'SELECT access_token, refresh_token, spreadsheet_id FROM google_sheets_config WHERE is_connected = 1 LIMIT 1'
      );

      if (configResult.rows.length === 0) {
        return res.status(400).json({ message: "Google Sheets not connected. Please authorize first." });
      }

      const config = configResult.rows[0];
      
      if (!config.spreadsheet_id) {
        return res.status(400).json({ message: "No spreadsheet configured. Please create one first." });
      }

      const { GoogleSheetsService } = await import("./google-sheets");
      
      const redirectUri = `${req.protocol}://${req.get('host')}/api/google-sheets/callback`;
      
      const service = new GoogleSheetsService({
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri,
      });

      service.setCredentials({
        access_token: config.access_token,
        refresh_token: config.refresh_token,
      });

      // Get all data
      const staff = await storage.getAllStaff();
      const deposits = await storage.getAllDeposits();
      const callReports = await storage.getAllCallReports();

      // Sync all data
      await service.syncAllData(config.spreadsheet_id, {
        staff,
        deposits,
        callReports,
      });

      // Update last sync time
      await pool.query(
        'UPDATE google_sheets_config SET last_sync_at = NOW(), updated_at = NOW() WHERE is_connected = 1'
      );

      res.json({ 
        success: true, 
        message: 'All data synced successfully',
        counts: {
          staff: staff.length,
          deposits: deposits.length,
          callReports: callReports.length,
        }
      });
    } catch (error) {
      console.error("Sync error:", error);
      res.status(500).json({ message: "Failed to sync data" });
    }
  });

  app.post("/api/google-sheets/disconnect", requireAdmin, async (req: Request, res: Response) => {
    try {
      await pool.query(
        'UPDATE google_sheets_config SET is_connected = 0, access_token = NULL, refresh_token = NULL, updated_at = NOW()'
      );

      res.json({ success: true, message: 'Google Sheets disconnected' });
    } catch (error) {
      console.error("Disconnect error:", error);
      res.status(500).json({ message: "Failed to disconnect" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
