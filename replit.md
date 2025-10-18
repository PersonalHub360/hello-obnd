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
  - `dashboard.tsx` - Staff directory and management
- **Components**:
  - `theme-provider.tsx` - Dark/light mode management
  - `theme-toggle.tsx` - Theme switch button
  - `ui/` - Shadcn UI components (Button, Card, Input, Table, etc.)

### Backend (`server/`)
- **Routes** (`routes.ts`):
  - `POST /api/auth/login` - User authentication
  - `POST /api/auth/logout` - Session termination
  - `GET /api/auth/session` - Check authentication status
  - `GET /api/staff` - Retrieve all staff members (protected)
  - `GET /api/staff/:id` - Get staff member by ID (protected)
- **Storage** (`storage.ts`): In-memory data storage with seeded sample data

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
- **Backend**: Express.js, TypeScript
- **Session**: express-session with in-memory storage
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
- Fixed critical React rendering issue with authentication redirects
- Implemented proper session error handling with useEffect
- Added query guards to prevent unauthorized API calls
- Fixed TypeScript type issues in storage and routes
- All LSP diagnostics resolved
- End-to-end tests passing successfully

## User Preferences
- Professional corporate aesthetic
- Clean, modern interface design
- Emphasis on data clarity and usability
- Responsive across all device sizes

## Next Steps (Future Enhancements)
- Add CRUD operations for staff (create, edit, delete)
- Implement employee detail view with full profile
- Add department and role filtering
- Export staff data to CSV
- Employee performance metrics dashboard
- User registration and password reset
- Profile picture upload functionality
- Pagination for large staff lists
