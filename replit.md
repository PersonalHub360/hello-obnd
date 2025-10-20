# AuroraMY Staff Management System

## Overview
AuroraMY is a professional staff management web application designed to streamline human resources and operational workflows. It provides secure authentication, a responsive dashboard, and robust tools for managing staff, tracking financial deposits, logging customer call reports, and analyzing key business metrics. The system aims to enhance organizational efficiency, provide clear insights into staff performance, and support data-driven decision-making within a corporate environment.

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
- **Interactive Elements:** Features a collapsible sidebar navigation with a stunning blue-to-purple gradient background, floating blur orbs, glassmorphism effects, and glowing active states. The login page also incorporates a glassmorphism design with animated backgrounds.
- **Theming:** Supports 5 theme options (Light, Dark, Blue, Green, Purple) with persistent user preference stored in localStorage. Each theme provides a complete color scheme with carefully designed contrast and readability. The gradient sidebar maintains consistent appearance across all themes.
- **User Feedback:** Includes loading states and toast notifications for error handling and user feedback.

**Technical Implementations:**
- **Frontend:** Developed with React 18 and TypeScript, utilizing Wouter for routing, TanStack Query for data fetching, and Shadcn UI (built on Radix UI primitives) for components. Recharts is used for data visualization.
- **Backend:** Implemented using Express.js and TypeScript, providing RESTful APIs for all functionalities.
- **Authentication:** Secure server-side session management using express-session with PostgreSQL storage (connect-pg-simple). Sessions include user role for authorization. Supports role-based access control with admin and user roles.
- **Authorization:** Two-tier middleware system:
  - `requireAuth`: Protects routes requiring any authenticated user
  - `requireAdmin`: Restricts routes to users with admin role
- **Data Management:** Full CRUD operations for Staff, Deposits, Call Reports, Users, Roles, and Departments (admin only).
- **Excel Integration:** Functionality for bulk importing staff, deposits, and call reports from `.xlsx` or `.xls` files, including sample template downloads and update capabilities for deposits.
- **Data Export:** CSV export for staff data.
- **Validation:** Zod schemas are used for robust data validation on all API endpoints.

**Feature Specifications:**
- **Authentication System:** Secure login, session management with role-based access control, protected routes, and logout. Sessions are stored in PostgreSQL for persistence and security.
- **Navigation:** Collapsible sidebar with main sections: Dashboard, Deposit Section, Call Reports, Staff Directory, Staff Performance Check, Analytics, and Settings.
- **Dashboard:** Provides an overview with date filtering (Today, Yesterday, This Week, Last Week, This Month, Last Month, By Month, All Time), dynamic month selection, and key business metrics (Total Calls, Total Deposit, Total FTD, Successful Calls, Conversion Rate). Includes quick access cards and action buttons.
- **Staff Directory:** Comprehensive staff management with CRUD operations, search, filtering (department, role, status), Excel import/export, and responsive table/card views. Includes a detailed employee profile view.
- **Deposit Section:** Manages financial deposits with statistics, new deposit forms, Excel import/update, and auto-generated reference numbers.
- **Call Reports:** Tracks customer call activities with logging forms (user name, agent, phone, status, duration, type, remarks), statistics, and Excel import.
- **Analytics Dashboard:** Visualizes key HR and operational data with charts for department distribution, employee status, and hiring trends.
- **Settings Section:** Multi-section settings page including:
  - **Interface:** Theme selection (Light, Dark, Blue, Green, Purple), UI preferences (compact mode, animations, sidebar collapse)
  - **Notifications:** Email, push, and sound notification preferences
  - **Account:** Display user information and change password option
  - **User Management (Admin Only):** Role-based user administration with inline editing of user roles and status (Active/Deactivated). Admin users can view all system users and manage their access levels.
  - **Role Management (Admin Only):** Configure and manage available roles in the system. Supports full CRUD operations (Create, Read, Update, Delete) with role names and descriptions. Default roles include Manager, Senior Developer, Developer, Designer, HR Specialist, and Sales Executive.
  - **Department Management (Admin Only):** Configure and manage organizational departments. Supports full CRUD operations with department names and descriptions. Default departments include Engineering, Human Resources, Sales, Marketing, Finance, and Operations.

## External Dependencies
- **Database:** PostgreSQL (specifically Neon for cloud hosting) for persistent data storage.
- **ORM:** Drizzle ORM for database interaction.
- **UI Libraries:** Shadcn UI and Radix UI primitives.
- **Charting Library:** Recharts for data visualization.
- **Icons:** Lucide React for iconography.
- **Date Utilities:** date-fns for date manipulation and formatting.
- **Session Management:** `express-session` with a PostgreSQL store.
- **Validation Library:** Zod.