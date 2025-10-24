import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Staff table
export const staff = pgTable("staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: text("employee_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role"),
  department: text("department"),
  brand: text("brand"),
  country: text("country").notNull(),
  status: text("status").notNull().default("active"),
  joinDate: timestamp("join_date"),
  photoUrl: text("photo_url"),
  dateOfBirth: text("date_of_birth"),
  availableLeave: integer("available_leave"),
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
}).extend({
  joinDate: z.string().optional(),
  photoUrl: z.string().optional(),
  dateOfBirth: z.string().optional(),
  availableLeave: z.number().optional(),
});

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;

// Auth user table (for login)
export const authUsers = pgTable("auth_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("User"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAuthUserSchema = createInsertSchema(authUsers).omit({
  id: true,
  createdAt: true,
});

export const updateAuthUserSchema = z.object({
  role: z.string().optional(),
  status: z.enum(["active", "deactivated"]).optional(),
});

export type InsertAuthUser = z.infer<typeof insertAuthUserSchema>;
export type AuthUser = typeof authUsers.$inferSelect;
export type UpdateAuthUser = z.infer<typeof updateAuthUserSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// Session data
export interface SessionData {
  userId: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

// Deposits table
export const deposits = pgTable("deposits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffName: text("staff_name").notNull(),
  type: text("type").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  brandName: text("brand_name").notNull(),
  ftdCount: integer("ftd_count").default(0),
  depositCount: integer("deposit_count").default(0),
  totalCalls: integer("total_calls").default(0),
  successfulCalls: integer("successful_calls").default(0),
  unsuccessfulCalls: integer("unsuccessful_calls").default(0),
  failedCalls: integer("failed_calls").default(0),
});

export const insertDepositSchema = createInsertSchema(deposits).omit({
  id: true,
}).extend({
  staffName: z.string().min(1, "Staff name is required"),
  type: z.enum(["FTD", "Deposit"], {
    errorMap: () => ({ message: "Type must be either FTD or Deposit" }),
  }),
  date: z.string().optional(),
  brandName: z.string().min(1, "Brand name is required"),
  ftdCount: z.number().min(0, "FTD count must be 0 or greater").optional(),
  depositCount: z.number().min(0, "Deposit count must be 0 or greater").optional(),
  totalCalls: z.number().min(0, "Total calls must be 0 or greater").optional(),
  successfulCalls: z.number().min(0, "Successful calls must be 0 or greater").optional(),
  unsuccessfulCalls: z.number().min(0, "Unsuccessful calls must be 0 or greater").optional(),
  failedCalls: z.number().min(0, "Failed calls must be 0 or greater").optional(),
});

export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type Deposit = typeof deposits.$inferSelect;

// Call Reports table
export const callReports = pgTable("call_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userName: text("user_name").notNull(),
  callAgentName: text("call_agent_name").notNull(),
  dateTime: timestamp("date_time").notNull().defaultNow(),
  callStatus: text("call_status").notNull(),
  phoneNumber: text("phone_number").notNull(),
  duration: text("duration"),
  remarks: text("remarks"),
  callType: text("call_type"),
});

export const insertCallReportSchema = createInsertSchema(callReports).omit({
  id: true,
}).extend({
  userName: z.string().min(1, "User name is required"),
  callAgentName: z.string().min(1, "Call agent name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  callStatus: z.string().min(1, "Call status is required"),
  dateTime: z.string().optional(),
});

export type InsertCallReport = z.infer<typeof insertCallReportSchema>;
export type CallReport = typeof callReports.$inferSelect;

// Roles table
export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Role name is required"),
});

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

// Departments table
export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Department name is required"),
});

export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;

// Google Sheets Configuration table
export const googleSheetsConfig = pgTable("google_sheets_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  spreadsheetId: text("spreadsheet_id"),
  spreadsheetUrl: text("spreadsheet_url"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  isConnected: integer("is_connected").default(0),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type GoogleSheetsConfig = typeof googleSheetsConfig.$inferSelect;
