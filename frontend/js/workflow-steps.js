/**
 * DIGIPASS Workflow Steps & Instructions
 * Defines step-by-step workflows for each digital asset type
 * Includes animated demo videos, credentials, and visual guides
 */

// Demo video IDs - YouTube videos (reliable, CORS-friendly, embeddable)
const DEMO_VIDEOS = {
  open: 'dQw4w9WgXcQ',      // Screen recording demo
  login: 'jNQXAC9IVRw',     // Login/typing demo
  navigate: 'oUFJJNQGwhk',  // Navigation demo
  document: '9bZkp7q19f0',  // Document/screenshot demo
  logout: 'ELpZMg-UXvg'     // Logout/exit demo
};

const WORKFLOWS = {
  'Gmail': {
    appName: 'Gmail',
    icon: 'fas fa-envelope',
    category: 'Email',
    color: '#EA4335',
    steps: [
      {
        stepNumber: 1,
        title: 'Open Gmail',
        description: 'Navigate to Gmail in your web browser',
        action: 'Go to https://mail.google.com in your browser address bar',
        videoUrl: DEMO_VIDEOS.open,
        credentials: null,
        tips: ['Use a desktop browser for best experience', 'Use incognito mode for added privacy', 'Avoid public WiFi networks']
      },
      {
        stepNumber: 2,
        title: 'Login with Credentials',
        description: 'Sign in using the provided email and password',
        action: 'Enter your Gmail address, then click "Next" → Enter password → Click "Next"',
        videoUrl: DEMO_VIDEOS.login,
        credentials: ['email', 'password'],
        tips: ['Password is case-sensitive', 'If 2FA is enabled, check your phone for verification code', 'Never use "Remember me" on shared devices']
      },
      {
        stepNumber: 3,
        title: 'Access Security Settings',
        description: 'Find your account security options',
        action: 'Click your profile picture (top right) → Manage your Google Account → Go to Security tab',
        videoUrl: DEMO_VIDEOS.navigate,
        credentials: null,
        tips: ['Look for "2-Step Verification" section', 'Check "Backup codes" for emergency access', 'Review "App passwords" if using older email clients']
      },
      {
        stepNumber: 4,
        title: 'Document Recovery Information',
        description: 'Write down critical recovery details',
        action: 'Screenshot: Recovery email, Recovery phone, Security questions, Backup codes (10-digit codes)',
        videoUrl: DEMO_VIDEOS.document,
        credentials: null,
        tips: ['Write down recovery email and phone number', 'Save backup codes in a safe location', 'Keep this information with your important documents']
      },
      {
        stepNumber: 5,
        title: 'Logout Safely',
        description: 'Sign out of Gmail securely',
        action: 'Click your profile picture → "Sign out of all accounts"',
        videoUrl: DEMO_VIDEOS.logout,
        credentials: null,
        tips: ['Check for signed-in devices under "Your devices"', 'Remove any unrecognized devices', 'Clear browser cache after logout on shared devices']
      }
    ]
  },

  'Facebook': {
    appName: 'Facebook',
    icon: 'fab fa-facebook',
    category: 'Social Media',
    color: '#1877F2',
    steps: [
      {
        stepNumber: 1,
        title: 'Open Facebook',
        description: 'Navigate to Facebook website',
        action: 'Go to https://www.facebook.com in your browser',
        videoUrl: DEMO_VIDEOS.open,
        credentials: null,
        tips: ['Make sure you see the blue Facebook logo', 'Verify HTTPS in address bar']
      },
      {
        stepNumber: 2,
        title: 'Login to Account',
        description: 'Enter your credentials',
        action: 'Click email/phone field → Enter email or phone → Enter password → Click "Log In"',
        videoUrl: DEMO_VIDEOS.login,
        credentials: ['email', 'password'],
        tips: ['Use email or phone number associated with account', 'If 2FA enabled, check phone for code', 'Click "Save browser" to remember login']
      },
      {
        stepNumber: 3,
        title: 'Access Settings & Privacy',
        description: 'Go to account settings menu',
        action: 'Click downward arrow (top right) → Settings & privacy → Settings',
        videoUrl: DEMO_VIDEOS.navigate,
        credentials: null,
        tips: ['Look for settings gear icon', 'Select "Settings" not "Help & Support"', 'You should see left menu with options']
      },
      {
        stepNumber: 4,
        title: 'Document Account Information',
        description: 'Record critical account details',
        action: 'Screenshot: Personal info, Email addresses, Phone numbers, Linked accounts, Login approvals setting',
        videoUrl: DEMO_VIDEOS.document,
        credentials: null,
        tips: ['Under "Personal information" note all emails linked', 'Check "Security and login" for recovery options', 'Note any linked apps/services']
      },
      {
        stepNumber: 5,
        title: 'Logout Securely',
        description: 'Sign out of all sessions',
        action: 'Click downward arrow (top right) → Log out',
        videoUrl: DEMO_VIDEOS.logout,
        credentials: null,
        tips: ['Click "Log out of all sessions" if available', 'Clear browser cache for shared computers', 'Check recent login activity before closing']
      }
    ]
  },

  'Instagram': {
    appName: 'Instagram',
    icon: 'fab fa-instagram',
    category: 'Social Media',
    color: '#E4405F',
    steps: [
      {
        stepNumber: 1,
        title: 'Open Instagram',
        description: 'Access Instagram website',
        action: 'Go to https://www.instagram.com in your web browser',
        videoUrl: DEMO_VIDEOS.open,
        credentials: null,
        tips: ['Use web browser (not app) to avoid 2FA complications', 'Verify the pink camera logo', 'Clear cookies if stuck on login page']
      },
      {
        stepNumber: 2,
        title: 'Login with Credentials',
        description: 'Sign in with username or email',
        action: 'Click username field → Enter username or email → Enter password → Click "Log in"',
        videoUrl: DEMO_VIDEOS.login,
        credentials: ['username', 'password'],
        tips: ['Can use username, email, or phone number', 'If 2FA enabled, approve from trusted device', 'Look for "Save login info" checkbox']
      },
      {
        stepNumber: 3,
        title: 'Access Profile Settings',
        description: 'Go to your profile and settings',
        action: 'Click profile icon (bottom right) → Click menu icon → Settings',
        videoUrl: DEMO_VIDEOS.navigate,
        credentials: null,
        tips: ['Profile icon looks like a person silhouette', 'Menu icon is three horizontal lines', 'Settings should be at bottom of menu']
      },
      {
        stepNumber: 4,
        title: 'Document Account Details',
        description: 'Record profile and account information',
        action: 'Screenshot: Username, Bio, Email, Phone, Followers count, Following count, Verification status',
        videoUrl: DEMO_VIDEOS.document,
        credentials: null,
        tips: ['Check "Accounts" section for connected accounts', 'Note any two-factor authentication method', 'Look for verified badge status']
      },
      {
        stepNumber: 5,
        title: 'Logout Safely',
        description: 'Sign out of Instagram',
        action: 'Click menu icon → Scroll to bottom → Tap "Log out"',
        videoUrl: DEMO_VIDEOS.logout,
        credentials: null,
        tips: ['Confirm logout on next screen', 'Check "Also log out on other devices" if needed', 'Clear cookies for shared computers']
      }
    ]
  },

  'PayPal': {
    appName: 'PayPal',
    icon: 'fab fa-paypal',
    category: 'Finance',
    color: '#003087',
    steps: [
      {
        stepNumber: 1,
        title: 'Open PayPal Website',
        description: 'Navigate to official PayPal site',
        action: 'Go to https://www.paypal.com in your browser',
        videoUrl: DEMO_VIDEOS.open,
        credentials: null,
        tips: ['Look for blue PayPal logo', 'Verify HTTPS lock icon', 'Never click PayPal links in emails']
      },
      {
        stepNumber: 2,
        title: 'Login to Account',
        description: 'Sign in with your credentials',
        action: 'Click "Log In" button (top right) → Enter email → Enter password → Click "Log In"',
        videoUrl: DEMO_VIDEOS.login,
        credentials: ['email', 'password'],
        tips: ['Use email associated with PayPal account', 'If 2FA enabled, check email for code', 'Password is case-sensitive']
      },
      {
        stepNumber: 3,
        title: 'Access Account Settings',
        description: 'Navigate to account settings',
        action: 'Click account icon (top right) → Settings → Click "Account settings" or "Wallet"',
        videoUrl: DEMO_VIDEOS.navigate,
        credentials: null,
        tips: ['Look for gear/cog icon', 'Select "Settings" from dropdown menu', 'You should see your account overview']
      },
      {
        stepNumber: 4,
        title: 'Document Financial Information',
        description: 'Record all payment methods and account details',
        action: 'Screenshot: Bank accounts, Credit cards, Account balance, Transaction history, Linked PayPal accounts',
        videoUrl: DEMO_VIDEOS.document,
        credentials: null,
        tips: ['Note last 4 digits of each payment method', 'Check for any unauthorized transactions', 'Record business vs personal account type']
      },
      {
        stepNumber: 5,
        title: 'Logout Securely',
        description: 'Sign out of PayPal',
        action: 'Click account icon (top right) → Click "Log Out"',
        videoUrl: DEMO_VIDEOS.logout,
        credentials: null,
        tips: ['Check "Sign me out of all accounts" option', 'Clear cookies on shared computers', 'Never save password in browser']
      }
    ]
  },

  'Bank Account': {
    appName: 'Bank Account',
    icon: 'fas fa-university',
    category: 'Finance',
    color: '#003087',
    steps: [
      {
        stepNumber: 1,
        title: 'Visit Bank Portal',
        description: 'Open your bank\'s official website',
        action: 'Go directly to your bank\'s website (e.g., chase.com, bofa.com, wellsfargo.com)',
        videoUrl: DEMO_VIDEOS.open,
        credentials: null,
        tips: ['Verify HTTPS and bank logo', 'Never use bank links from emails', 'Never click links from text messages', 'Bookmark the page for future use']
      },
      {
        stepNumber: 2,
        title: 'Login to Online Banking',
        description: 'Sign in with your banking credentials',
        action: 'Click "Log In" or "Sign In" → Enter username and password → Enter OTP if prompted',
        videoUrl: DEMO_VIDEOS.login,
        credentials: ['username', 'password'],
        tips: ['Username may be different from account number', 'Answer security questions if prompted', 'May need to approve from authenticator app']
      },
      {
        stepNumber: 3,
        title: 'View All Accounts',
        description: 'See all your bank accounts',
        action: 'Navigate to "My Accounts" or "Account Overview" → View all checking, savings, and credit accounts',
        videoUrl: DEMO_VIDEOS.navigate,
        credentials: null,
        tips: ['Check for any accounts you forgot about', 'Note any joint accounts', 'Look for savings, checking, credit line accounts']
      },
      {
        stepNumber: 4,
        title: 'Document Account Details',
        description: 'Record critical account information',
        action: 'Screenshot each account: Account number, Account type, Current balance, Routing number, SWIFT code, Beneficiaries',
        videoUrl: DEMO_VIDEOS.document,
        credentials: null,
        tips: ['Write down all account numbers', 'Note monthly balance', 'Screenshot beneficiary info for wire transfers', 'Check for any frozen or restricted accounts']
      },
      {
        stepNumber: 5,
        title: 'Logout Securely',
        description: 'Sign out of online banking',
        action: 'Click "Logout" or "Sign Out" button → Confirm logout on next screen',
        videoUrl: DEMO_VIDEOS.logout,
        credentials: null,
        tips: ['Always use official logout button', 'Clear browser cache on shared computers', 'Don\'t stay logged in on public WiFi', 'Close all tabs before leaving']
      }
    ]
  },

  'Amazon': {
    appName: 'Amazon',
    icon: 'fab fa-amazon',
    category: 'E-commerce',
    color: '#FF9900',
    steps: [
      {
        stepNumber: 1,
        title: 'Open Amazon Website',
        description: 'Navigate to Amazon',
        action: 'Go to https://www.amazon.com in your browser',
        videoUrl: DEMO_VIDEOS.open,
        credentials: null,
        tips: ['Look for orange Amazon smile logo', 'Make sure you\'re on amazon.com (not international site)', 'Verify HTTPS lock']
      },
      {
        stepNumber: 2,
        title: 'Login to Account',
        description: 'Sign in with your credentials',
        action: 'Click "Account & Lists" → Sign in → Enter email/phone → Enter password',
        videoUrl: DEMO_VIDEOS.login,
        credentials: ['email', 'password'],
        tips: ['Can use email or phone number', 'If 2FA enabled, check email or app for code', 'Check "Keep me signed in" for convenience']
      },
      {
        stepNumber: 3,
        title: 'Access Your Account',
        description: 'Go to account settings',
        action: 'Click "Account & Lists" (top right) → Click "Your Account" or "Account"',
        videoUrl: DEMO_VIDEOS.navigate,
        credentials: null,
        tips: ['Should see navigation menu', 'Look for "Login & security" section', 'Check for "Manage Addresses"']
      },
      {
        stepNumber: 4,
        title: 'Document Account Details',
        description: 'Record all account information',
        action: 'Screenshot: Email address, Phone number, Addresses, Payment methods, Prime status, Transaction history, Wish lists',
        videoUrl: DEMO_VIDEOS.document,
        credentials: null,
        tips: ['Check each address saved', 'Note all credit cards and payment methods', 'Record Prime membership status and expiration', 'Check for any linked household accounts']
      },
      {
        stepNumber: 5,
        title: 'Logout Safely',
        description: 'Sign out of Amazon',
        action: 'Click "Account & Lists" → Scroll down → Click "Sign Out"',
        videoUrl: DEMO_VIDEOS.logout,
        credentials: null,
        tips: ['Confirm logout message appears', 'Check "Sign me out of other devices" if shared computer', 'Clear cookies if using public computer']
      }
    ]
  },

  'Google Drive': {
    appName: 'Google Drive',
    icon: 'fab fa-google-drive',
    category: 'Cloud Storage',
    color: '#4285F4',
    steps: [
      {
        stepNumber: 1,
        title: 'Open Google Drive',
        description: 'Access your Google Drive',
        action: 'Go to https://drive.google.com in your browser',
        videoUrl: DEMO_VIDEOS.open,
        credentials: null,
        tips: ['You may be auto-logged if using Chrome', 'Uses same login as Gmail/YouTube', 'Verify Google logo in top left']
      },
      {
        stepNumber: 2,
        title: 'Login to Account',
        description: 'Sign in with your Google account',
        action: 'Enter your Google email (usually same as Gmail) → Enter password',
        videoUrl: DEMO_VIDEOS.login,
        credentials: ['email', 'password'],
        tips: ['Uses your Google account', 'If 2FA enabled, check phone or email for code', 'Password is case-sensitive']
      },
      {
        stepNumber: 3,
        title: 'Review Your Files',
        description: 'Navigate through your Google Drive',
        action: 'Check "My Drive" folder → Review all files and folders → Check "Shared with me"',
        videoUrl: DEMO_VIDEOS.navigate,
        credentials: null,
        tips: ['Look for important documents', 'Check shared folders that you have access to', 'Note any projects or collaborative folders']
      },
      {
        stepNumber: 4,
        title: 'Document Important Files',
        description: 'Record critical documents and structure',
        action: 'Screenshot: Important files, Folder structure, File names, Date modified, Size, Shared status, Collaborators',
        videoUrl: DEMO_VIDEOS.document,
        credentials: null,
        tips: ['List all important documents', 'Check who has access to shared files', 'Note file types (docs, sheets, slides)', 'Screenshot folder organization']
      },
      {
        stepNumber: 5,
        title: 'Logout Safely',
        description: 'Sign out of Google Drive',
        action: 'Click your profile icon (top right) → "Sign out"',
        videoUrl: DEMO_VIDEOS.logout,
        credentials: null,
        tips: ['May log out of all Google services', 'Check "Sign me out of other devices" option', 'Clear cookies on shared computers']
      }
    ]
  },

  'Dropbox': {
    appName: 'Dropbox',
    icon: 'fab fa-dropbox',
    category: 'Cloud Storage',
    color: '#0061FF',
    steps: [
      {
        stepNumber: 1,
        title: 'Open Dropbox Website',
        description: 'Navigate to Dropbox',
        action: 'Go to https://www.dropbox.com in your browser',
        videoUrl: DEMO_VIDEOS.open,
        credentials: null,
        tips: ['Look for blue Dropbox box logo', 'Make sure you\'re on dropbox.com', 'Verify HTTPS lock icon']
      },
      {
        stepNumber: 2,
        title: 'Login to Account',
        description: 'Sign in with your credentials',
        action: 'Click "Sign In" (top right) → Enter email → Enter password',
        videoUrl: DEMO_VIDEOS.login,
        credentials: ['email', 'password'],
        tips: ['Email should be associated with Dropbox', 'If 2FA enabled, approve from phone/email', 'Check "Stay signed in" for future visits']
      },
      {
        stepNumber: 3,
        title: 'Browse Your Files',
        description: 'View all your Dropbox contents',
        action: 'Navigate through folders → Check "Files" section → Review all folders and files',
        videoUrl: DEMO_VIDEOS.navigate,
        credentials: null,
        tips: ['Check main directory first', 'Look for shared folders (marked with shared icon)', 'Check for deleted files in "Deleted files" section']
      },
      {
        stepNumber: 4,
        title: 'Document File Structure',
        description: 'Record important files and organization',
        action: 'Screenshot: Folder structure, Important files, File names, Shared folders, Storage usage',
        videoUrl: DEMO_VIDEOS.document,
        credentials: null,
        tips: ['List all main folders', 'Note which folders are shared with others', 'Check storage space used', 'Screenshot key project folders']
      },
      {
        stepNumber: 5,
        title: 'Logout Securely',
        description: 'Sign out of Dropbox',
        action: 'Click your profile (top right) → "Sign out"',
        videoUrl: DEMO_VIDEOS.logout,
        credentials: null,
        tips: ['Confirm logout message', 'Check "Sign me out on all devices" if needed', 'Clear browser cookies on shared computers']
      }
    ]
  },

  'iCloud': {
    appName: 'iCloud',
    icon: 'fab fa-apple',
    category: 'Cloud Storage',
    color: '#000000',
    steps: [
      {
        stepNumber: 1,
        title: 'Open iCloud.com',
        description: 'Access iCloud website',
        action: 'Go to https://www.icloud.com in your browser',
        videoUrl: DEMO_VIDEOS.open,
        credentials: null,
        tips: ['Look for Apple logo and cloud icon', 'Must use HTTPS for security', 'Works on any browser (not just Apple devices)']
      },
      {
        stepNumber: 2,
        title: 'Login with Apple ID',
        description: 'Sign in with your Apple ID',
        action: 'Enter your Apple ID email → Enter password',
        videoUrl: DEMO_VIDEOS.login,
        credentials: ['apple_id', 'password'],
        tips: ['Apple ID is usually an email address', 'If 2FA enabled, approve from trusted device', 'May need to verify via SMS or email']
      },
      {
        stepNumber: 3,
        title: 'Access iCloud Services',
        description: 'View all available iCloud services',
        action: 'See icons for: Mail, Contacts, Reminders, Notes, Photos, iCloud Drive, Pages, Numbers, Keynote',
        videoUrl: DEMO_VIDEOS.navigate,
        credentials: null,
        tips: ['Click each service to explore', 'Check iCloud Drive for documents', 'View Photos library storage', 'Check for shared albums']
      },
      {
        stepNumber: 4,
        title: 'Document Account Settings',
        description: 'Record account and storage information',
        action: 'Screenshot: Apple ID, Storage usage, Device list, Trusted numbers, Recovery contacts, Two-factor status',
        videoUrl: DEMO_VIDEOS.document,
        credentials: null,
        tips: ['Check trusted devices list', 'Note recovery email address', 'Record account creation date', 'Check two-factor authentication status']
      },
      {
        stepNumber: 5,
        title: 'Logout Safely',
        description: 'Sign out of iCloud',
        action: 'Click Apple ID (top right) → "Sign Out"',
        videoUrl: DEMO_VIDEOS.logout,
        credentials: null,
        tips: ['Confirm logout message appears', 'Remove account from other devices if needed', 'Clear cookies on public computers']
      }
    ]
  },

  'LinkedIn': {
    appName: 'LinkedIn',
    icon: 'fab fa-linkedin',
    category: 'Social Media',
    color: '#0A66C2',
    steps: [
      {
        stepNumber: 1,
        title: 'Open LinkedIn Website',
        description: 'Navigate to LinkedIn',
        action: 'Go to https://www.linkedin.com in your browser',
        videoUrl: DEMO_VIDEOS.open,
        credentials: null,
        tips: ['Look for blue LinkedIn "in" logo', 'Verify HTTPS lock icon', 'Never use links from emails']
      },
      {
        stepNumber: 2,
        title: 'Login to Account',
        description: 'Sign in with credentials',
        action: 'Click "Sign In" (top right) → Enter email → Enter password',
        videoUrl: DEMO_VIDEOS.login,
        credentials: ['email', 'password'],
        tips: ['Can use personal or business email', 'If 2FA enabled, approve via phone/email', 'Check "Remember me" for convenience']
      },
      {
        stepNumber: 3,
        title: 'Access Your Profile',
        description: 'Go to your LinkedIn profile',
        action: 'Click "Me" (top navigation) → View profile → Edit profile button',
        videoUrl: DEMO_VIDEOS.navigate,
        credentials: null,
        tips: ['Profile icon looks like a person', 'Check headline and summary', 'Review experience section']
      },
      {
        stepNumber: 4,
        title: 'Document Profile & Settings',
        description: 'Record your LinkedIn information',
        action: 'Screenshot: Profile summary, Skills, Experience, Education, Connections count, Recommendations, Settings',
        videoUrl: DEMO_VIDEOS.document,
        credentials: null,
        tips: ['Note number of connections', 'Check endorsements received', 'Record certifications and credentials', 'Check privacy/visibility settings']
      },
      {
        stepNumber: 5,
        title: 'Logout Securely',
        description: 'Sign out of LinkedIn',
        action: 'Click profile picture (top right) → "Sign Out"',
        videoUrl: DEMO_VIDEOS.logout,
        credentials: null,
        tips: ['Confirm logout message appears', 'Check "Sign out on other devices" if shared computer', 'Clear cache and cookies']
      }
    ]
  }
};

/**
 * Get workflow for a specific platform
 * @param {string} platformName - Name of the platform
 * @returns {object} Workflow object with all steps
 */
function getWorkflow(platformName) {
  return WORKFLOWS[platformName] || WORKFLOWS['Gmail'];
}

/**
 * Get all available platforms
 * @returns {array} Array of platform names
 */
function getAvailablePlatforms() {
  return Object.keys(WORKFLOWS);
}

/**
 * Get workflow by category
 * @param {string} category - Category name (Email, Finance, Social Media, etc.)
 * @returns {array} Array of workflows in that category
 */
function getWorkflowsByCategory(category) {
  return Object.values(WORKFLOWS).filter(workflow => workflow.category === category);
}

