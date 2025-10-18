import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Staff table
export const staff = pgTable("staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  department: text("department").notNull(),
  phone: text("phone").notNull(),
  status: text("status").notNull().default("active"),
  avatar: text("avatar"),
  joinDate: timestamp("join_date").notNull().defaultNow(),
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  joinDate: true,
});

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;

// Auth user table (for login)
export const authUsers = pgTable("auth_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
});

export const insertAuthUserSchema = createInsertSchema(authUsers).omit({
  id: true,
});

export type InsertAuthUser = z.infer<typeof insertAuthUserSchema>;
export type AuthUser = typeof authUsers.$inferSelect;

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// Session data
export interface SessionData {
  userId: string;
  email: string;
  name: string;
}

// Deposits table
export const deposits = pgTable("deposits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull().defaultNow(),
  amount: text("amount").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("pending"),
  reference: text("reference").notNull(),
  depositor: text("depositor").notNull(),
});

export const insertDepositSchema = createInsertSchema(deposits).omit({
  id: true,
}).extend({
  amount: z.string().min(1, "Amount is required"),
  date: z.string().optional(),
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
