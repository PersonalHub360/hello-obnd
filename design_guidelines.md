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

**Login Page Components:**
1. **Login Card**
   - Centered vertically and horizontally
   - White/dark surface with subtle shadow (shadow-lg)
   - Rounded corners (rounded-xl)
   - Padding: p-8 to p-12
   - Max width: max-w-md

2. **Logo/Branding**
   - Top of card or separate above
   - Company name: "AuroraMY" in primary color
   - Subtitle: "Staff Management System" in text-secondary

3. **Input Fields**
   - Email field with type="email"
   - Password field with toggle visibility icon
   - Label above input (text-sm font-medium)
   - Full width inputs with border focus:ring-2 ring-primary
   - Placeholder text in text-secondary
   - Height: h-11 (44px for touch targets)

4. **Login Button**
   - Full width (w-full)
   - Primary color background
   - Height: h-11
   - Rounded: rounded-lg
   - Font: font-medium
   - Hover state with brightness adjustment

5. **Helper Links**
   - "Forgot password?" link (text-sm text-primary)
   - Positioned below password field or button

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