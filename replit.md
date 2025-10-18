# AuroraMY Staff Management System

## Overview
A professional staff management web application with secure authentication and a beautiful, responsive dashboard interface. Built with React, Express, and TypeScript.

## Features Implemented

### Authentication System
- **Secure Login Page**: Clean, professional design with email and password inputs
- **Session Management**: Cookie-based sessions with 24-hour expiration
- **Protected Routes**: All pages require authentication, automatic redirect to login
- **Logout Functionality**: Graceful logout with session cleanup via user menu

### Navigation System
- **Collapsible Sidebar**: Professional sidebar navigation using Shadcn UI primitives
- **5 Main Sections**:
  - Dashboard - Overview with quick stats and links
  - Deposit Section - Financial deposit management
  - Call Reports - Customer call tracking and reporting
  - Staff Directory - Complete staff management system
  - Analytics - Charts and statistics
- **Active State Indicators**: Visual feedback for current page
- **User Menu**: Header-based menu with user info and logout
- **Theme Toggle**: Quick access to dark/light mode switcher
- **Responsive**: Sidebar collapses on smaller screens

### Dashboard (Overview)
- **Date Filtering**: Select from Today, Yesterday, This Week, Last Week, This Month, Last Month, or All Time
- **Business Metrics** (filtered by selected date range):
  - **Total Calls**: Count of all call activities in the period
  - **Total Deposit**: Sum of all deposit amounts with transaction count
  - **Total FTD**: Unique depositors (First Time Deposit tracking)
  - **Successful Calls**: Count of completed calls
  - **Conversion Rate**: Success ratio calculated as (Successful Calls / (FTD + Deposits)) × 100%
- **Staff Overview**: Total staff, active employees, departments, average team size
- **Quick Access Cards**: Clickable cards linking to main sections with descriptions
- **Quick Actions**: Fast access buttons for common operations across all sections
- **Real-time Metrics**: All statistics update automatically when date filter changes

### Staff Directory
- **Complete CRUD**: Create, edit, and delete staff members with dialog forms
- **Search**: Real-time search by name, email, department, or role
- **Filtering**: Filter by department, role, and status with dropdown selectors
- **Excel Import**: Bulk upload new employees from Excel files (.xlsx or .xls)
- **Sample Template**: Downloadable Excel template with proper column headers and sample data
- **CSV Export**: Download staff data as properly formatted CSV
- **Table/Card Views**: Responsive table view on desktop, card layout on mobile
- **Color-coded Avatars**: Unique background colors with initials fallback
- **Status Badges**: Visual indicators for active/inactive staff members

### Deposit Section
- **Deposit Tracking**: View and manage all financial deposits from database
- **Statistics Cards**: Total deposits, pending count, completed today
- **New Deposit Form**: Record new deposits with type, amount, depositor
- **Excel Import**: Bulk upload new deposits from Excel files (.xlsx or .xls)
- **Excel Update Import**: Update existing deposits by uploading Excel file with reference numbers
- **Sample Template**: Downloadable Excel template with proper column headers and sample data
- **Transaction Table**: Recent deposits with status, reference numbers, and amounts
- **Auto-generated References**: Unique reference numbers (REF-YYYY-XXXXXXX format)
- **Reference Matching**: Update operations match deposits by reference number for accurate updates
- **Real-time Updates**: Statistics and table refresh after create/import/update operations

### Call Reports
- **Call Logging**: Track all customer call activities with comprehensive details
- **Statistics Cards**: Total calls, completed count, follow-ups needed, average duration
- **Enhanced Call Form**: Log calls with user name, call agent name, phone number, call status, duration, call type, and remarks
- **Excel Import**: Bulk upload call reports from Excel files (.xlsx or .xls)
- **Sample Template**: Downloadable Excel template with proper column headers
- **Status Tracking**: Completed, follow-up required, missed call statuses with visual badges
- **Call History**: Detailed table view of all call reports with timestamps, user info, and agent names
- **Database Persistence**: All call reports stored in PostgreSQL with full CRUD operations
- **Real-time Updates**: Statistics and table refresh automatically after create/import operations

