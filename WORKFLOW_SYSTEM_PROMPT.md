# DIGIPASS Workflow Instructions System - Implementation Guide

## System Overview

The "View Instructions" feature creates a comprehensive, step-by-step guided workflow panel in the executor portal. It displays platform-specific, action-specific instructions (Delete, Pass, Handoff, Last Message) with embedded credentials, tips, and interactive controls.

**Data Flow:**
```
workflow-steps-detailed.js (WORKFLOWS object)
    ↓
executor-dashboard.html (openWorkflowDirect function)
    ↓
renderStepPreview function (renders each step)
    ↓
User sees interactive workflow panel with copy buttons, navigation, credentials
```

---

## 1. Data Source: workflow-steps-detailed.js

### File Structure
The file exports a single `WORKFLOWS` constant object with this structure:

```javascript
const WORKFLOWS = {
  'PlatformName': {
    appName: string,              // Display name (e.g., "Instagram")
    icon: string,                 // FontAwesome class (e.g., "fab fa-instagram")
    category: string,             // Category (e.g., "Social Media", "Email", "Finance")
    color: string,                // Hex color (e.g., "#E4405F")
    actions: {
      'delete': {
        title: string,            // Action title (e.g., "Delete Instagram Account Permanently")
        steps: [
          {
            stepNumber: number,                  // Sequential step number (1, 2, 3...)
            title: string,                       // Step title (e.g., "Open Instagram Website")
            description: string,                 // Short description (e.g., "Access Instagram through web browser")
            action: string,                      // Detailed action instructions (multiline OK)
            credentials: [string] | null,        // What to show (["password"], ["email", "password"], null)
            tips: [string],                      // Array of helpful tips/warnings
            showFarewellMessage: boolean         // Optional: true only for "last_message" action step
          },
          // ... more steps
        ]
      },
      'pass': { /* similar structure */ },
      'last_message': { /* similar structure */ }
    }
  },
  // ... more platforms
}
```

### Supported Platforms
Currently implemented: Instagram, Facebook, Gmail, Outlook, PayPal, Google Pay, Google Drive, Netflix, Disney+, Twitter/X, LinkedIn

### Key Design Rules for Workflows

1. **Step Numbering**: Must be sequential (1, 2, 3...). Used for progress bar calculation.
2. **Credentials Array**: 
   - `null` = No credentials shown for this step
   - `['password']` = Show password only
   - `['email', 'password']` = Show email and password
   - `['username']` = Show username/account identifier
   - Can include: "password", "username", "email", "account", or any custom string
3. **Credential Detection** (in executor-dashboard.html):
   - Password field: `cred.toLowerCase().includes('password')`
   - Username field: `cred.toLowerCase().includes('email' || 'username' || 'account')`
   - Other fields: Show "Required - Provide your own"
4. **showFarewellMessage**: 
   - Only set `true` in the appropriate step of `last_message` action
   - Displays the farewell message in a special blue box
5. **Tips Array**: Always include relevant security warnings, platform-specific notes, or helpful hints

---

## 2. Entry Point: executor-dashboard.html

### Function: `openWorkflowDirect(assetId, platform, account, action, message, password)`

**Location**: `<script>` section in executor-dashboard.html

**Parameters**:
- `assetId` (number): Digital asset ID for database reference
- `platform` (string): Platform name matching key in WORKFLOWS (e.g., "Instagram")
- `account` (string): Username/email identifier for this account
- `action` (string): Action type: "delete", "pass", or "last_message"
- `message` (string): Farewell message for "last_message" action (or empty string)
- `password` (string): Account password (shown masked as bullets by default)

**Flow**:
1. Retrieves workflow from `WORKFLOWS[platform].actions[action]`
2. Generates steps list in left panel with click handlers
3. Renders first step in right panel using `renderStepPreview()`
4. Makes workflow panel visible with animation
5. Updates progress bar with total step count

