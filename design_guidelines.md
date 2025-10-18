# Staff Management System - Design Guidelines

## Design Approach
**Selected Framework:** Design System Approach - Material Design principles with modern SaaS aesthetics (Linear/Notion-inspired typography, Stripe-inspired restraint)

**Justification:** Staff management is utility-focused requiring efficiency, data clarity, and professional credibility. Material Design provides robust patterns for forms and data tables while maintaining visual polish.

**Key Principles:**
- Clarity over decoration
- Efficient data hierarchy
- Professional trustworthiness
- Scannable information architecture

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 221 83% 53% (Professional blue - trust/corporate)
- Background: 0 0% 100% (Pure white)
- Surface: 220 13% 97% (Subtle gray for cards)
- Border: 220 13% 91% (Gentle dividers)
- Text Primary: 222 47% 11% (Near black)
- Text Secondary: 215 16% 47% (Muted slate)
- Success: 142 71% 45% (Green for active status)
- Warning: 38 92% 50% (Amber for alerts)
- Error: 0 84% 60% (Red for critical)

**Dark Mode:**
- Primary: 221 83% 53% (Same blue for consistency)
- Background: 222 47% 11% (Deep charcoal)
- Surface: 217 33% 17% (Elevated surfaces)
- Border: 217 19% 27% (Subtle dividers)
- Text Primary: 210 40% 98% (Near white)
- Text Secondary: 215 20% 65% (Muted light)

### B. Typography

**Font Stack:**
- Primary: 'Inter' (Google Fonts) - Clean, professional, excellent readability
- Monospace: 'JetBrains Mono' - For email addresses, IDs

**Hierarchy:**
- Page Titles: text-3xl font-semibold (Dashboard headers)
- Section Headers: text-xl font-semibold (Table titles)
- Body Text: text-base font-normal (Form labels, table data)
- Small Text: text-sm (Helper text, meta information)
- Micro Text: text-xs (Timestamps, status badges)

### C. Layout System

**Spacing Primitives:** Strict adherence to 4, 8, 16, 24, 32 units
- Micro spacing: p-2, gap-2 (8px)
- Standard spacing: p-4, gap-4, m-4 (16px)
- Section spacing: p-6, py-8 (24-32px)
- Page margins: p-8, px-12 (32-48px)

**Grid System:**
- Login Page: Centered max-w-md (28rem) container
- Dashboard: Full-width with max-w-7xl content area
- Forms: Single column, max-w-sm for inputs
- Tables: Full-width responsive with horizontal scroll on mobile

### D. Component Library

**Login Page Components (Glass Effect Design):**
1. **Background**
   - Animated gradient overlay with multiple layers
   - Floating orbs with blur effects for depth
   - Gradient colors: Primary blue, purple, pink, cyan, teal
   - Animated pulse effects for dynamic feel

2. **Glass Card**
   - Centered vertically and horizontally
   - Semi-transparent background with backdrop blur (backdrop-blur-xl)
   - Background: bg-white/40 (light) or bg-gray-900/40 (dark)
   - Border: border-white/20 (light) or border-gray-700/30 (dark)
   - Rounded corners: rounded-2xl
   - Shadow: shadow-2xl for elevation
   - Padding: p-8
   - Max width: max-w-md
   - Glow effect underneath card

3. **Logo/Branding**
   - Gradient logo container (h-16 w-16)
   - Background: gradient from primary to primary/80
   - Rounded: rounded-2xl with shadow
   - Company name: Gradient text (primary → purple → pink)
   - Text effect: bg-gradient-to-r with bg-clip-text
   - Subtitle: "Staff Management System" with reduced opacity

4. **Input Fields**
   - Email and password fields with glass effect
   - Background: bg-white/50 (light) or bg-gray-800/50 (dark)
   - Backdrop blur on inputs for consistency
   - Border: border-white/30 (light) or border-gray-700/50 (dark)
   - Focus state: border-primary/50 with ring-primary/20
   - Password toggle icon in absolute position
   - Height: h-12 (48px for better touch targets)
   - Placeholder text in text-secondary

5. **Login Button**
   - Full width (w-full)
   - Gradient background: from-primary to-primary/90
   - Height: h-12
   - Font: font-semibold
   - Shadow: shadow-lg with shadow-xl on hover
   - Smooth transitions for all states
   - Loading state with "Signing in..." text

6. **Helper Links**
   - "Forgot password?" link (text-sm text-primary)
   - Font: font-medium
   - Hover state with reduced opacity
   - Positioned below form with top margin

**Dashboard Components:**
1. **Top Navigation Bar**
   - Fixed/sticky at top
   - Background: surface color with border-b
   - Height: h-16
   - Contains: Logo, navigation items, user profile dropdown
   - Logout button in profile dropdown

2. **Staff Data Table**
   - Striped rows (alternate background)
   - Sticky header row
   - Columns: Avatar, Full Name, Role, Department, Email, Status, Actions
   - Row hover state (subtle background change)
   - Padding: py-3 px-4 for cells
   - Border-b on rows

3. **Status Badges**
   - Rounded-full pill shape
   - Active: success color background (bg-success/10 text-success)
   - Inactive: gray (bg-gray-200 text-gray-700)
   - Font: text-xs font-medium
   - Padding: px-3 py-1

4. **Action Buttons**
   - Icon buttons (Edit, Delete, View)
   - Size: w-8 h-8
   - Hover: subtle background (hover:bg-gray-100)
   - Icons from Heroicons (outline style)

5. **Search & Filters**
   - Search bar: w-full md:w-80 with search icon
   - Filter dropdowns: Department, Role, Status
   - Clear filters button

6. **Employee Cards (Mobile Alternative)**
   - Stack on mobile viewports
   - Card per employee with all info
   - Rounded: rounded-lg
   - Padding: p-4
   - Gap: gap-2 between info rows

### E. Interactions

**Minimal Animations:**
- Button hover: Slight brightness shift (transition-all duration-150)
- Input focus: Ring appearance (transition-shadow duration-150)
- Table row hover: Background change (transition-colors duration-100)
- Dropdown open/close: Fade in/out (transition-opacity duration-200)

**No complex animations** - Prioritize performance and accessibility

## Images

**Login Page Background (Optional Enhancement):**
- Abstract gradient mesh or subtle geometric pattern
- Corporate office/teamwork image with 60% opacity overlay
- Position: Full viewport background with fixed attachment
- Login card: Elevated with higher z-index and stronger shadow

**Dashboard:**
- User avatars in table (circular, w-10 h-10)
- Default avatar for missing images (initials in colored circle)
- No hero images required

## Accessibility

- All inputs have associated labels
- Color contrast meets WCAG AA standards (4.5:1 minimum)
- Focus indicators visible on all interactive elements
- Dark mode maintains same contrast ratios
- Touch targets minimum 44x44px
- Semantic HTML (proper heading hierarchy, table structure)