### Employee Detail View
- **Detailed Profile**: Full employee information on dedicated page
- **Navigation**: Click on staff member from directory to view details
- **Actions**: Edit or delete employee directly from detail view
- **Professional Layout**: Card-based design with organized sections

### Analytics Dashboard
- **Overview Statistics**: Total employees, active/inactive counts, recent hires, departments
- **Department Distribution**: Interactive pie chart showing staff by department
- **Employee Status**: Pie chart visualizing active vs inactive employees
- **Hiring Trends**: Bar chart showing new hires over last 6 months

### User Interface
- **Theme Toggle**: Light/dark mode with persistent preference
- **Professional Design**: Material Design-inspired with corporate blue color scheme
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Loading States**: Beautiful loading indicators during data fetching
- **Error Handling**: Graceful error messages and user feedback via toasts

## Project Structure

### Frontend (`client/`)
- **Pages**:
  - `login.tsx` - Authentication page
  - `dashboard.tsx` - Overview dashboard with quick stats and navigation
  - `staff-directory.tsx` - Staff management with CRUD operations, filtering, and search
  - `staff-detail.tsx` - Individual employee detail view
  - `deposits.tsx` - Deposit section with transaction management
  - `call-reports.tsx` - Call reports tracking and logging
  - `analytics.tsx` - Analytics dashboard with charts and statistics
- **Components**:
  - `app-sidebar.tsx` - Main sidebar navigation component
  - `theme-provider.tsx` - Dark/light mode management
  - `theme-toggle.tsx` - Theme switch button
  - `ui/` - Shadcn UI components (Button, Card, Input, Table, Dialog, Sidebar, etc.)

### Backend (`server/`)
- **Routes** (`routes.ts`):
  - `POST /api/auth/login` - User authentication
  - `POST /api/auth/logout` - Session termination
  - `GET /api/auth/session` - Check authentication status
  - `GET /api/staff` - Retrieve all staff members with optional filters (protected)
  - `GET /api/staff/:id` - Get staff member by ID (protected)
  - `POST /api/staff` - Create new staff member (protected)
  - `POST /api/staff/import/excel` - Import new staff members from Excel file (protected)
  - `GET /api/staff/sample/template` - Download sample Excel template (protected)
  - `PATCH /api/staff/:id` - Update staff member (protected)
  - `DELETE /api/staff/:id` - Delete staff member (protected)
  - `GET /api/staff/export/csv` - Export staff data as CSV (protected)
  - `GET /api/deposits` - Retrieve all deposits (protected)
  - `GET /api/deposits/:id` - Get deposit by ID (protected)
  - `POST /api/deposits` - Create new deposit (protected)
  - `POST /api/deposits/import/excel` - Import new deposits from Excel file (protected)
  - `POST /api/deposits/import/excel/update` - Update existing deposits from Excel by reference number (protected)
  - `GET /api/deposits/sample/template` - Download sample Excel template (protected)
  - `PATCH /api/deposits/:id` - Update deposit (protected)
  - `DELETE /api/deposits/:id` - Delete deposit (protected)
  - `GET /api/call-reports` - Retrieve all call reports (protected)
  - `GET /api/call-reports/:id` - Get call report by ID (protected)
  - `POST /api/call-reports` - Create new call report (protected)
  - `POST /api/call-reports/import/excel` - Import call reports from Excel file (protected)
  - `GET /api/call-reports/sample/template` - Download sample Excel template (protected)
  - `PATCH /api/call-reports/:id` - Update call report (protected)
  - `DELETE /api/call-reports/:id` - Delete call report (protected)
- **Database** (`db/`): PostgreSQL with Drizzle ORM for data persistence
- **Storage** (`storage.ts`): Database storage interface with CRUD operations

### Shared (`shared/`)
- **Schema** (`schema.ts`): TypeScript types and Zod validation schemas for Staff, Auth, Deposits, and Call Reports

## Login Credentials
- **Email**: james.bond@auroramy.com
- **Password**: Sp123456@

