# SmartCampus — UI Design System
### Version 1.0  |  ERP-Grade College Portal

---

## 1. DESIGN PHILOSOPHY

**Aesthetic Direction: Refined Institutional**

SmartCampus sits at the intersection of authoritative and approachable. It must feel trustworthy
enough for administrators and HODs, while remaining clear and fast for students accessing
it daily. The design language borrows from modern enterprise SaaS products — dense but
structured, with white space used deliberately rather than decoratively.

**Core Principles**

| Principle        | Expression                                                              |
|------------------|-------------------------------------------------------------------------|
| Clarity First    | Every screen has one primary action. No ambiguity in hierarchy.         |
| Data-Dense Calm  | Tables and lists fill space efficiently without feeling chaotic.         |
| Structured Trust | Consistent grid, predictable patterns — users learn the system once.   |
| Role Awareness   | Each role sees only what it needs. UI shifts tone by permission level.  |
| Accessible Speed | Fast visual parsing. Color + icon + label — never color alone.         |

---

## 2. COLOR PALETTE

### Primary Brand

```
Blue-900   #0D47A1    Used for: logo, primary CTA backgrounds, active sidebar items
Blue-800   #1565C0    Used for: primary buttons, focused states, key highlights
Blue-700   #1976D2    Used for: button hover states, links
Blue-600   #1E88E5    Used for: secondary accents, icon fills
Blue-100   #BBDEFB    Used for: selected row backgrounds, tag fills
Blue-050   #E3F2FD    Used for: hover backgrounds, subtle callouts
```

### Neutral Foundation

```
Neutral-000   #FFFFFF    Page background, card surfaces
Neutral-025   #F8FAFF    Alternate row background, input fill
Neutral-050   #F0F4FF    Sidebar background, section dividers
Neutral-100   #E3EAF4    Borders, dividers, skeleton loaders
Neutral-200   #C8D4E8    Disabled borders, inactive elements
Neutral-400   #8A9BBF    Placeholder text, secondary icons
Neutral-600   #546E7A    Secondary body text, captions, metadata
Neutral-800   #1E2A3A    Primary headings, table header text
Neutral-900   #0D1B2A    Display text, high-contrast labels
```

### Semantic Colors

```
Success-700   #2E7D32    Approved status, active badge text
Success-100   #C8E6C9    Approved status background
Success-050   #F1F8E9    Success alert background

Warning-700   #F57C00    Pending, in-progress, maintenance text
Warning-100   #FFE0B2    Pending badge background
Warning-050   #FFF8E1    Warning alert background

Error-700     #C62828    Rejected, critical, delete actions
Error-100     #FFCDD2    Rejected badge background
Error-050     #FFF5F5    Error alert background

Info-700      #0277BD    System, informational messages
Info-100      #B3E5FC    Info badge background
Info-050      #E1F5FE    Info alert background
```

### Role Identity Colors

Each role carries a signature accent applied to their avatar, sidebar header badge,
and dashboard welcome banner.

```
Student    #1565C0   (Primary blue)
Faculty    #00838F   (Teal)
HOD        #EF6C00   (Amber)
Admin      #B71C1C   (Deep red)
```

### Gradient Library

```
Banner — Admin
  linear-gradient(135deg, #0D47A1 0%, #003C8F 60%, #01579B 100%)

Banner — HOD
  linear-gradient(135deg, #E65100 0%, #BF360C 100%)

Banner — Faculty
  linear-gradient(135deg, #006064 0%, #004D40 100%)

Banner — Student
  linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)

Sidebar header accent
  linear-gradient(180deg, #1565C0 0%, #0D47A1 100%)

Card hover shimmer
  linear-gradient(120deg, transparent 30%, rgba(21,101,192,0.04) 50%, transparent 70%)
```

---

## 3. TYPOGRAPHY

### Font Stack

