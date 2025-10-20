import { type Staff, type InsertStaff, type AuthUser, type InsertAuthUser, type UpdateAuthUser, type Deposit, type InsertDeposit, type CallReport, type InsertCallReport, staff, authUsers, deposits, callReports } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Auth methods
  getAuthUser(id: string): Promise<AuthUser | undefined>;
  getAuthUserByEmail(email: string): Promise<AuthUser | undefined>;
  getAllAuthUsers(): Promise<AuthUser[]>;
  createAuthUser(user: InsertAuthUser): Promise<AuthUser>;
  updateAuthUser(id: string, user: UpdateAuthUser): Promise<AuthUser | undefined>;
  deleteAuthUser(id: string): Promise<boolean>;
  
  // Staff methods
  getAllStaff(): Promise<Staff[]>;
  getStaffById(id: string): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  createManyStaff(staffList: InsertStaff[]): Promise<Staff[]>;
  updateStaff(id: string, staff: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: string): Promise<boolean>;
  
  // Deposit methods
  getAllDeposits(): Promise<Deposit[]>;
  getDepositById(id: string): Promise<Deposit | undefined>;
  getDepositByReference(reference: string): Promise<Deposit | undefined>;
  createDeposit(deposit: InsertDeposit): Promise<Deposit>;
  createManyDeposits(deposits: InsertDeposit[]): Promise<Deposit[]>;
  updateDeposit(id: string, deposit: Partial<InsertDeposit>): Promise<Deposit | undefined>;
  updateDepositByReference(reference: string, deposit: Partial<InsertDeposit>): Promise<Deposit | undefined>;
  deleteDeposit(id: string): Promise<boolean>;
  
  // Call Report methods
  getAllCallReports(): Promise<CallReport[]>;
  getCallReportById(id: string): Promise<CallReport | undefined>;
  createCallReport(callReport: InsertCallReport): Promise<CallReport>;
  createManyCallReports(callReports: InsertCallReport[]): Promise<CallReport[]>;
  updateCallReport(id: string, callReport: Partial<InsertCallReport>): Promise<CallReport | undefined>;
  deleteCallReport(id: string): Promise<boolean>;
  
  // Performance methods
  getStaffPerformance(staffName: string): Promise<{
    calls: CallReport[];
    deposits: Deposit[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getAuthUser(id: string): Promise<AuthUser | undefined> {
    const [user] = await db.select().from(authUsers).where(eq(authUsers.id, id));
    return user || undefined;
  }

  async getAuthUserByEmail(email: string): Promise<AuthUser | undefined> {
    const [user] = await db.select().from(authUsers).where(eq(authUsers.email, email));
    return user || undefined;
  }

  async createAuthUser(insertUser: InsertAuthUser): Promise<AuthUser> {
    const [user] = await db.insert(authUsers).values(insertUser).returning();
    return user;
  }

  async getAllAuthUsers(): Promise<AuthUser[]> {
    return await db.select().from(authUsers).orderBy(authUsers.name);
  }

  async updateAuthUser(id: string, updateUser: UpdateAuthUser): Promise<AuthUser | undefined> {
    const [user] = await db.update(authUsers)
      .set(updateUser)
      .where(eq(authUsers.id, id))
      .returning();
    return user || undefined;
  }

  async deleteAuthUser(id: string): Promise<boolean> {
    const result = await db.delete(authUsers).where(eq(authUsers.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAllStaff(): Promise<Staff[]> {
    return await db.select().from(staff).orderBy(staff.name);
  }

  async getStaffById(id: string): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    return staffMember || undefined;
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const staffData: any = { ...insertStaff };
    if (staffData.joinDate && typeof staffData.joinDate === 'string') {
      staffData.joinDate = new Date(staffData.joinDate);
    }
    const [staffMember] = await db.insert(staff).values(staffData).returning();
    return staffMember;
  }

  async createManyStaff(insertStaffList: InsertStaff[]): Promise<Staff[]> {
    const staffData = insertStaffList.map(s => {
      const data: any = { ...s };
      if (data.joinDate && typeof data.joinDate === 'string') {
        data.joinDate = new Date(data.joinDate);
      }
      return data;
    });
    const result = await db.insert(staff).values(staffData).returning();
    return result;
  }

  async updateStaff(id: string, updates: Partial<InsertStaff>): Promise<Staff | undefined> {
    const updateData: any = { ...updates };
    if (updateData.joinDate && typeof updateData.joinDate === 'string') {
      updateData.joinDate = new Date(updateData.joinDate);
    }
    const [staffMember] = await db
      .update(staff)
      .set(updateData)
      .where(eq(staff.id, id))
      .returning();
    return staffMember || undefined;
  }

  async deleteStaff(id: string): Promise<boolean> {
    const result = await db.delete(staff).where(eq(staff.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAllDeposits(): Promise<Deposit[]> {
    return await db.select().from(deposits).orderBy(deposits.date);
  }

  async getDepositById(id: string): Promise<Deposit | undefined> {
    const [deposit] = await db.select().from(deposits).where(eq(deposits.id, id));
    return deposit || undefined;
  }

  async getDepositByReference(reference: string): Promise<Deposit | undefined> {
    const [deposit] = await db.select().from(deposits).where(eq(deposits.reference, reference));
    return deposit || undefined;
  }

  async createDeposit(insertDeposit: InsertDeposit): Promise<Deposit> {
    const depositData: any = { ...insertDeposit };
    if (depositData.date && typeof depositData.date === 'string') {
      depositData.date = new Date(depositData.date);
    }
    const [deposit] = await db.insert(deposits).values(depositData).returning();
    return deposit;
  }

  async createManyDeposits(insertDeposits: InsertDeposit[]): Promise<Deposit[]> {
    const depositsData = insertDeposits.map(d => {
      const data: any = { ...d };
      if (data.date && typeof data.date === 'string') {
        data.date = new Date(data.date);
      }
      return data;
    });
    const result = await db.insert(deposits).values(depositsData).returning();
    return result;
  }

  async updateDeposit(id: string, updates: Partial<InsertDeposit>): Promise<Deposit | undefined> {
    const updateData: any = { ...updates };
    if (updateData.date && typeof updateData.date === 'string') {
      updateData.date = new Date(updateData.date);
    }
    const [deposit] = await db
      .update(deposits)
      .set(updateData)
      .where(eq(deposits.id, id))
      .returning();
    return deposit || undefined;
  }

  async updateDepositByReference(reference: string, updates: Partial<InsertDeposit>): Promise<Deposit | undefined> {
    const updateData: any = { ...updates };
    if (updateData.date && typeof updateData.date === 'string') {
      updateData.date = new Date(updateData.date);
    }
    const [deposit] = await db
      .update(deposits)
      .set(updateData)
      .where(eq(deposits.reference, reference))
      .returning();
    return deposit || undefined;
  }

  async deleteDeposit(id: string): Promise<boolean> {
    const result = await db.delete(deposits).where(eq(deposits.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAllCallReports(): Promise<CallReport[]> {
    return await db.select().from(callReports).orderBy(callReports.dateTime);
  }

  async getCallReportById(id: string): Promise<CallReport | undefined> {
    const [callReport] = await db.select().from(callReports).where(eq(callReports.id, id));
    return callReport || undefined;
  }

  async createCallReport(insertCallReport: InsertCallReport): Promise<CallReport> {
    const callReportData: any = { ...insertCallReport };
    if (callReportData.dateTime && typeof callReportData.dateTime === 'string') {
      callReportData.dateTime = new Date(callReportData.dateTime);
    }
    const [callReport] = await db.insert(callReports).values(callReportData).returning();
    return callReport;
  }

  async createManyCallReports(insertCallReports: InsertCallReport[]): Promise<CallReport[]> {
    const callReportsData = insertCallReports.map(c => {
      const data: any = { ...c };
      if (data.dateTime && typeof data.dateTime === 'string') {
        data.dateTime = new Date(data.dateTime);
      }
      return data;
    });
    const result = await db.insert(callReports).values(callReportsData).returning();
    return result;
  }

  async updateCallReport(id: string, updates: Partial<InsertCallReport>): Promise<CallReport | undefined> {
    const updateData: any = { ...updates };
    if (updateData.dateTime && typeof updateData.dateTime === 'string') {
      updateData.dateTime = new Date(updateData.dateTime);
    }
    const [callReport] = await db
      .update(callReports)
      .set(updateData)
      .where(eq(callReports.id, id))
      .returning();
    return callReport || undefined;
  }

  async deleteCallReport(id: string): Promise<boolean> {
    const result = await db.delete(callReports).where(eq(callReports.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getStaffPerformance(staffName: string): Promise<{
    calls: CallReport[];
    deposits: Deposit[];
  }> {
    const calls = await db
      .select()
      .from(callReports)
      .where(eq(callReports.callAgentName, staffName))
      .orderBy(callReports.dateTime);
    
    const userNames = calls.map(c => c.userName);
    const uniqueUserNames = Array.from(new Set(userNames));
    
    let relatedDeposits: Deposit[] = [];
    if (uniqueUserNames.length > 0) {
      const allDeposits = await db.select().from(deposits);
      relatedDeposits = allDeposits.filter(d => 
        uniqueUserNames.some(userName => 
          userName.toLowerCase() === d.depositor.toLowerCase()
        )
      );
    }
    
    return {
      calls,
      deposits: relatedDeposits,
    };
  }
}

export const storage = new DatabaseStorage();