## Sample Staff Data
The system includes 10 pre-seeded staff members across various departments:
- Engineering (Sarah Johnson, David Kim)
- Product (Michael Chen)
- Design (Emily Rodriguez)
- Marketing (Jessica Martinez, Nicole Anderson)
- Analytics (Ryan Patel)
- Human Resources (Amanda Williams)
- Sales (Christopher Taylor)
- Executive (James Bond - CEO)

## Technical Stack
- **Frontend**: React 18, TypeScript, Wouter (routing), TanStack Query
- **UI Components**: Shadcn UI with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Charts**: Recharts for data visualization
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Session**: express-session with PostgreSQL store
- **Validation**: Zod schemas
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## Design System
- **Primary Color**: Professional Blue (HSL: 221 83% 53%)
- **Typography**: Inter (sans-serif), JetBrains Mono (monospace)
- **Spacing**: Consistent 4/8/16/24/32px scale
- **Shadows**: Subtle elevation system for cards and modals
- **Animations**: Smooth transitions for hover/focus states

## Recent Changes
- **Glass Effect Login Page**: Redesigned login page with glassmorphism design featuring backdrop blur, semi-transparent card, animated gradient backgrounds, floating blur orbs, and gradient text effects
- **Staff Performance Check**: Added new performance tracking feature with daily/monthly/yearly metrics, conversion ratio calculation, bonus amount calculation (FTD = $1, Deposit = $1.5), and color-coded status indicators (Good/Average/Bad)
- **Staff Directory Excel Import**: Added bulk upload feature for staff members from Excel files (.xlsx or .xls) with sample template download
- **Deposit Excel Features**: Added sample template download and Excel update import (matches by reference number) with validation
- **Dashboard Enhancements**: Added date filtering (Today, Yesterday, This Week, Last Week, This Month, Last Month, All Time) and comprehensive business metrics
- **Business Metrics**: Total Calls, Total Deposit, Total FTD (unique depositors), Successful Calls, and Conversion Rate with real-time filtering
- **Call Reports Excel Import**: Added bulk upload feature with enhanced schema (userName, callAgentName, dateTime, callStatus, phoneNumber, duration, callType, remarks)
- **Call Reports Database Integration**: Full PostgreSQL persistence with call_reports table
- **Call Reports CRUD API**: Complete backend routes for creating, reading, updating, and deleting call reports
- **Sample Excel Template**: Downloadable template with proper column headers for easy bulk imports
- **Enhanced Call Form**: Comprehensive form fields including user name, agent name, phone, status, duration, type, and remarks
- **Excel Import for Deposits**: Added bulk upload feature for deposits from Excel files
- **Deposit Database Integration**: Migrated deposits from sample data to PostgreSQL
- **Deposit CRUD API**: Full backend routes for creating, reading, updating, and deleting deposits
- **Auto-generated References**: Automatic unique reference number generation for new deposits
- **Real-time Statistics**: Both deposits and call reports statistics update automatically after operations
- **Sidebar Navigation**: Implemented professional collapsible sidebar with 5 main sections
- **New Sections**: Added Deposit Section and Call Reports pages with full interfaces
- **Reorganized Dashboard**: Created overview dashboard with quick stats and section cards
- **Renamed Pages**: Staff management moved to dedicated Staff Directory section
- **Layout Improvements**: All pages now use consistent sidebar layout
- **User Menu**: Moved logout and user info to header-based dropdown menu
- Database Migration: PostgreSQL with Drizzle ORM
- Full CRUD operations for staff members, deposits, and call reports
- Department, role, and status filtering
- CSV export with proper field quoting
- Analytics with Recharts visualizations
- All features tested with end-to-end Playwright tests

## User Preferences
- Professional corporate aesthetic
- Clean, modern interface design
- Emphasis on data clarity and usability
- Responsive across all device sizes

## Future Enhancements (Optional)
- User registration and multi-user authentication
- Password reset functionality
- Profile picture upload with image storage
- Pagination for large staff lists
- Advanced role-based permissions (admin vs viewer)
- Email notifications for new hires
- Performance reviews and ratings system
- Time-off tracking and vacation management
- Organizational chart visualization
