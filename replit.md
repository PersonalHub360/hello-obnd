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
- **Interactive Elements:** Features a collapsible sidebar navigation with vibrant, colorful menu icons (Dashboard-blue, Deposit Section-green, Staff Directory-purple, Staff Performance Check-orange, Analytics-pink, Settings-slate). Each icon is displayed in a rounded colored background for visual distinction. The sidebar header features a gradient logo (blue to purple) and the user profile section includes gradient styling. The login page incorporates a glassmorphism design with animated backgrounds.
- **Theming:** Supports 5 theme options (Light, Dark, Blue, Green, Purple) with persistent user preference stored in localStorage. Sidebar colors automatically adapt to the selected theme using CSS variables.
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
- **Dashboard:** Overview with comprehensive date filtering and 8 key business metrics. **Date Filters:** Today, Yesterday, This Week, Last Week, This Month, Last Month, By Date (custom date picker), By Month (month/year selection), All Time. **Business Metrics Cards:** Total Calls, Total Deposit, Total FTD, Successful Calls (green), Unsuccessful Calls (orange), Failed Calls (red), Total Bonus (calculated as FTD Count × $1 + Deposit Count × $1.5), and Conversion Rate (Successful Calls / Total FTD × 100%). All metrics are connected to Deposit Section data for real-time synchronization. Grid layout optimized for 8 cards (xl:grid-cols-4).
- **Staff Directory:** Comprehensive staff management with CRUD, bulk delete, search, filtering, Excel import/export. Staff form includes Employee ID, Name, Email, Role dropdown (10 fixed options), Brand Name (7 predefined options), Country (11 options), Status, Joining Date, Date of Birth (optional), Available Leave (optional). Staff profiles display photo upload, calculated age, and available leave.
- **Deposit Section:** Manages financial deposits with comprehensive statistics dashboard. New deposit forms include Staff Name (searchable dropdown), FTD (Yes/No), Deposit (Yes/No), Date, Brand Name (7 fixed options), FTD Count, Deposit Count, Total Calls, Successful Calls, Unsuccessful Calls, Failed Calls. Deposits support full CRUD operations (Create, Read/View, Update/Edit, Delete). Features bulk selection and deletion. **Statistics Cards:** Displays 8 real-time metrics including Total Depositor's, FTD Count, Deposit Count, Total Bonus (calculated as FTD Count × $1 + Deposit Count × $1.5), Total Calls, Successful Calls (green), Unsuccessful Calls (orange), and Failed Calls (red). **Staff Filter:** Search and filter deposits by staff name with URL parameter support for direct navigation from Performance Check.
- **Analytics Dashboard:** Visualizes HR and operational data with charts for department distribution, employee status, hiring trends, etc.
- **Settings Section:** Multi-section settings including Interface (theme selection, UI preferences), Notifications, Account, and User Management (Admin Only).
    - **User Management (Admin Only):** Role-based user administration with inline editing of user roles and status. Add new users with username, name, email, password, and role selection (8 predefined roles). Protected by backend `requireAdmin` middleware.
    - **Access Permissions by Role:** Comprehensive permission matrix displaying access levels for all user roles (Admin, Senior Manager/Department Head, Manager/Team Leader, User/Supervisor/Assistant Leader). Uses green checkmark icons for granted permissions and red X icons for denied permissions. Provides clear visibility into role-based access control across all system features including User Management, Staff Management, Deposit Management, Call Reports, Analytics, Google Sheets Integration, System Settings, and Excel Import/Export.

**Data Interconnection:**
- **Real-Time Data Synchronization:** All sections query the same backend APIs. Changes in one module (e.g., Staff Directory) immediately reflect in others (e.g., Analytics).
- **Shared Data Schema:** Staff, Deposit, and Call Report data are interconnected and used across multiple modules for consistent reporting and calculations.
- **Consistent Calculations:** Identical calculation logic for metrics like FTD Count, Deposit Count, Bonus Formula (FTD Count × $1 + Deposit Count × $1.5), and Conversion Rate (Successful Calls / Total FTD × 100%) across all pages.
- **Dashboard Metrics:** Real-time metrics based on call reports and deposit data.
- **Analytics Dashboard:** Provides comprehensive staff, deposit, and call metrics with various charts.
- **Staff Performance Check:** Individual staff metrics based on their associated deposits and calls, including daily, monthly, yearly breakdowns, performance status, and bonus calculations. Features advanced search and filter functionality:
  - Search by staff name or employee ID (case-insensitive)
  - Filter by role with dropdown selection
  - Combine search and filter for refined results
  - Shows count of matching staff members
  - Clear filters button to reset search and filter
  - Active filter badges display current search/filter criteria
  - **Daily View Options:** Toggle between Today and Yesterday performance metrics
  - **Monthly Custom Date:** Calendar date picker for selecting any custom month/year alongside standard month/year dropdowns
  - **Connected to Deposit Section:** "View Deposits" button navigates to Deposit Section with pre-filled staff filter via URL parameter

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