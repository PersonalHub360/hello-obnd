# AuroraMY Staff Management System

## Overview
A professional staff management web application with secure authentication and a beautiful, responsive dashboard interface. Built with React, Express, and TypeScript.

## Features Implemented

### Authentication System
- **Secure Login Page**: Clean, professional design with email and password inputs
- **Session Management**: Cookie-based sessions with 24-hour expiration
- **Protected Routes**: Dashboard requires authentication, automatic redirect to login
- **Logout Functionality**: Graceful logout with session cleanup

### Staff Management Dashboard
- **Staff Directory**: Displays all team members in a professional table layout
- **Responsive Design**: Table view on desktop, card layout on mobile devices
- **Search Functionality**: Real-time search by name, email, department, or role
- **Staff Information**: Avatar, name, role, department, email, phone, status, join date
- **Status Badges**: Visual indicators for active/inactive staff members
- **Color-coded Avatars**: Unique background colors with initials fallback
- **CRUD Operations**: Create, edit, and delete staff members with dialog forms
- **Filtering**: Filter staff by department, role, and status with dropdown selectors
- **CSV Export**: Download staff data as CSV file with proper field quoting

### Employee Detail View
- **Detailed Profile**: Full employee information on dedicated page
- **Navigation**: Click on staff member from dashboard to view details
- **Actions**: Edit or delete employee directly from detail view
- **Professional Layout**: Card-based design with organized sections

### Analytics Dashboard
- **Overview Statistics**: Total employees, active/inactive counts, recent hires, departments
- **Department Distribution**: Interactive pie chart showing staff by department
- **Employee Status**: Pie chart visualizing active vs inactive employees
- **Hiring Trends**: Bar chart showing new hires over last 6 months
- **Navigation**: Accessible via Analytics button in dashboard header

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
  - `dashboard.tsx` - Staff directory with CRUD operations, filtering, and search
  - `staff-detail.tsx` - Individual employee detail view
  - `analytics.tsx` - Analytics dashboard with charts and statistics
- **Components**:
  - `theme-provider.tsx` - Dark/light mode management
  - `theme-toggle.tsx` - Theme switch button
  - `ui/` - Shadcn UI components (Button, Card, Input, Table, Dialog, etc.)

### Backend (`server/`)
- **Routes** (`routes.ts`):
  - `POST /api/auth/login` - User authentication
  - `POST /api/auth/logout` - Session termination
  - `GET /api/auth/session` - Check authentication status
  - `GET /api/staff` - Retrieve all staff members with optional filters (protected)
  - `GET /api/staff/:id` - Get staff member by ID (protected)
  - `POST /api/staff` - Create new staff member (protected)
  - `PATCH /api/staff/:id` - Update staff member (protected)
  - `DELETE /api/staff/:id` - Delete staff member (protected)
  - `GET /api/staff/export/csv` - Export staff data as CSV (protected)
- **Database** (`db/`): PostgreSQL with Drizzle ORM for data persistence
- **Storage** (`storage.ts`): Database storage interface with seed data

### Shared (`shared/`)
- **Schema** (`schema.ts`): TypeScript types and Zod validation schemas for Staff and Auth

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
- **Database Migration**: Migrated from in-memory storage to PostgreSQL with Drizzle ORM
- **CRUD Operations**: Added full create, edit, delete functionality for staff members
- **Filtering System**: Implemented department, role, and status filters
- **Employee Details**: Created dedicated detail view page for individual staff members
- **CSV Export**: Added data export functionality with proper field quoting
- **Analytics Dashboard**: Built comprehensive analytics page with Recharts visualizations
- **Navigation**: Added Analytics button in dashboard header for easy access
- All features tested with end-to-end Playwright tests
- All LSP diagnostics resolved

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
- Bulk import of staff data from CSV
- Performance reviews and ratings system
- Time-off tracking and vacation management
- Organizational chart visualization
