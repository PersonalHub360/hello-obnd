import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import multer from "multer";
import * as XLSX from "xlsx";
import { storage } from "./storage";
import { loginSchema, insertDepositSchema, insertCallReportSchema, type SessionData as UserSessionData } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    user?: UserSessionData;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const sessionSecret = process.env.SESSION_SECRET || "aurora-my-secret-key-change-in-production";
  
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Multer setup for file uploads
  const upload = multer({ storage: multer.memoryStorage() });

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

      const { email, password } = result.data;
      const user = await storage.getAuthUserByEmail(email);

      if (!user || user.password !== password) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      req.session.user = {
        userId: user.id,
        email: user.email,
        name: user.name,
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

  app.get("/api/staff/export/csv", requireAuth, async (req: Request, res: Response) => {
    try {
      const staffList = await storage.getAllStaff();
      
      const headers = [
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Role",
        "Department",
        "Status",
        "Join Date"
      ];
      
      const rows = staffList.map(staff => [
        staff.firstName,
        staff.lastName,
        staff.email,
        staff.phone,
        staff.role,
        staff.department,
        staff.status,
        new Date(staff.joinDate).toISOString().split('T')[0]
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

      const staffList = data.map((row: any) => ({
        firstName: String(row["First Name"] || row.firstName || row["first_name"] || "").trim(),
        lastName: String(row["Last Name"] || row.lastName || row["last_name"] || "").trim(),
        email: String(row.Email || row.email || "").trim().toLowerCase(),
        phone: String(row.Phone || row.phone || "").trim(),
        role: String(row.Role || row.role || "").trim(),
        department: String(row.Department || row.department || "").trim(),
        status: String(row.Status || row.status || "active").trim(),
      }));

      const validStaff = staffList.filter(s => 
        s.firstName && s.firstName.length > 0 &&
        s.lastName && s.lastName.length > 0 &&
        s.email && s.email.length > 0 &&
        s.phone && s.phone.length > 0 &&
        s.role && s.role.length > 0 &&
        s.department && s.department.length > 0
      );

      if (validStaff.length === 0) {
        return res.status(400).json({ 
          message: "No valid staff members found in Excel file. Required fields: First Name, Last Name, Email, Phone, Role, Department" 
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
          "First Name": "John",
          "Last Name": "Doe",
          "Email": "john.doe@example.com",
          "Phone": "+1-555-0101",
          "Role": "Software Engineer",
          "Department": "Engineering",
          "Status": "active",
        },
        {
          "First Name": "Jane",
          "Last Name": "Smith",
          "Email": "jane.smith@example.com",
          "Phone": "+1-555-0102",
          "Role": "Product Manager",
          "Department": "Product",
          "Status": "active",
        },
        {
          "First Name": "Bob",
          "Last Name": "Johnson",
          "Email": "bob.johnson@example.com",
          "Phone": "+1-555-0103",
          "Role": "Designer",
          "Department": "Design",
          "Status": "active",
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

      const deposits = data.map((row: any) => ({
        amount: String(row.Amount || row.amount || "0"),
        type: String(row.Type || row.type || "Cash"),
        status: String(row.Status || row.status || "pending"),
        reference: String(row.Reference || row.reference || ""),
        depositor: String(row.Depositor || row.depositor || ""),
        date: row.Date || row.date ? new Date(row.Date || row.date).toISOString() : undefined,
      }));

      const validDeposits = deposits.filter(d => d.amount && d.reference && d.depositor);

      if (validDeposits.length === 0) {
        return res.status(400).json({ message: "No valid deposits found in Excel file" });
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

  // Excel update import endpoint for deposits
  app.post("/api/deposits/import/excel/update", requireAuth, upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const deposits = data.map((row: any) => ({
        amount: String(row.Amount || row.amount || "0"),
        type: String(row.Type || row.type || "Cash"),
        status: String(row.Status || row.status || "pending"),
        reference: String(row.Reference || row.reference || "").trim(),
        depositor: String(row.Depositor || row.depositor || ""),
        date: row.Date || row.date ? new Date(row.Date || row.date).toISOString() : undefined,
      }));

      const validDeposits = deposits.filter(d => d.reference && d.reference.length > 0);

      if (validDeposits.length === 0) {
        return res.status(400).json({ 
          message: "No valid deposits found in Excel file. All rows must have a non-empty Reference number." 
        });
      }

      let updatedCount = 0;
      let notFoundCount = 0;

      for (const depositData of validDeposits) {
        const existing = await storage.getDepositByReference(depositData.reference);
        if (existing) {
          await storage.updateDepositByReference(depositData.reference, depositData);
          updatedCount++;
        } else {
          notFoundCount++;
        }
      }

      res.status(200).json({
        message: `Successfully updated ${updatedCount} deposits${notFoundCount > 0 ? `, ${notFoundCount} not found` : ''}`,
        updated: updatedCount,
        notFound: notFoundCount,
      });
    } catch (error) {
      console.error("Excel update import error:", error);
      res.status(500).json({ message: "Failed to update from Excel file" });
    }
  });

  // Sample Excel template download for deposits
  app.get("/api/deposits/sample/template", requireAuth, async (req: Request, res: Response) => {
    try {
      const sampleData = [
        {
          "Reference": "REF-2025-ABC1234",
          "Amount": "5000",
          "Type": "Wire Transfer",
          "Status": "completed",
          "Depositor": "John Customer",
          "Date": new Date().toISOString(),
        },
        {
          "Reference": "REF-2025-XYZ5678",
          "Amount": "2500",
          "Type": "Cash",
          "Status": "pending",
          "Depositor": "Jane Smith",
          "Date": new Date().toISOString(),
        },
        {
          "Reference": "REF-2025-DEF9012",
          "Amount": "7500",
          "Type": "Check",
          "Status": "completed",
          "Depositor": "Bob Johnson",
          "Date": new Date().toISOString(),
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

      const callReports = data.map((row: any) => ({
        userName: String(row["User Name"] || row.userName || row["user_name"] || ""),
        callAgentName: String(row["Call Agent Name"] || row.callAgentName || row["call_agent_name"] || ""),
        phoneNumber: String(row["Phone Number"] || row.phoneNumber || row["phone_number"] || ""),
        callStatus: String(row["Call Status"] || row.callStatus || row["call_status"] || "Completed"),
        duration: String(row.Duration || row.duration || ""),
        callType: String(row["Call Type"] || row.callType || row["call_type"] || ""),
        remarks: String(row.Remarks || row.remarks || ""),
        dateTime: row["Date Time"] || row.dateTime || row["date_time"] ? new Date(row["Date Time"] || row.dateTime || row["date_time"]).toISOString() : undefined,
      }));

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

  const httpServer = createServer(app);

  return httpServer;
}