```
Display / Headings   "Plus Jakarta Sans"    — Google Fonts
                      Weights: 700, 800
                      Character: Modern, geometric, authoritative

Body / UI            "Plus Jakarta Sans"    — Same family for cohesion
                      Weights: 400, 500, 600
                      Character: Highly legible at small sizes

Monospace            "JetBrains Mono"       — Google Fonts
                      Weight: 400, 600
                      Used for: booking references, codes, IDs, OTP digits
```

### Type Scale

```
Display-2    56px / 800 / -1.5px   Hero headings (login page only)
Display-1    40px / 800 / -1.0px   Page-level empty state headings

H1           32px / 800 / -0.5px   Reserved for marketing / onboarding
H2           28px / 700 / -0.25px  Dashboard section titles
H3           22px / 700 /  0px     Card titles, dialog headings
H4           18px / 700 /  0px     Table section headers, panel titles
H5           16px / 600 /  0px     Subsection labels, form section dividers
H6           14px / 700 /  0.3px   Overlines, category labels (uppercase)

Body-1       15px / 400 / 0px      Primary content, table cells, form values
Body-2       13px / 400 / 0px      Secondary content, description text
Subtitle-1   15px / 600 / 0px      Semi-bold body, card labels
Subtitle-2   13px / 600 / 0.2px    Small bold labels, filter chips
Caption      12px / 500 / 0.3px    Timestamps, metadata, helper text
Overline     11px / 700 / 1.2px    Uppercase section markers (ALL CAPS)
Button       14px / 600 / 0.4px    All button labels
Code         13px / 400 / 0px      Booking refs, codes — JetBrains Mono
```

### Line Height Rules

```
Headings (H1–H4)    1.20  — Tight for impact
Body text           1.70  — Open for readability
Captions            1.50  — Balanced at small sizes
Table cells         1.40  — Compact for density
Button labels       1.00  — Single-line always
```

### Typography Hierarchy in Practice

```
Dashboard card title   →  H5  (16px / 600)
Dashboard stat value   →  H2  (28px / 800)
Dashboard stat label   →  Caption + Overline style
Table column header    →  Caption (12px / 700 / uppercase / Neutral-800)
Table cell primary     →  Body-2 (13px / 600 for names, 400 for metadata)
Table cell secondary   →  Caption (12px / 500 / Neutral-600)
Badge / chip label     →  11px / 700
Sidebar nav label      →  Body-2 (13px / 500)
Sidebar nav active     →  Body-2 (13px / 700)
Page section label     →  H5 (16px / 700)
Dialog title           →  H3 (22px / 700)
Form field label       →  Body-2 (13px / 500)
Input placeholder      →  Body-2 (13px / 400 / Neutral-400)
```

---

## 4. SPACING SYSTEM

### Base Unit: 4px

All spacing values are multiples of 4px. Never use arbitrary pixel values.

```
space-1    4px    Tight internal gaps (icon ↔ label, chip padding)
space-2    8px    Small gaps (avatar ↔ name, badge padding)
space-3    12px   Form field internal padding (horizontal)
space-4    16px   Card internal padding (small), list item padding
space-5    20px   Standard internal card padding
space-6    24px   Card padding default, dialog padding
space-8    32px   Section vertical gap, large card padding
space-10   40px   Major section separation
space-12   48px   Page top padding, large section blocks
space-16   64px   Full-bleed section spacing
```

### Contextual Spacing Rules

**Page Layout**
```
Page outer padding (desktop)    24px horizontal, 32px top (below navbar)
Page outer padding (mobile)     16px horizontal, 24px top
Max content width               1280px centered
Section gap (vertical)          32px between major page sections
Subsection gap                  20px between cards in the same section
```

**Cards**
```
Card padding (default)          24px all sides
Card padding (compact/table)    0px (table fills the card)
Card padding (stat card)        20px all sides
Card inner section gap          16px
Card header ↔ content gap       12px
Card header bottom border       1px solid Neutral-100
```

**Sidebar**
```
Sidebar width (open)            240px
Sidebar width (collapsed)       64px
Nav item padding                10px vertical, 12px horizontal
Nav item border-radius          10px
Nav group label padding         8px horizontal, 16px top
Nav item gap (icon ↔ label)     12px
```