**Example Call**:
```javascript
openWorkflowDirect(
  13,                           // assetId
  "Instagram",                  // platform
  "john.doe@gmail.com",         // account (username/email)
  "delete",                      // action
  "",                            // message (empty for delete action)
  "SecurePass123!"              // password
);
```

---

## 3. Rendering: renderStepPreview(step, platform, account, action, password, message)

**Location**: Called from openWorkflowDirect after step selection

**Responsibilities**:
1. Clear previous step content
2. Build HTML for current step including:
   - Step title and description
   - Detailed action instructions
   - Account information section (only on step 1)
   - Credentials section (password, username, email, etc.)
   - Tips section with clickable disclosure triangles
   - Farewell message section (if showFarewellMessage is true)
3. Insert HTML into #previewContent div
4. Attach event listeners to copy buttons and toggles

**Credential Rendering Logic**:

```javascript
// Password credential
if (cred.toLowerCase().includes('password')) {
  // Create element with data-actual attribute containing real password
  // Display masked bullets: •••••
  // Add copy button → copyPasswordValue(elementId)
  // Add toggle button → togglePasswordDisplay(elementId)
}

// Username/Email credential
if (cred.toLowerCase().includes('email' || 'username' || 'account')) {
  // Display actual account value (provided as parameter)
  // Add copy button → copyUsernameValue(elementId)
}

// Other credentials
else {
  // Display "Required - Provide your own"
  // No copy button
}
```

**Special Cases**:
- **Step 1**: Always shows "Account Information" section with username/email even if not in credentials array
- **Last Message Action**: Steps with `showFarewellMessage: true` display farewell message in blue box with copy button

---

## 4. Interactive Functions

### Copy Functions

#### `copyPasswordValue(elementId)`
- Gets element's `data-actual` attribute (actual password value)
- Copies to clipboard (unmasked)
- Shows toast: "Password copied!"

#### `copyUsernameValue(elementId)`
- Gets element's textContent (displayed username/email)
- Copies to clipboard
- Shows toast: "Username copied!"

#### `copyMessageValue(elementId)`
- Gets element's textContent (farewell message)
- Copies to clipboard
- Shows toast: "Message copied!"

#### `copyCredential(elementId, message)`
- Generic function for copying any element's textContent
- Shows custom message in toast

### Password Visibility Toggle

#### `togglePasswordDisplay(elementId)`
- Checks if currently masked (contains bullets: •)
- If masked → show actual password from `data-actual` attribute
- If showing → mask with bullets again
- Updates element textContent in place

### Navigation Functions

#### `nextStep()`
- Finds currently active step (`.step-item-active` class)
- Clicks next sibling step element
- Automatically updates rendering and progress bar

#### `previousStep()`
- Finds currently active step
- Clicks previous sibling step element
- Automatically updates rendering and progress bar

#### `markAsDone()`
- Calls `closeWorkflow()` to hide panel
- Shows toast: "Workflow completed! ✓"
- Could extend to make API call for completion tracking

### Panel Management

#### `closeWorkflow()`
- Removes `workflow-panel-visible` class
- Adds `workflow-panel-hidden` class
- Triggers CSS animations for smooth exit

---

## 5. UI Components & Styling

### CSS Classes

#### Workflow Panel
- `.workflow-panel` - Main container (left sidebar + right panel)
- `.workflow-panel-visible` - Show with animation
- `.workflow-panel-hidden` - Hide with animation
- `.workflow-steps-sidebar` - Left step list
- `.workflow-preview-panel` - Right content area

#### Steps List
- `.step-item` - Individual step row
- `.step-item-active` - Currently selected step (green highlight)
- `.step-item-number` - Step number badge
- `.step-item-title` - Step name text

#### Content Rendering
- `.step-details` - Main action instructions container
- `.step-action` - Action text content
- `.credentials-section` - Container for credential pairs
- `.credentials-header` - "Account Information" or "Credentials" label with icon
- `.credentials-body` - Credential items container
- `.credential-item` - Individual credential (username, password, etc.)
- `.credential-label` - Field name (USERNAME, PASSWORD, EMAIL)
- `.credential-value` - Field value or masked bullets

