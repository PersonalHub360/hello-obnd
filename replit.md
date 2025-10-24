# AuroraMY Staff Management System

## Overview
AuroraMY is a professional staff management web application designed to streamline human resources and operational workflows. It provides secure authentication, a responsive dashboard, and robust tools for managing staff, tracking financial deposits, logging customer call reports, and analyzing key business metrics. The system features comprehensive data interconnection across all modules, ensuring that changes in one section automatically reflect in all other sections. The system aims to enhance organizational efficiency, provide clear insights into staff performance, and support data-driven decision-making within a corporate environment.

## User Preferences
- Professional corporate aesthetic
- Clean, modern interface design
- Emphasis on data clarity and usability
- Responsive across all device sizes

## System Architecture
The application is built as a full-stack web application using a React, Express, and PostgreSQL (with Drizzle ORM) stack.

**UI/UX Decisions:**
- **Design System:** Material Design-inspired with a professional corporate blue color scheme (HSL: 221 83% 53%).
- **Typography:** Inter (sans-serif) for general text and JetBrains Mono for monospace.
- **Responsiveness:** Layouts are fully responsive, adapting to desktop, tablet, and mobile screens.
- **Interactive Elements:** Features a collapsible sidebar navigation with a blue-to-purple gradient background, floating blur orbs, glassmorphism effects, and glowing active states. The login page incorporates a glassmorphism design with animated backgrounds.
- **Theming:** Supports 5 theme options (Light, Dark, Blue, Green, Purple) with persistent user preference stored in localStorage.
- **User Feedback:** Includes loading states and toast notifications for error handling.

**Technical Implementations:**
- **Frontend:** React 18 with TypeScript, Wouter for routing, TanStack Query for data fetching, and Shadcn UI (built on Radix UI primitives) for components. Recharts is used for data visualization.
- **Backend:** Express.js and TypeScript, providing RESTful APIs.
- **Authentication:** Email-based login with secure server-side session management using `express-session` with PostgreSQL storage. Passwords are hashed using bcrypt. Supports role-based access control.
- **Authorization:** Multi-layer security with backend middleware (`requireAuth`, `requireAdmin`) and frontend conditional rendering for admin-only sections.
- **Data Management:** Full CRUD operations for Staff, Call Reports, and Users (admin only). Deposits support Create, View, and Delete operations.
- **Excel Integration:** Functionality for bulk importing staff, deposits, and call reports from `.xlsx` or `.xls` files, including sample template downloads. Excel serial dates are converted to Unix timestamps and normalized to YYYY-MM-DD.
- **Data Export:** CSV export for staff data.
- **Validation:** Zod schemas are used for robust data validation on all API endpoints.
- **Date Storage:** Staff joining dates are stored as date-only strings (YYYY-MM-DD).
- **Drizzle ORM Workaround:** `updateDeposit` function uses raw SQL queries via `pool.query()` to bypass schema cache issues for new columns, while other CRUD operations use Drizzle ORM.

**Feature Specifications:**
- **Authentication System:** Secure login, session management with role-based access control, protected routes, and logout. Sessions are stored in PostgreSQL.
- **Navigation:** Collapsible sidebar with sections: Dashboard, Deposit Section, Staff Directory, Staff Performance Check, Analytics, and Settings.
- **Dashboard:** Overview with date filtering, dynamic month selection, and key business metrics (Total Calls, Total Deposit, Total FTD, Successful Calls, Conversion Rate).
- **Staff Directory:** Comprehensive staff management with CRUD, bulk delete, search, filtering, Excel import/export. Staff form includes Employee ID, Name, Email, Role dropdown (10 fixed options), Brand Name (7 predefined options), Country (11 options), Status, Joining Date, Date of Birth (optional), Available Leave (optional). Staff profiles display photo upload, calculated age, and available leave.
- **Deposit Section:** Manages financial deposits with statistics. New deposit forms include Staff Name (searchable dropdown), FTD (Yes/No), Deposit (Yes/No), Date, Brand Name (7 fixed options), FTD Count, Deposit Count, Total Calls, Successful Calls, Unsuccessful Calls, Failed Calls. Deposits support Create, View, and Delete operations; Update/Edit is removed. Features bulk selection and deletion.
- **Analytics Dashboard:** Visualizes HR and operational data with charts for department distribution, employee status, hiring trends, etc.
- **Settings Section:** Multi-section settings including Interface (theme selection, UI preferences), Notifications, Account, and User Management (Admin Only).
    - **User Management (Admin Only):** Role-based user administration with inline editing of user roles and status. Add new users with username, name, email, password, and role selection (8 predefined roles). Protected by backend `requireAdmin` middleware.

**Data Interconnection:**
- **Real-Time Data Synchronization:** All sections query the same backend APIs. Changes in one module (e.g., Staff Directory) immediately reflect in others (e.g., Analytics).
- **Shared Data Schema:** Staff, Deposit, and Call Report data are interconnected and used across multiple modules for consistent reporting and calculations.
- **Consistent Calculations:** Identical calculation logic for metrics like FTD Count, Deposit Count, Bonus Formula, and Conversion Rate across all pages.
- **Dashboard Metrics:** Real-time metrics based on call reports and deposit data.
- **Analytics Dashboard:** Provides comprehensive staff, deposit, and call metrics with various charts.
- **Staff Performance Check:** Individual staff metrics based on their associated deposits and calls, including daily, monthly, yearly breakdowns, performance status, and bonus calculations. Features advanced search and filter functionality:
  - Search by staff name or employee ID (case-insensitive)
  - Filter by role with dropdown selection
  - Combine search and filter for refined results
  - Shows count of matching staff members
  - Clear filters button to reset search and filter
  - Active filter badges display current search/filter criteria

## External Dependencies
- **Database:** PostgreSQL (Neon for cloud hosting).
- **ORM:** Drizzle ORM.
- **UI Libraries:** Shadcn UI, Radix UI.
- **Charting Library:** Recharts.
- **Icons:** Lucide React.
- **Date Utilities:** date-fns.
- **Session Management:** `express-session` with PostgreSQL store.
- **Validation Library:** Zod.
- **Google API:** `googleapis` for Google Sheets integration.