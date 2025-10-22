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
- **Data Management:** Full CRUD operations for Staff, Deposits, Call Reports, and Users (admin only).
- **Excel Integration:** Functionality for bulk importing staff, deposits, and call reports from `.xlsx` or `.xls` files, including sample template downloads and update capabilities for deposits. Excel templates and imports now include FTD Count and Deposit Count columns for deposits. **Date Handling:** Excel serial dates are converted using the formula `(serial - 25569) * 86400000` to Unix timestamps, then normalized to date-only strings (YYYY-MM-DD) to prevent timezone-related off-by-one errors.
- **Data Export:** CSV export for staff data.
- **Validation:** Zod schemas are used for robust data validation on all API endpoints.
- **Date Storage:** Staff joining dates are stored as date-only strings (YYYY-MM-DD) without timestamps, preventing timezone display issues across different regions.

**Feature Specifications:**
- **Authentication System:** Secure login, session management with role-based access control, protected routes, and logout. Sessions are stored in PostgreSQL for persistence and security.
- **Navigation:** Collapsible sidebar with main sections: Dashboard, Deposit Section, Call Reports, Staff Directory, Staff Performance Check, Analytics, and Settings.
- **Dashboard:** Provides an overview with date filtering (Today, Yesterday, This Week, Last Week, This Month, Last Month, By Month, All Time), dynamic month selection, and key business metrics (Total Calls, Total Deposit, Total FTD, Successful Calls, Conversion Rate). Includes quick access cards and action buttons.
- **Staff Directory:** Comprehensive staff management with CRUD operations, search, filtering (brand, role, status), Excel import/export, and responsive table/card views. The staff form includes:
  - **Employee ID** (disabled when editing - unique identifier)
  - **Name** (editable text field)
  - **Email** (disabled when editing - unique identifier)
  - **Role dropdown** with 9 fixed options: Manager, Assistant Manager, Team Leader, Junior Sales Executive, Sales Executive, Senior Sales Executive, QA, Group TL, Training Team
  - **Brand Name field** with 7 predefined options: JB BDT, BJ BDT, BJ PKR, JB PKR, NPR, SIX6'S BDT, SIX6'S PKR
  - **Country dropdown** with 11 country options: Cambodia, UAE, SRL, India, Bangladesh, Malaysia, Singapore, Thailand, Indonesia, Philippines, Pakistan
  - **Status dropdown**: Active/Inactive
  - **Joining Date** picker
  - **Date of Birth** picker (optional) - used for age calculation in staff profile
  - **Available Leave** field (optional) - tracks annual leave days available
  
  The filter section includes Brand Name, Role, and Status filters. The staff table displays Role as a badge (not Position). Employee ID and Email are protected during updates to maintain data integrity. Includes Excel/CSV import/export with proper field mapping.
  
  **Staff Profile View:** Each staff member has a detailed profile accessible via "View Profile" button in actions menu, displaying:
  - Professional photo with upload capability (supports JPEG, PNG, GIF up to 5MB)
  - Calculated age from date of birth
  - Available annual leave days
  - All staff information in organized card layout
  - Photo uploads stored in /public/uploads/staff-photos directory
- **Deposit Section:** Manages financial deposits with statistics, new deposit forms (including Staff Name, Type, Date, Brand Name, FTD Count, and Deposit Count fields), Excel import/update, and auto-generated reference numbers. Uses the same 7 fixed brand options as Staff Directory for consistency (JB BDT, BJ BDT, BJ PKR, JB PKR, NPR, SIX6'S BDT, SIX6'S PKR). Includes separate numerical tracking for FTD Count and Deposit Count to provide granular deposit metrics beyond the Type field.
- **Call Reports:** Tracks customer call activities with logging forms (user name, agent, phone, status, duration, type, remarks), statistics, and Excel import.
- **Analytics Dashboard:** Visualizes key HR and operational data with charts for department distribution, employee status, and hiring trends.
- **Settings Section:** Multi-section settings page including:
  - **Interface:** Theme selection (Light, Dark, Blue, Green, Purple), UI preferences (compact mode, animations, sidebar collapse)
  - **Notifications:** Email, push, and sound notification preferences
  - **Account:** Display user information and change password option
  - **User Management (Admin Only):** Role-based user administration with inline editing of user roles and status (Active/Deactivated). Admin users can view all system users and manage their access levels.

## External Dependencies
- **Database:** PostgreSQL (specifically Neon for cloud hosting) for persistent data storage.
- **ORM:** Drizzle ORM for database interaction.
- **UI Libraries:** Shadcn UI and Radix UI primitives.
- **Charting Library:** Recharts for data visualization.
- **Icons:** Lucide React for iconography.
- **Date Utilities:** date-fns for date manipulation and formatting.
- **Session Management:** `express-session` with a PostgreSQL store.
- **Validation Library:** Zod.
- **Google API:** `googleapis` package for Google Sheets integration and data synchronization.

## Google Sheets Integration
The system includes comprehensive Google Sheets integration for automatic data synchronization:

**Backend Implementation:**
- OAuth2 authentication flow with Google Sheets API
- Secure token storage in PostgreSQL database (`google_sheets_config` table)
- Automated sync service that pushes Staff, Deposits, and Call Reports to Google Sheets
- Separate sheets created for each data type within a single spreadsheet
- Admin-only API endpoints for authorization, spreadsheet linking, data sync, and connection management

**API Endpoints:**
- `GET /api/google-sheets/auth-url` - Generate OAuth authorization URL
- `GET /api/google-sheets/callback` - Handle OAuth callback and token storage
- `GET /api/google-sheets/status` - Check connection status and last sync time
- `POST /api/google-sheets/link-spreadsheet` - Link existing Google Sheets spreadsheet
- `POST /api/google-sheets/sync` - Manually trigger data synchronization
- `POST /api/google-sheets/disconnect` - Disconnect Google Sheets integration

**User Flow (URL-First Approach):**
1. User enters Google Sheets URL in the Deposit Section
2. User clicks "Connect" button to authorize with Google OAuth
3. After OAuth authorization, system automatically links the provided URL
4. User can then sync data to the linked spreadsheet

**Frontend Integration:**
- Google Sheets integration panel in Deposit Section with URL-first connection flow
- Auto-linking feature that connects spreadsheet after OAuth authorization
- Pending URL stored in localStorage during OAuth flow
- Manual sync button for on-demand data updates
- Connection status display with last sync timestamp

**Environment Variables Required:**
- `GOOGLE_CLIENT_ID` - Google OAuth2 client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth2 client secret
- `GOOGLE_REDIRECT_URI` - OAuth callback URL (auto-generated based on domain)

**Data Synced to Google Sheets:**
- **Staff Sheet:** All staff information including Employee ID, Name, Email, Role, Brand, Country, Status, Joining Date, Date of Birth, Available Leave
- **Deposits Sheet:** All deposit records including Staff Name, Type, Date, Brand Name, FTD Count, Deposit Count
- **Call Reports Sheet:** All call reports including User Name, Agent, Date/Time, Status, Phone, Duration, Remarks, Type