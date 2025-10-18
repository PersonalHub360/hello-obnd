import { db } from "./db";
import { authUsers, staff, type InsertAuthUser, type InsertStaff } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed admin user
  const adminUser: InsertAuthUser = {
    email: "james.bond@auroramy.com",
    password: "Sp123456@",
    name: "James Bond",
  };

  await db.insert(authUsers).values(adminUser).onConflictDoNothing();
  console.log("✓ Admin user seeded");

  // Seed staff data
  const sampleStaff: InsertStaff[] = [
    {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@auroramy.com",
      role: "Senior Software Engineer",
      department: "Engineering",
      phone: "+1 (555) 123-4567",
      status: "active",
    },
    {
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen@auroramy.com",
      role: "Product Manager",
      department: "Product",
      phone: "+1 (555) 234-5678",
      status: "active",
    },
    {
      firstName: "Emily",
      lastName: "Rodriguez",
      email: "emily.rodriguez@auroramy.com",
      role: "UX Designer",
      department: "Design",
      phone: "+1 (555) 345-6789",
      status: "active",
    },
    {
      firstName: "David",
      lastName: "Kim",
      email: "david.kim@auroramy.com",
      role: "DevOps Engineer",
      department: "Engineering",
      phone: "+1 (555) 456-7890",
      status: "active",
    },
    {
      firstName: "Jessica",
      lastName: "Martinez",
      email: "jessica.martinez@auroramy.com",
      role: "Marketing Manager",
      department: "Marketing",
      phone: "+1 (555) 567-8901",
      status: "active",
    },
    {
      firstName: "Ryan",
      lastName: "Patel",
      email: "ryan.patel@auroramy.com",
      role: "Data Analyst",
      department: "Analytics",
      phone: "+1 (555) 678-9012",
      status: "active",
    },
    {
      firstName: "Amanda",
      lastName: "Williams",
      email: "amanda.williams@auroramy.com",
      role: "HR Manager",
      department: "Human Resources",
      phone: "+1 (555) 789-0123",
      status: "active",
    },
    {
      firstName: "Christopher",
      lastName: "Taylor",
      email: "christopher.taylor@auroramy.com",
      role: "Sales Director",
      department: "Sales",
      phone: "+1 (555) 890-1234",
      status: "active",
    },
    {
      firstName: "Nicole",
      lastName: "Anderson",
      email: "nicole.anderson@auroramy.com",
      role: "Content Strategist",
      department: "Marketing",
      phone: "+1 (555) 901-2345",
      status: "inactive",
    },
    {
      firstName: "James",
      lastName: "Bond",
      email: "james.bond@auroramy.com",
      role: "Chief Executive Officer",
      department: "Executive",
      phone: "+1 (555) 007-0007",
      status: "active",
    },
  ];

  await db.insert(staff).values(sampleStaff).onConflictDoNothing();
  console.log("✓ Staff data seeded");

  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