#### Buttons
- `.copy-credential-btn` - Copy button styling (small, icon-based)
- `.toggle-password-btn` - Eye icon button for password visibility
- `.workflow-nav-btn` - Navigation buttons (Previous, Next, Done)

#### Colors & Styling
```css
/* Primary Colors */
--forest-deep: #1b3a2d;          /* Dark green background */
--forest-mid: #2d5a42;           /* Medium green accents */
--forest-light: #3d7a5a;         /* Light green hover states */
--cream-light: #fdf6ec;          /* Light cream text/backgrounds */
--sand: #e8d9c0;                 /* Tan accents */
--sand-deep: #d4c4a0;            /* Dark tan */

/* Component Specific */
Credentials box: background #f5f5f5, padding 8px, rounded corners
Farewell message: background #dbeafe (light blue), border-left #0369a1
Password bullets: font-family monospace
Tips list: disclosure triangle, hover state changes background
```

---

## 6. Data Flow Example: "Delete Instagram"

```
User clicks "View Instructions" on Instagram asset
    ↓
JavaScript calls:
openWorkflowDirect(13, "Instagram", "john.doe@gmail.com", "delete", "", "SecurePass123!")
    ↓
Function retrieves:
WORKFLOWS["Instagram"].actions["delete"]
    ↓
Gets steps array with 5 steps:
Step 1: Open Instagram Website (no credentials)
Step 2: Login to Instagram Account (credentials: ["username/email", "password"])
Step 3: Navigate to Account Settings (no credentials)
Step 4: Access Account Deletion Page (no credentials)
Step 5: Confirm Permanent Deletion (credentials: ["password"])
    ↓
Generates left sidebar:
- Step 1 (active/highlighted)
- Step 2
- Step 3
- Step 4
- Step 5
    ↓
Renders right panel for Step 1:
- Title: "Open Instagram Website"
- Description: "Access Instagram through web browser (not mobile app)"
- Action: Detailed instructions...
- Tips: Array of 4 tips with disclosure triangles
- No credentials section (credentials is null)
    ↓
User clicks Step 2
    ↓
renderStepPreview() called with Step 2
    ↓
Renders:
- Title: "Login to Instagram Account"
- Description: "Enter your account credentials"
- Account Information section:
  - Label: USERNAME / ACCOUNT
  - Value: john.doe@gmail.com (with copy button)
- Credentials section:
  - PASSWORD: ••••••••••••••• (with copy button, eye toggle)
  - Tips: 4 tips about login process
    ↓
User clicks copy button for password
    ↓
copyPasswordValue() executes
    ↓
Reads data-actual="SecurePass123!" attribute
    ↓
Copies "SecurePass123!" to clipboard (not masked)
    ↓
Shows toast notification: "Password copied!"
    ↓
User clicks eye icon
    ↓
togglePasswordDisplay() executes
    ↓
Shows password in plain text: "SecurePass123!"
    ↓
User clicks eye icon again
    ↓
Password masked again: "•••••••••••••"
```

---

## 7. Adding New Workflows

### Step-by-Step Process

1. **Add to workflow-steps-detailed.js**:
```javascript
const WORKFLOWS = {
  // ... existing platforms
  'NewPlatform': {
    appName: 'Display Name',
    icon: 'fab fa-icon-name',      // FontAwesome class
    category: 'Category',
    color: '#RRGGBB',
    actions: {
      'delete': {
        title: 'Delete NewPlatform Account Permanently',
        steps: [
          {
            stepNumber: 1,
            title: 'First Step Title',
            description: 'Short description',
            action: 'Detailed action instructions with specific steps',
            credentials: null,
            tips: [
              'Tip 1',
              'Tip 2',
              'Tip 3'
            ]
          },
          // ... more steps (2, 3, 4, etc.)
        ]
      },
      'pass': { /* ... */ },
      'last_message': { /* ... */ }
    }
  }
}
```

2. **Reference in Digital Assets**: When creating digital asset entries, use platform name exactly as key in WORKFLOWS object

