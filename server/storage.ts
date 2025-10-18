import { type Staff, type InsertStaff, type AuthUser, type InsertAuthUser } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Auth methods
  getAuthUser(id: string): Promise<AuthUser | undefined>;
  getAuthUserByEmail(email: string): Promise<AuthUser | undefined>;
  createAuthUser(user: InsertAuthUser): Promise<AuthUser>;
  
  // Staff methods
  getAllStaff(): Promise<Staff[]>;
  getStaffById(id: string): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: string, staff: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private authUsers: Map<string, AuthUser>;
  private staff: Map<string, Staff>;

  constructor() {
    this.authUsers = new Map();
    this.staff = new Map();
    this.seedData();
  }

  private seedData() {
    const adminUser: AuthUser = {
      id: randomUUID(),
      email: "james.bond@auroramy.com",
      password: "Sp123456@",
      name: "James Bond",
    };
    this.authUsers.set(adminUser.id, adminUser);

    const sampleStaff: Omit<Staff, 'id' | 'joinDate'>[] = [
      {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@auroramy.com",
        role: "Senior Software Engineer",
        department: "Engineering",
        phone: "+1 (555) 123-4567",
        status: "active",
        avatar: null,
      },
      {
        firstName: "Michael",
        lastName: "Chen",
        email: "michael.chen@auroramy.com",
        role: "Product Manager",
        department: "Product",
        phone: "+1 (555) 234-5678",
        status: "active",
        avatar: null,
      },
      {
        firstName: "Emily",
        lastName: "Rodriguez",
        email: "emily.rodriguez@auroramy.com",
        role: "UX Designer",
        department: "Design",
        phone: "+1 (555) 345-6789",
        status: "active",
        avatar: null,
      },
      {
        firstName: "David",
        lastName: "Kim",
        email: "david.kim@auroramy.com",
        role: "DevOps Engineer",
        department: "Engineering",
        phone: "+1 (555) 456-7890",
        status: "active",
        avatar: null,
      },
      {
        firstName: "Jessica",
        lastName: "Martinez",
        email: "jessica.martinez@auroramy.com",
        role: "Marketing Manager",
        department: "Marketing",
        phone: "+1 (555) 567-8901",
        status: "active",
        avatar: null,
      },
      {
        firstName: "Ryan",
        lastName: "Patel",
        email: "ryan.patel@auroramy.com",
        role: "Data Analyst",
        department: "Analytics",
        phone: "+1 (555) 678-9012",
        status: "active",
        avatar: null,
      },
      {
        firstName: "Amanda",
        lastName: "Williams",
        email: "amanda.williams@auroramy.com",
        role: "HR Manager",
        department: "Human Resources",
        phone: "+1 (555) 789-0123",
        status: "active",
        avatar: null,
      },
      {
        firstName: "Christopher",
        lastName: "Taylor",
        email: "christopher.taylor@auroramy.com",
        role: "Sales Director",
        department: "Sales",
        phone: "+1 (555) 890-1234",
        status: "active",
        avatar: null,
      },
      {
        firstName: "Nicole",
        lastName: "Anderson",
        email: "nicole.anderson@auroramy.com",
        role: "Content Strategist",
        department: "Marketing",
        phone: "+1 (555) 901-2345",
        status: "inactive",
        avatar: null,
      },
      {
        firstName: "James",
        lastName: "Bond",
        email: "james.bond@auroramy.com",
        role: "Chief Executive Officer",
        department: "Executive",
        phone: "+1 (555) 007-0007",
        status: "active",
        avatar: null,
      },
    ];

    sampleStaff.forEach((staffData) => {
      const staff: Staff = {
        ...staffData,
        id: randomUUID(),
        joinDate: new Date(
          Date.now() - Math.floor(Math.random() * 730 * 24 * 60 * 60 * 1000)
        ),
      };
      this.staff.set(staff.id, staff);
    });
  }

  async getAuthUser(id: string): Promise<AuthUser | undefined> {
    return this.authUsers.get(id);
  }

  async getAuthUserByEmail(email: string): Promise<AuthUser | undefined> {
    return Array.from(this.authUsers.values()).find(
      (user) => user.email === email
    );
  }

  async createAuthUser(insertUser: InsertAuthUser): Promise<AuthUser> {
    const id = randomUUID();
    const user: AuthUser = { ...insertUser, id };
    this.authUsers.set(id, user);
    return user;
  }

  async getAllStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values()).sort((a, b) => 
      a.lastName.localeCompare(b.lastName)
    );
  }

  async getStaffById(id: string): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = randomUUID();
    const staff: Staff = { 
      ...insertStaff,
      status: insertStaff.status || "active",
      avatar: insertStaff.avatar || null,
      id,
      joinDate: new Date(),
    };
    this.staff.set(id, staff);
    return staff;
  }

  async updateStaff(id: string, updates: Partial<InsertStaff>): Promise<Staff | undefined> {
    const existing = this.staff.get(id);
    if (!existing) return undefined;
    
    const updated: Staff = { ...existing, ...updates };
    this.staff.set(id, updated);
    return updated;
  }

  async deleteStaff(id: string): Promise<boolean> {
    return this.staff.delete(id);
  }
}

export const storage = new MemStorage();
