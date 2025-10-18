import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { loginSchema, type SessionData as UserSessionData } from "@shared/schema";

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

  const httpServer = createServer(app);

  return httpServer;
}