3. **Test via executor-dashboard.html**: Click "View Instructions" on test asset with new platform

### Naming Conventions

- **Platform Names**: Match keys in WORKFLOWS object exactly (case-sensitive)
- **Action Keys**: Always one of: `'delete'`, `'pass'`, `'last_message'`
- **Step Numbers**: Sequential starting from 1
- **Credential Fields**: Use lowercase in array and the detection logic handles matching

---

## 8. Maintenance & Debugging

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Workflow panel doesn't open | Platform name doesn't match WORKFLOWS key | Check spelling and case in database |
| Credentials show "Required" | Credential field not recognized | Check if includes 'password', 'email', 'username', or 'account' |
| Copy buttons don't work | Function not attached to element | Verify `data-actual` attribute present for passwords |
| Step doesn't display | Step object missing required fields | Ensure stepNumber, title, description, action, credentials, tips all present |
| Progress bar wrong | Total step count calculation error | Verify steps are sequential and match step count |

### Testing Checklist

- [ ] Workflow panel opens smoothly
- [ ] Left sidebar shows all steps
- [ ] First step renders immediately
- [ ] Clicking steps updates preview
- [ ] Account name displays in Step 1
- [ ] Password shows masked bullets by default
- [ ] Copy buttons work for all credentials
- [ ] Password toggle shows/hides on click
- [ ] Tips have disclosure triangles (clickable)
- [ ] Farewell message displays if showFarewellMessage is true
- [ ] Navigation buttons move between steps
- [ ] Next button disabled on last step
- [ ] Previous button disabled on first step
- [ ] Done button closes panel and shows success message
- [ ] Progress bar updates as steps change
- [ ] Close (X) button works

---

## 9. Key Files & Locations

```
Digipass/
├── frontend/
│   ├── executor-dashboard.html          [Main implementation]
│   │   └── Contains:
│   │       - openWorkflowDirect()
│   │       - renderStepPreview()
│   │       - Copy/toggle functions
│   │       - Navigation functions
│   │       - CSS styling
│   │       - HTML structure for workflow panel
│   │
│   └── js/
│       └── workflow-steps-detailed.js    [Data source]
│           └── Contains: WORKFLOWS object with all platform steps
│
└── WORKFLOW_SYSTEM_PROMPT.md             [This file - documentation]
```

---

## 10. API Integration (Optional Enhancement)

To track workflow completion, could add:

```javascript
function markAsDone() {
  // Mark as complete in database
  fetch(`/api/assets/${assetId}/workflow-complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: currentAction,
      completedAt: new Date().toISOString()
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log('Workflow marked as complete');
    closeWorkflow();
    showCopyFeedback('Workflow completed! ✓');
  });
}
```

---

## 11. Future Enhancements

- [ ] Persist user progress across sessions (localStorage)
- [ ] Add video/screenshot upload for each step
- [ ] Support multiple languages
- [ ] Add voice/audio instructions
- [ ] Track which steps were most helpful (telemetry)
- [ ] Add estimated time to complete
- [ ] Export instructions as PDF/printable document
- [ ] Add notes field for each step
- [ ] Support custom fields beyond standard credentials

---

## Quick Reference: Function Call Signature

```javascript
openWorkflowDirect(
  assetId,        // number: Digital asset database ID
  platform,       // string: Platform name (must match WORKFLOWS key)
  account,        // string: Username/email for the account
  action,         // string: 'delete' | 'pass' | 'last_message'
  message,        // string: Farewell message (empty string if N/A)
  password        // string: Account password (shown masked)
);
```

**When Called From**:
- Click handler on "View Instructions" button in asset list
- Or directly from JavaScript console for testing

**What It Does**:
1. Looks up workflow definition from WORKFLOWS object
2. Validates action exists for platform
3. Builds step list in left sidebar
4. Renders first step in right panel
5. Makes workflow panel visible with animation
6. Sets up all event listeners for interactivity

---

*Last Updated: May 2026*
*Version: 1.0 - Complete System Documentation*