**Navbar**
```
Navbar height (desktop)         64px
Navbar height (mobile)          56px
Navbar horizontal padding       24px desktop, 16px mobile
Logo ↔ title gap                10px
User control padding            6px vertical, 12px horizontal
```

**Tables**
```
Table header padding            12px vertical, 16px horizontal
Table cell padding              12px vertical, 16px horizontal
Table row height (default)      52px
Table row height (compact)      44px
Table row height (comfortable)  64px
```

**Forms**
```
Field vertical gap              20px
Field label ↔ input gap         6px (MUI handles via floating label)
Input height (default)          44px
Input height (small)            36px
Dialog padding                  24px sides, 20px top, 20px bottom
Dialog field gap                16px
```

**Buttons**
```
Button height (large)           44px, padding 12px 32px
Button height (default)         36px, padding 8px 20px
Button height (small)           28px, padding 4px 14px
Button border-radius            10px
Button icon gap                 8px
Button group gap                8px
```

---

## 5. SHAPE & ELEVATION

### Border Radius Scale

```
radius-1    4px    Chips, badges, small tags
radius-2    8px    Table header cells, compact cards, selects
radius-3    10px   Buttons, inputs, nav items
radius-4    12px   Cards, dialogs, popups
radius-5    16px   Large cards, dashboard panels
radius-6    20px   Hero banners, welcome cards
radius-full 9999px Avatars, pill buttons, toggle switches
```

### Shadow / Elevation Scale

```
Elevation 0    none                                            Flat / table rows
Elevation 1    0 1px 0 rgba(21,101,192,0.08)                  Subtle divider lift
Elevation 2    0 2px 8px rgba(21,101,192,0.07)                Cards (default)
Elevation 3    0 4px 16px rgba(21,101,192,0.10)               Raised cards, hover state
Elevation 4    0 8px 28px rgba(21,101,192,0.12)               Dropdowns, popovers
Elevation 5    0 12px 40px rgba(21,101,192,0.14)              Dialogs, modals
Elevation 6    0 20px 60px rgba(21,101,192,0.18)              Drawers, full-screen panels
```

### Border Rules

```
Default border       1px solid Neutral-100  (#E3EAF4)
Focus border         2px solid Blue-800     (#1565C0)
Error border         2px solid Error-700    (#C62828)
Success border       2px solid Success-700  (#2E7D32)
Divider              1px solid Neutral-100
Table row divider    1px solid Neutral-050
```

---

## 6. COMPONENT DESIGN RULES

### 6.1 Navbar

**Structure**
```
[Logo block] ─────────────────────── [Search] ─── [Notif] ─── [User chip]
```

