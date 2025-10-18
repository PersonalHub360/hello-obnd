import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import multer from "multer";
import * as XLSX from "xlsx";
import { storage } from "./storage";
import { loginSchema, insertDepositSchema, type SessionData as UserSessionData } from "@shared/schema";

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

  // Excel import endpoint
  const upload = multer({ storage: multer.memoryStorage() });

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

  const httpServer = createServer(app);

  return httpServer;
}