**Specifications**
- Background: white (#FFFFFF) at 95% opacity, backdrop-filter: blur(12px)
- Bottom border: 1px solid Neutral-100
- Position: fixed, z-index above sidebar
- Logo block: 36×36 icon + wordmark. Icon uses Blue gradient background, white school icon.
- Search bar: visible on md+, hidden on mobile (becomes icon). Width 280px max.
- Notification bell: shows unread count badge (Error-700 background, white text)
- User chip: Avatar + name + role + chevron. Hover: Neutral-050 background.
- User menu: shows full name, email, role chip, Profile link, Logout option.

**Responsive**
- Mobile: Logo + Hamburger menu icon + Notification bell + Avatar (no name text)
- Tablet: Logo + Notification + User chip (no search bar)
- Desktop: Full layout

---

### 6.2 Sidebar

**Anatomy**
```
┌──────────────────────────┐
│  [Logo + App name]       │  ← 64px tall header
├──────────────────────────┤
│  NAVIGATION LABEL        │  ← Overline style
│  > Dashboard             │  ← Active item (blue fill)
│    Users                 │
│    Departments           │
│    Resources             │
├──────────────────────────┤
│  MANAGEMENT LABEL        │
│    Bookings              │
│    Approvals             │
├──────────────────────────┤  ← flex-grow spacer
│  [Role badge card]       │  ← Bottom area
└──────────────────────────┘
```

**Specifications**
- Width: 240px desktop permanent, 240px mobile temporary drawer
- Background: #FFFFFF with 1px right border (Neutral-100)
- Nav item: icon (20px) + label, 10px vertical padding, 12px horizontal, 10px radius
- Active state: Blue-800 background, white icon + label, no box shadow
- Hover state: Blue-050 background, Blue-800 text
- Active indicator: no left bar — full background fill is the indicator
- Group label: 11px / 700 / uppercase / Neutral-400, 16px top margin
- Bottom role card: 12px padding, Blue-050 background, Blue-800 border, shows role name + access level
- Collapsed (64px): shows icons only with Tooltip labels on hover

**Transition**
- Width transition: 0.25s ease for collapse/expand
- Mobile: slides in from left with overlay, 0.3s ease

---

### 6.3 Stat / KPI Cards

**Layout**
```
┌──────────────────────────────┐
│  LABEL (overline)            │
│  5,234          [ Icon box ] │  ← stat value left, icon right
│  ↑ 12 this month            │  ← trend line (optional)
└──────────────────────────────┘
```

**Specifications**
- Padding: 20px all sides
- Border: 1px solid Neutral-100
- Border-radius: 16px
- Shadow: Elevation 2
- Icon container: 44×44, border-radius 12px, background = semantic color at 10% opacity, icon at 100% semantic color
- Stat value: H2 (28px / 800) in Neutral-900
- Label: Overline (11px / 700 / uppercase) in Neutral-600
- Sub-label: Caption (12px) in Neutral-600
- Hover: Shadow lifts to Elevation 3, translateY(-2px), 0.2s ease

**Grid**: 4 per row on desktop, 2 on tablet, 1 on mobile

---

### 6.4 Data Tables

**Structure**
```
┌─────────────────────────────────────────────────────────┐
│  Section Title                          [ + Add Button] │  ← Card header
├─────────────────────────────────────────────────────────┤
│  [Search] ─── [Filter 1] ─── [Filter 2] ─── [Search]   │  ← Filter bar
├──────┬──────────────────┬──────────┬─────────┬──────────┤
│  □   │  NAME            │  ROLE    │ STATUS  │ ACTIONS  │  ← Table head
├──────┼──────────────────┼──────────┼─────────┼──────────┤
│  □   │  [Avatar] Name   │  Chip    │  Chip   │  ⋯       │  ← Row
│      │  email           │          │         │          │
├──────┼──────────────────┼──────────┼─────────┼──────────┤
│  ... (repeating rows)                                    │
├─────────────────────────────────────────────────────────┤
│  Rows per page: 10 ▾        1–10 of 248   < 1 2 3 ... > │  ← Pagination
└─────────────────────────────────────────────────────────┘
```

**Header row**
- Background: #F8FAFF (Neutral-025)
- Text: 12px / 700 / uppercase / Neutral-800
- Letter spacing: 0.5px
- Padding: 12px vertical, 16px horizontal
- Bottom border: 1px solid Neutral-100
- No shadow on header row

**Body rows**
- Default background: #FFFFFF
- Alternate rows: optional — NOT used. Hover highlight instead.
- Hover background: Blue-050 (#E3F2FD), 0.15s transition
- Selected row background: Blue-050 with 1px left accent border in Blue-800
- Row divider: 1px solid Neutral-050
- Minimum row height: 52px

**Columns**
- Primary cell: 13px / 600 / Neutral-900  (name, title)
- Secondary cell: 12px / 400 / Neutral-600 (email, code, date)
- Two-line cells: primary on top, secondary below, 2px gap
- Avatar + name cell: 34×34 avatar (border-radius full), 12px gap, stacked name + email
- Status cell: Badge chip only
- Action cell: Icon buttons, right-aligned, appear at full opacity on row hover

**Responsive**
- Mobile: hide lower-priority columns. Max 3 columns visible. Action column always visible.
- Use priority annotations: Priority 1 = always show, Priority 2 = md+, Priority 3 = lg+

---

### 6.5 Status Badges / Chips

**Standard status set**

```
PENDING       Background: Warning-100  #FFE0B2   Text: Warning-700  #F57C00
APPROVED      Background: Success-100  #C8E6C9   Text: Success-700  #2E7D32
REJECTED      Background: Error-100    #FFCDD2   Text: Error-700    #C62828
CANCELLED     Background: Neutral-100  #E3EAF4   Text: Neutral-600  #546E7A
COMPLETED     Background: Info-100     #B3E5FC   Text: Info-700     #0277BD
IN_PROGRESS   Background: Warning-100  #FFE0B2   Text: Warning-700  #F57C00
MAINTENANCE   Background: Error-100    #FFCDD2   Text: Error-700    #C62828
ACTIVE        Background: Success-100  #C8E6C9   Text: Success-700  #2E7D32
INACTIVE      Background: Neutral-100  #E3EAF4   Text: Neutral-600  #546E7A
```

**Specifications**
- Height: 22px (default), 20px (compact in tables), 28px (standalone)
- Font: 11px / 700 / 0.3px letter-spacing
- Padding: 0 8px
- Border-radius: 6px (not pill — ERP style is more square than rounded)
- No left dot indicator — background fill is sufficient
- Never use color alone — text label always present

**Role chips**
```
STUDENT   Blue-100 bg / Blue-800 text
FACULTY   Teal-100 bg / Teal-700 text
HOD       Amber-100 bg / Amber-800 text
ADMIN     Red-100 bg / Red-800 text
```

---

### 6.6 Buttons

**Hierarchy**

```
Primary      Filled Blue-800, white text          → Main page action (Save, Submit, Approve)
Secondary    Outlined Blue-800, Blue-800 text      → Alternative action (Cancel, Back, Export)
Tertiary     Text only, Blue-800 text              → Low-weight actions (View, Learn more)
Danger       Filled Error-700, white text          → Destructive (Delete, Reject)
Danger-Soft  Outlined Error-700, Error-700 text    → Confirmable destructive
Ghost        No border, Neutral-600 text           → Table row inline actions
```

**Primary button states**
```
Default     background: Blue-800  #1565C0
Hover       background: Blue-700  #1976D2, shadow Elevation 3
Active      background: Blue-900  #0D47A1
Focus       2px offset ring in Blue-400
Disabled    background: Neutral-200, text: Neutral-400, no shadow, cursor not-allowed
Loading     spinner replaces label, same background, not-allowed
```

**Size specifications**
```
Large    44px height, 32px H-padding, 14px / 600 text — Primary CTAs
Default  36px height, 20px H-padding, 13px / 600 text — Standard actions
Small    28px height, 12px H-padding, 12px / 600 text — Table row actions, compact areas
Icon     36×36, 8px all padding — standalone icon buttons
```

**Button groups / toolbars**
- Gap between buttons: 8px
- In dialog footers: right-aligned, Cancel left of primary action
- In page headers: right side, primary rightmost

---

### 6.7 Form Fields

**Input anatomy**
```
[Label text]
┌─────────────────────────────────────┐
│  [Start icon]  Input text           │  ← 44px height
└─────────────────────────────────────┘
[Helper text or error message]
```

**States**
```
Default    Background: #F8FAFF, border: 1px solid Neutral-200
Hover      Border: 1px solid Blue-600
Focused    Background: #FFFFFF, border: 2px solid Blue-800, label color: Blue-800
Filled     Background: #FFFFFF, border: 1px solid Neutral-200
Error      Border: 2px solid Error-700, label color: Error-700, helper text: Error-700
Success    Border: 2px solid Success-700 (use sparingly, only post-validation)
Disabled   Background: Neutral-050, border: Neutral-100, text: Neutral-400, cursor: default
```

**Field spacing in forms**
- Vertical gap between fields: 20px
- Field label font: Body-2 (13px / 500) — floated or static depending on context
- Placeholder: 13px / 400 / Neutral-400
- Helper text: Caption (12px / 400 / Neutral-600) — 4px below field
- Error text: Caption (12px / 400 / Error-700) — 4px below field
- Required indicator: Asterisk (*) in Error-700, 4px after label

**Select / Dropdown**
- Same height and styling as text input
- Arrow icon: Neutral-600, rotates 180° when open
- Dropdown menu: white background, Elevation 4 shadow, 6px border-radius on menu
- Option height: 40px, hover: Blue-050 background
- Selected option: Blue-050 background + Blue-800 text

---

### 6.8 Dialog / Modal

**Structure**
```
┌────────────────────────────────────────────┐
│  Dialog Title                         [×]  │  ← 24px padding top, 24px sides
├────────────────────────────────────────────┤
│                                            │  ← Divider line (optional)
│  Content area                              │  ← 24px sides, 20px vertical
│  Form fields, descriptions, data           │
│                                            │
├────────────────────────────────────────────┤
│  [Optional alert or warning]               │  ← Inlined above action bar
│                     [Cancel]  [Primary]    │  ← 24px padding, 20px bottom
└────────────────────────────────────────────┘
```

**Specifications**
- Width: 480px (small), 600px (default), 800px (large/form), fullscreen (mobile)
- Border-radius: 16px
- Shadow: Elevation 5
- Backdrop: rgba(13,27,42,0.5) with blur(4px)
- Title: H3 (22px / 700 / Neutral-900)
- Close button: 32×32, top-right, Neutral-400 icon, hover: Neutral-100 background
- Content max-height: 70vh with internal scroll
- Footer border-top: 1px solid Neutral-100
- Transition: scale(0.95) → scale(1) + opacity 0 → 1, 0.2s ease

**Confirm / Destructive dialogs**
- Max width: 440px
- Title: Error-700 color for destructive actions
- Single paragraph body text
- No close X in top right for critical confirmations (force explicit choice)

---

### 6.9 Dashboard Welcome Banner

**Structure**
```
┌──────────────────────────────────────────────────────────────────┐
│  [Role pill]                                                      │
│  Welcome back, [First Name]!                                      │
│  [Department] — SmartCampus Portal                                │
│                                            [Decorative circles]  │
└──────────────────────────────────────────────────────────────────┘
```

**Specifications**
- Border-radius: 24px
- Padding: 32px 40px desktop, 24px 24px mobile
- Background: Role-specific gradient (see Section 2)
- Title: H3 (22px) or H2 (28px) / 800 / #FFFFFF
- Subtitle: Body-1 / 400 / rgba(255,255,255,0.75)
- Role pill: Background rgba(255,255,255,0.15), text white, 700 weight, 6px radius
- Decorative elements: 2 circles, position absolute, right side, rgba(255,255,255,0.05) and 0.04
- No border, no external shadow

---

### 6.10 Empty State

**Structure**
```
              [Icon — 64×64, colored]
              Title text
              Subtitle / description
              [Primary action button]  (optional)
```

**Specifications**
- Container: centered, padding 60px vertical
- Icon: 64px, placed in 96×96 circle, semantic color at 10% opacity background, icon at 40% opacity
- Title: H4 (18px / 700 / Neutral-800)
- Subtitle: Body-2 (13px / 400 / Neutral-600) max-width 320px centered
- Button: Default size, Primary variant (when action available)
- Vertical gap between elements: 16px

---

### 6.11 Notification / Alert Banners

**Inline Alert (inside forms / pages)**

```
┌──────────────────────────────────────────────────┐
│  [Icon]  Title or message text               [×] │
└──────────────────────────────────────────────────┘
```

```
Info     Icon: InfoOutlined     Background: Info-050    Border-left: 3px Info-700
Success  Icon: CheckCircle      Background: Success-050 Border-left: 3px Success-700
Warning  Icon: WarningAmber     Background: Warning-050 Border-left: 3px Warning-700
Error    Icon: ErrorOutlined    Background: Error-050   Border-left: 3px Error-700
```

**Specifications**
- Padding: 12px 16px
- Border-radius: 10px
- Border: 1px solid (semantic color at 30% opacity)
- Left accent: 3px solid (semantic color full opacity) — ERP style distinguisher
- Title: Body-2 / 600 / semantic-700 color
- Body text: Body-2 / 400 / Neutral-800
- Close icon: 18px, right aligned, semantic-700 color

**Toast notifications (react-hot-toast)**
- Position: top-right
- Width: 360px max
- Padding: 14px 16px
- Border-radius: 10px
- Box-shadow: Elevation 4
- Font: Body-2 / 500
- Duration: Success: 3s, Error: 5s, Info: 4s

---

### 6.12 Avatars

```
Size XL     56×56    Profile page, user detail dialogs
Size L      44×44    User cards, large list items
Size M      34×34    Table rows (default)
Size S      28×28    Compact lists, notification items
Size XS     22×22    Inline mentions, mini lists
```

**Specifications**
- Shape: Circle (border-radius: 9999px) for all user avatars
- Shape: Rounded square (border-radius: 10px) for resource/entity avatars
- Default: Initials (first + last name initial), white text, role-color background
- Image: object-fit: cover, object-position: center top
- Border: none by default, 2px white ring on colored backgrounds

**Initials color mapping**
- Always derives from role color (see Role Identity Colors)
- Font: 13px / 700 for M size, scales proportionally

---

## 7. PAGE LAYOUT RULES

### Dashboard Grid System

```
Desktop (≥1200px)    12-column grid, 24px gutter, 24px outer margin
Tablet (768–1199px)   8-column grid, 20px gutter, 20px outer margin
Mobile (<768px)       4-column grid, 16px gutter, 16px outer margin
```

### Common Dashboard Layouts

**Admin Dashboard**
```
Row 1:  [Stat] [Stat] [Stat] [Stat]      4 equal columns
Row 2:  [Pending Approvals — 8col] [Quick Links — 4col]
Row 3:  [Recent Bookings Table — 12col]
```

**HOD Dashboard**
```
Row 1:  [Stat] [Stat] [Stat]             3 equal columns
Row 2:  [Approval Queue — 7col] [Today's Timetable — 5col]
Row 3:  [Department Resources — 12col]
```

**Faculty / Student Dashboard**
```
Row 1:  [Stat] [Stat] [Stat]             3 equal columns
Row 2:  [My Upcoming Bookings — 8col] [Quick Book — 4col]
Row 3:  [Resource Browser — 12col]
```

### Z-Index Scale

```
z-0        0    Normal document flow
z-10      10    Raised cards on hover
z-20      20    Sticky table headers, floating labels
z-30      30    Dropdown menus, tooltips
z-40      40    Fixed sidebar (desktop)
z-50      50    Fixed navbar
z-60      60    Drawer backdrop overlay
z-70      70    Drawer panel
z-80      80    Dialog backdrop
z-90      90    Dialog panel
z-100    100    Toast notifications
```

---

## 8. MOTION & INTERACTION

### Duration Scale

```
Instant      0ms    Immediate feedback (checkbox toggle fill)
Fast        100ms   Micro-interactions (button press, ripple)
Normal      200ms   Standard transitions (hover states, color changes)
Moderate    300ms   Component transitions (dropdown open, card expand)
Slow        400ms   Page-level transitions (route change fade)
Deliberate  500ms   Modals, drawers entering
```

### Easing Functions

```
ease-standard    cubic-bezier(0.4, 0.0, 0.2, 1)   Most UI transitions
ease-decelerate  cubic-bezier(0.0, 0.0, 0.2, 1)   Elements entering screen
ease-accelerate  cubic-bezier(0.4, 0.0, 1.0, 1)   Elements leaving screen
ease-spring      cubic-bezier(0.34, 1.56, 0.64, 1) Playful bounces (use sparingly)
```

### Interaction Patterns

```
Button press        Scale(0.97) + darken background, 100ms
Card hover          translateY(-2px) + shadow elevation increase, 200ms
Table row hover     Background fill Blue-050, 150ms
Sidebar nav item    Background fill, icon + label color shift, 150ms
Dialog open         Opacity 0→1 + scale 0.96→1, 200ms ease-decelerate
Dialog close        Opacity 1→0 + scale 1→0.96, 150ms ease-accelerate
Drawer open         translateX(-100%)→0, 300ms ease-decelerate
Toast enter         translateX(100%)→0 + opacity 0→1, 300ms ease-decelerate
Skeleton pulse      opacity 0.6→1→0.6, 1.4s infinite, ease-in-out
```

### Skeleton Loading Pattern

- Replace cards and table rows (never spinners for list data)
- Base color: Neutral-100 (#E3EAF4)
- Shimmer direction: left to right
- Text skeleton: matches approximate line height and width (70–90% width)
- Avatar skeleton: circle, same dimensions
- Never show partial data — skeleton entire section or nothing

---

## 9. ACCESSIBILITY RULES

```
Color contrast (text)       Minimum 4.5:1 for body, 3:1 for large text
Color contrast (UI)         Minimum 3:1 for interactive components
Focus indicators            2px solid Blue-800, 2px offset — visible on all focusable elements
Touch targets (mobile)      Minimum 44×44px for all interactive elements
Error communication         Never color alone — icon + text + color
Form labels                 Always present — no placeholder-only forms
Icon buttons                aria-label on all icon-only buttons
Loading states              aria-live="polite" for dynamic content updates
Skip links                  "Skip to main content" as first focusable element
Keyboard navigation         Full sidebar + table + dialog keyboard support
```

---

## 10. RESPONSIVE BREAKPOINTS

```
xs     0px       Mobile portrait
sm     600px     Mobile landscape / small tablet
md     900px     Tablet portrait
lg     1200px    Desktop
xl     1536px    Large desktop / ultrawide
```

### Sidebar behavior across breakpoints

```
xl / lg    Permanent drawer, always visible, 240px
md         Permanent drawer, collapses to 64px icon-only mode
sm / xs    Hidden, toggled by hamburger, renders as temporary overlay drawer
```

### Table responsive strategy

```
lg+   All columns visible
md    Hide lowest-priority columns (3rd and 4th level metadata)
sm    Show only primary column + status + actions
xs    Card-based list view replaces table entirely
```

---

## 11. ICONOGRAPHY

**Library**: Material Icons Outlined (primary), Material Icons Rounded (accent moments)

**Rationale**: Outlined icons feel lighter and more sophisticated in dense ERP interfaces.
Rounded variants appear in empty states and illustrations only.

### Icon sizes by context

```
Navbar icons          24px
Sidebar nav icons     20px
Button icons          18px
Table action icons    18px
Status indicators     16px
Badge / chip icons    14px
Empty state icons     64px (in 96px container)
Dashboard stat icons  24px (in 44px container)
```

### Core icon mapping

```
Dashboard     DashboardOutlined
Users         GroupOutlined
Student       SchoolOutlined
Faculty       PersonOutlined
HOD           SupervisorAccountOutlined
Admin         AdminPanelSettingsOutlined
Department    ApartmentOutlined
Resource      MeetingRoomOutlined
Lab           ScienceOutlined
Booking       CalendarMonthOutlined
Approval      TaskAltOutlined
Timetable     TableChartOutlined
Maintenance   BuildOutlined
Notification  NotificationsOutlined
Support       SupportAgentOutlined
Event         EventOutlined
Settings      SettingsOutlined
Search        SearchRounded
Filter        TuneRounded
Add           AddRounded
Edit          EditOutlined
Delete        DeleteOutlineRounded
View          VisibilityOutlined
Approve       CheckCircleOutlineRounded
Reject        CancelOutlined
Deactivate    BlockRounded
Email         EmailOutlined
Phone         PhoneOutlined
Lock          LockOutlined
Logout        LogoutRounded
Back          ArrowBackRounded
Menu          MenuRounded
Close         CloseRounded
```

---

*SmartCampus Design System v1.0 — Internal Reference Document*
*Apply consistently across all modules. Any deviations must be documented and justified.*
