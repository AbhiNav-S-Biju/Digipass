/**
 * DIGIPASS Workflow Steps - Action-Specific Versions
 * Detailed instructions for Delete, Pass, and Last Message operations
 */

const WORKFLOWS = {
  // ============= SOCIAL MEDIA: INSTAGRAM =============
  'Instagram': {
    appName: 'Instagram',
    icon: 'fab fa-instagram',
    category: 'Social Media',
    color: '#E4405F',
    actions: {
      'delete': {
        title: 'Delete Instagram Account',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Instagram',
            description: 'Navigate to Instagram website',
            action: 'Go to https://www.instagram.com in your web browser (not mobile app)',
            credentials: null,
            tips: ['Use desktop/web browser for best experience', 'Mobile app doesn\'t have delete option', 'Use incognito mode for privacy']
          },
          {
            stepNumber: 2,
            title: 'Login to Account',
            description: 'Sign in with provided credentials',
            action: 'Click "Log In" → Enter username/email → Enter password → Click "Log in"',
            credentials: ['username', 'password'],
            tips: ['If 2FA enabled, approve from phone', 'Username or email works', 'Don\'t check "Save login info"']
          },
          {
            stepNumber: 3,
            title: 'Go to Settings',
            description: 'Access account settings menu',
            action: 'Click profile icon (bottom right) → Click menu icon (three lines) → Click "Settings"',
            credentials: null,
            tips: ['Settings should be at the bottom of menu', 'Look for gear icon or "Settings" text', 'You should see account options']
          },
          {
            stepNumber: 4,
            title: 'Find Delete Account Option',
            description: 'Locate the account deletion section',
            action: 'In Settings → Click "Help" → Click "Help Center" → Search "delete account" → Follow link to delete form',
            credentials: null,
            tips: ['Or go directly to instagram.com/accounts/delete/', 'You\'ll see deletion options', 'Instagram requires account verification']
          },
          {
            stepNumber: 5,
            title: 'Confirm Deletion',
            description: 'Complete the account deletion process',
            action: 'Enter password again → Select deletion reason → Click "Permanently delete [username]" → Confirm on next page',
            credentials: ['password'],
            tips: ['Account deletion takes 30 days to finalize', 'Content will be removed after 30 days', 'Cannot restore account after this period']
          }
        ]
      },
      'pass': {
        title: 'Pass Instagram Account to Executor',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Instagram',
            description: 'Navigate to Instagram website',
            action: 'Go to https://www.instagram.com',
            credentials: null,
            tips: ['Use web browser version', 'Keep password secure during transition']
          },
          {
            stepNumber: 2,
            title: 'Login to Account',
            description: 'Sign in with account credentials',
            action: 'Click "Log In" → Enter username → Enter password',
            credentials: ['username', 'password'],
            tips: ['Verify credentials are correct', 'Check 2FA settings']
          },
          {
            stepNumber: 3,
            title: 'Change Password Temporarily',
            description: 'Update password for executor access',
            action: 'Go to Settings → Security → Password → Enter current password → Set new temporary password → Confirm',
            credentials: ['password'],
            tips: ['Use a strong temporary password', 'Share with executor securely', 'Change back later if needed']
          },
          {
            stepNumber: 4,
            title: 'Enable Login Approvals (Optional)',
            description: 'Allow executor to approve logins',
            action: 'Go to Settings → Security → Login approvals → Turn ON',
            credentials: null,
            tips: ['Executor will approve login from new device', 'Extra security measure', 'Not required but recommended']
          },
          {
            stepNumber: 5,
            title: 'Document Account Details',
            description: 'Record all account information',
            action: 'Screenshot: Username, Email connected, Phone number, Recovery options, Trusted contacts',
            credentials: null,
            tips: ['Write down all account emails', 'Note recovery phone number', 'List any two-factor methods']
          }
        ]
      },
      'last_message': {
        title: 'Select Last Message on Instagram',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Instagram',
            description: 'Go to Instagram',
            action: 'Go to https://www.instagram.com',
            credentials: null,
            tips: ['Use web browser', 'Direct messages only available on web/app']
          },
          {
            stepNumber: 2,
            title: 'Login to Account',
            description: 'Sign in',
            action: 'Enter username → Enter password → Click "Log in"',
            credentials: ['username', 'password'],
            tips: ['Verify 2FA if enabled']
          },
          {
            stepNumber: 3,
            title: 'Open Direct Messages',
            description: 'Access your DM inbox',
            action: 'Click messenger/chat icon (top right, looks like paper plane) → View all conversations',
            credentials: null,
            tips: ['Icon is in top navigation bar', 'Shows all active conversations', 'Newest messages appear first']
          },
          {
            stepNumber: 4,
            title: 'Select Final Message to Send',
            description: 'Choose important message to send before account closure',
            action: 'Open desired conversation → Click that conversation → Type final message → Type your farewell/instructions',
            credentials: null,
            tips: ['Keep message professional and brief', 'Explain your passing/absence', 'Provide executor contact info if needed']
          },
          {
            stepNumber: 5,
            title: 'Send Message',
            description: 'Send your last message',
            action: 'Review message → Click send button (arrow icon) → Confirm sent',
            credentials: null,
            tips: ['Message will appear in conversation thread', 'Can be seen by recipient immediately', 'Consider enabling "Restrict" on account after']
          }
        ]
      }
    }
  },

  // ============= SOCIAL MEDIA: FACEBOOK =============
  'Facebook': {
    appName: 'Facebook',
    icon: 'fab fa-facebook',
    category: 'Social Media',
    color: '#1877F2',
    actions: {
      'delete': {
        title: 'Delete Facebook Account',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Facebook',
            description: 'Navigate to Facebook',
            action: 'Go to https://www.facebook.com',
            credentials: null,
            tips: ['Use desktop browser', 'Verify blue Facebook logo', 'Check HTTPS lock']
          },
          {
            stepNumber: 2,
            title: 'Login to Account',
            description: 'Sign in with credentials',
            action: 'Click "Log In" → Enter email/phone → Enter password → Click "Log In"',
            credentials: ['email', 'password'],
            tips: ['Use email or phone associated with account', 'If 2FA enabled, approve from device', 'Keep browser open']
          },
          {
            stepNumber: 3,
            title: 'Open Settings & Privacy',
            description: 'Go to account settings',
            action: 'Click downward arrow (top right) → Click "Settings & privacy" → Click "Settings"',
            credentials: null,
            tips: ['Should see left sidebar menu', 'Look for "Settings" text', 'Not "Help & Support"']
          },
          {
            stepNumber: 4,
            title: 'Find Delete Account Option',
            description: 'Locate account deletion',
            action: 'In left menu, click "Deactivation and deletion" (might be under "Personal information") → Select "Delete account" → Click "Continue"',
            credentials: null,
            tips: ['Facebook calls it "Deactivation and deletion"', 'Two options: Deactivate (temporary) or Delete (permanent)', 'Choose "Delete account"']
          },
          {
            stepNumber: 5,
            title: 'Confirm Deletion',
            description: 'Complete the deletion',
            action: 'Enter password again → Complete security check (if prompted) → Click "Delete account" button → Confirm',
            credentials: ['password'],
            tips: ['Deletion takes 30 days', 'Can\'t restore account after 30 days', 'You\'ll receive confirmation email']
          }
        ]
      },
      'pass': {
        title: 'Pass Facebook Account to Executor',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Facebook',
            description: 'Navigate to Facebook',
            action: 'Go to https://www.facebook.com',
            credentials: null,
            tips: ['Use web browser']
          },
          {
            stepNumber: 2,
            title: 'Login to Account',
            description: 'Sign in',
            action: 'Enter email/phone → Enter password',
            credentials: ['email', 'password'],
            tips: ['Verify credentials work']
          },
          {
            stepNumber: 3,
            title: 'Change Password',
            description: 'Set new temporary password',
            action: 'Click downward arrow → Settings & privacy → Settings → Security and login → Passwords → Click "Change password" → Enter current password → Set new temporary password',
            credentials: ['password'],
            tips: ['Create strong temporary password', 'Share securely with executor']
          },
          {
            stepNumber: 4,
            title: 'Add Executor as Contact',
            description: 'Set up account recovery contact',
            action: 'In "Security and login" section → Click "Where you\'re logged in" → Check for trusted contacts feature → Add executor email/phone',
            credentials: null,
            tips: ['Facebook allows recovery contacts', 'Executor can help recover account if needed']
          },
          {
            stepNumber: 5,
            title: 'Document Account Info',
            description: 'Record all important details',
            action: 'Screenshot: Email address, Phone number, Recovery contacts, Friends list (if important), Memorial preferences',
            credentials: null,
            tips: ['Document all linked emails', 'Note any business pages managed', 'Record account creation date']
          }
        ]
      },
      'last_message': {
        title: 'Send Last Message on Facebook',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Facebook',
            description: 'Go to Facebook',
            action: 'Go to https://www.facebook.com',
            credentials: null,
            tips: ['Use web browser']
          },
          {
            stepNumber: 2,
            title: 'Login to Account',
            description: 'Sign in',
            action: 'Enter email → Enter password',
            credentials: ['email', 'password'],
            tips: ['Verify 2FA if needed']
          },
          {
            stepNumber: 3,
            title: 'Open Messenger',
            description: 'Access your messages',
            action: 'Click messenger icon (looks like chat bubble, top left) or go to messenger.com → View your conversations',
            credentials: null,
            tips: ['Messenger icon in top left of Facebook', 'Shows all active conversations', 'Can also use messenger.com directly']
          },
          {
            stepNumber: 4,
            title: 'Select Conversation',
            description: 'Choose recipient for final message',
            action: 'Click on the conversation you want to message → Click message input field',
            credentials: null,
            tips: ['Can message multiple people', 'Consider messaging close family/friends', 'Keep message brief and meaningful']
          },
          {
            stepNumber: 5,
            title: 'Type and Send Final Message',
            description: 'Send your last message',
            action: 'Type your message → Click send button (arrow) → Confirm sent',
            credentials: null,
            tips: ['Message delivered immediately', 'They\'ll see it right away', 'Consider enabling "Story" with farewell note']
          }
        ]
      }
    }
  },

  // ============= SOCIAL MEDIA: TWITTER (X) =============
  'Twitter': {
    appName: 'Twitter',
    icon: 'fab fa-twitter',
    category: 'Social Media',
    color: '#000000',
    actions: {
      'delete': {
        title: 'Delete Twitter Account',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Twitter',
            description: 'Navigate to Twitter',
            action: 'Go to https://www.twitter.com or https://www.x.com',
            credentials: null,
            tips: ['Twitter now called X', 'Both URLs work', 'Use web browser']
          },
          {
            stepNumber: 2,
            title: 'Login to Account',
            description: 'Sign in with credentials',
            action: 'Click "Sign In" → Enter email/username/phone → Enter password → Complete verification if needed',
            credentials: ['email', 'password'],
            tips: ['Can use email, username, or phone', 'If 2FA enabled, use authenticator app', 'Stay logged in for next steps']
          },
          {
            stepNumber: 3,
            title: 'Open Settings & Privacy',
            description: 'Go to account settings',
            action: 'Click profile icon (top left) → Click "More" (...) → Click "Settings and privacy" → Click "Settings"',
            credentials: null,
            tips: ['Profile icon shows your avatar', 'Look for three-dot menu', '"Settings and privacy" in menu']
          },
          {
            stepNumber: 4,
            title: 'Find Account Deactivation',
            description: 'Locate account deletion option',
            action: 'In Settings left menu → Click "Account" → Scroll down → Click "Deactivate your account"',
            credentials: null,
            tips: ['Must scroll down in Account section', 'At the very bottom of Account settings', 'Red/warning-colored button']
          },
          {
            stepNumber: 5,
            title: 'Confirm Deactivation',
            description: 'Complete account deletion',
            action: 'Read warning message → Click "Deactivate" button → Enter password → Confirm deactivation',
            credentials: ['password'],
            tips: ['30-day grace period before permanent deletion', 'Can reactivate within 30 days', 'After 30 days, account is permanently deleted']
          }
        ]
      },
      'pass': {
        title: 'Pass Twitter Account to Executor',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Twitter',
            description: 'Go to Twitter/X',
            action: 'Go to https://www.x.com',
            credentials: null,
            tips: ['Use web browser']
          },
          {
            stepNumber: 2,
            title: 'Login to Account',
            description: 'Sign in',
            action: 'Sign in with email/username → Enter password',
            credentials: ['email', 'password'],
            tips: ['Verify credentials']
          },
          {
            stepNumber: 3,
            title: 'Change Password',
            description: 'Set new temporary password',
            action: 'Profile icon → Settings and privacy → Settings → Account → Change your password → Enter current password → Set new temporary password → Save changes',
            credentials: ['password'],
            tips: ['Create strong temporary password', 'Share with executor securely']
          },
          {
            stepNumber: 4,
            title: 'Enable Two-Factor Authentication',
            description: 'Add security for executor',
            action: 'In Account settings → Security → Authentication app → Select authentication method → Complete setup',
            credentials: null,
            tips: ['Executor will need the phone/authenticator app', 'Adds extra security layer', 'Share backup codes with executor']
          },
          {
            stepNumber: 5,
            title: 'Document Account Details',
            description: 'Record all account information',
            action: 'Screenshot: Username, Email address, Phone number (if connected), Followers count, Tweets saved, Lists created',
            credentials: null,
            tips: ['Note all connected emails', 'List any important collections/bookmarks', 'Record follower/following counts']
          }
        ]
      },
      'last_message': {
        title: 'Send Last Message (Tweet) on Twitter',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Twitter',
            description: 'Go to Twitter',
            action: 'Go to https://www.x.com',
            credentials: null,
            tips: ['Use web browser']
          },
          {
            stepNumber: 2,
            title: 'Login to Account',
            description: 'Sign in',
            action: 'Sign in with email → Enter password',
            credentials: ['email', 'password'],
            tips: ['Verify 2FA if enabled']
          },
          {
            stepNumber: 3,
            title: 'Open Home Timeline',
            description: 'Go to main feed',
            action: 'Click "Home" in left sidebar → See your main feed',
            credentials: null,
            tips: ['Home is default after login', 'You\'ll see posts from accounts you follow']
          },
          {
            stepNumber: 4,
            title: 'Compose Final Tweet',
            description: 'Write your last message',
            action: 'Click on "What\'s happening?!" text box (top of feed) → Type your final message/farewell',
            credentials: null,
            tips: ['Tweet can be up to 280 characters', 'Consider @mentioning important people', 'Make it meaningful and concise']
          },
          {
            stepNumber: 5,
            title: 'Post Tweet',
            description: 'Send your last tweet',
            action: 'Review text → Click "Post" button → Confirm posting',
            credentials: null,
            tips: ['Tweet goes live immediately', 'Can be seen by all followers', 'Can add media (image/video) if wanted']
          }
        ]
      }
    }
  },

  // ============= SOCIAL MEDIA: LINKEDIN =============
  'LinkedIn': {
    appName: 'LinkedIn',
    icon: 'fab fa-linkedin',
    category: 'Social Media',
    color: '#0A66C2',
    actions: {
      'delete': {
        title: 'Delete LinkedIn Account',
        steps: [
          {
            stepNumber: 1,
            title: 'Open LinkedIn',
            description: 'Navigate to LinkedIn',
            action: 'Go to https://www.linkedin.com',
            credentials: null,
            tips: ['Use web browser', 'Verify blue LinkedIn logo', 'Check HTTPS lock']
          },
          {
            stepNumber: 2,
            title: 'Login to Account',
            description: 'Sign in with credentials',
            action: 'Click "Sign In" → Enter email → Enter password → Click "Sign in"',
            credentials: ['email', 'password'],
            tips: ['Email associated with LinkedIn account', 'If 2FA enabled, approve from trusted device']
          },
          {
            stepNumber: 3,
            title: 'Go to Account Settings',
            description: 'Access account settings',
            action: 'Click your profile icon (top right) → Click "Settings" or "Account settings"',
            credentials: null,
            tips: ['Profile icon shows your photo', 'Look for "Settings" in dropdown menu', 'You\'ll see settings sidebar']
          },
          {
            stepNumber: 4,
            title: 'Find Account Closure',
            description: 'Locate account deletion option',
            action: 'In left sidebar → Click "Account preferences" → Scroll down → Click "Close account"',
            credentials: null,
            tips: ['Must scroll down to find it', 'Warning message will appear', 'Explains what happens with your data']
          },
          {
            stepNumber: 5,
            title: 'Confirm Account Closure',
            description: 'Complete account deletion',
            action: 'Read closure information → Select reason for closure → Enter password → Click "Close account" → Confirm',
            credentials: ['password'],
            tips: ['Account deleted immediately', 'Cannot be restored', 'Data removed permanently']
          }
        ]
      },
      'pass': {
        title: 'Pass LinkedIn Account to Executor',
        steps: [
          {
            stepNumber: 1,
            title: 'Open LinkedIn',
            description: 'Go to LinkedIn',
            action: 'Go to https://www.linkedin.com',
            credentials: null,
            tips: ['Use web browser']
          },
          {
            stepNumber: 2,
            title: 'Login to Account',
            description: 'Sign in',
            action: 'Sign In → Enter email → Enter password',
            credentials: ['email', 'password'],
            tips: ['Verify credentials work']
          },
          {
            stepNumber: 3,
            title: 'Change Password',
            description: 'Set new password for executor',
            action: 'Profile icon → Settings → Password → "Change password" → Enter current password → Set new temporary password → Save',
            credentials: ['password'],
            tips: ['Create strong temporary password', 'Share securely with executor']
          },
          {
            stepNumber: 4,
            title: 'Add Authorized Contacts',
            description: 'Set up account recovery',
            action: 'Settings → Account → Click "Authorized contacts" → Add contact → Enter executor email',
            credentials: null,
            tips: ['LinkedIn allows designated contacts', 'They can help with account access', 'Add executor as trusted contact']
          },
          {
            stepNumber: 5,
            title: 'Document Profile Information',
            description: 'Record all account details',
            action: 'Screenshot: Email address, Phone number, Connections (count), Endorsements, Recommendations, Experience, Education',
            credentials: null,
            tips: ['Note all job titles/companies', 'List important recommendations', 'Record groups/associations']
          }
        ]
      },
      'last_message': {
        title: 'Send Last Message on LinkedIn',
        steps: [
          {
            stepNumber: 1,
            title: 'Open LinkedIn',
            description: 'Go to LinkedIn',
            action: 'Go to https://www.linkedin.com',
            credentials: null,
            tips: ['Use web browser']
          },
          {
            stepNumber: 2,
            title: 'Login to Account',
            description: 'Sign in',
            action: 'Sign In → Email → Password',
            credentials: ['email', 'password'],
            tips: ['Verify 2FA if enabled']
          },
          {
            stepNumber: 3,
            title: 'Open Messaging',
            description: 'Access your messages',
            action: 'Click messaging icon (looks like speech bubble, top navigation) → View conversations',
            credentials: null,
            tips: ['Icon in top right area', 'Shows all active 1-on-1 conversations', 'Can start new conversation']
          },
          {
            stepNumber: 4,
            title: 'Select Recipient',
            description: 'Choose who to message',
            action: 'Click on existing conversation OR click "New message" to start new conversation → Select recipient',
            credentials: null,
            tips: ['Can message connections', 'Search for names to find people', 'Consider messaging close colleagues']
          },
          {
            stepNumber: 5,
            title: 'Type and Send Message',
            description: 'Send your final message',
            action: 'Click message field → Type your message → Click send button → Confirm',
            credentials: null,
            tips: ['Keep professional tone', 'Explain situation briefly', 'Provide contact info if needed']
          }
        ]
      }
    }
  },

  // ============= EMAIL: GMAIL =============
  'Gmail': {
    appName: 'Gmail',
    icon: 'fas fa-envelope',
    category: 'Email',
    color: '#EA4335',
    actions: {
      'delete': {
        title: 'Delete Gmail Account',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Google Account',
            description: 'Go to Google Account settings',
            action: 'Go to https://myaccount.google.com in your browser',
            credentials: null,
            tips: ['Not Gmail.com - use myaccount.google.com', 'This is Google Account dashboard', 'Verify Google logo']
          },
          {
            stepNumber: 2,
            title: 'Login to Google Account',
            description: 'Sign in with Gmail credentials',
            action: 'You may already be logged in. If not: Enter email → Enter password → Complete 2FA if needed',
            credentials: ['email', 'password'],
            tips: ['Same email as Gmail', 'If 2FA enabled, check phone or email for code']
          },
          {
            stepNumber: 3,
            title: 'Go to Data & Privacy',
            description: 'Access account deletion section',
            action: 'In left sidebar, click "Data & privacy"',
            credentials: null,
            tips: ['Left menu shows different tabs', '"Data & privacy" is one of them', 'You\'ll see privacy options']
          },
          {
            stepNumber: 4,
            title: 'Delete Your Google Account',
            description: 'Find account deletion option',
            action: 'Scroll down → Click "Delete your Google Account" OR click "Delete a service"',
            credentials: null,
            tips: ['Two options: Delete whole account or just Gmail', 'Choose based on what you want', 'Warning explains what gets deleted']
          },
          {
            stepNumber: 5,
            title: 'Confirm Deletion',
            description: 'Complete account deletion',
            action: 'Download your data if needed → Check confirmation boxes → Click "Delete account" → Enter password → Click "Delete account" again',
            credentials: ['password'],
            tips: ['Can download data before deletion', 'Option to export emails', 'Deletion is permanent after 30 days']
          }
        ]
      },
      'pass': {
        title: 'Pass Gmail Account to Executor',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Gmail',
            description: 'Go to Gmail',
            action: 'Go to https://mail.google.com',
            credentials: null,
            tips: ['Use web browser', 'Desktop recommended']
          },
          {
            stepNumber: 2,
            title: 'Login to Gmail',
            description: 'Sign in',
            action: 'Enter email → Enter password → Complete 2FA',
            credentials: ['email', 'password'],
            tips: ['Verify 2FA settings']
          },
          {
            stepNumber: 3,
            title: 'Change Gmail Password',
            description: 'Set new password for executor',
            action: 'Go to https://myaccount.google.com → Click "Security" in left menu → Click "Password" → Change password → Enter current password → Set new temporary password',
            credentials: ['password'],
            tips: ['Create strong temporary password', 'Share securely with executor', 'Note: Changes Google Account password']
          },
          {
            stepNumber: 4,
            title: 'Set Up Account Recovery',
            description: 'Add executor as recovery contact',
            action: 'In myaccount.google.com → Data & privacy → Set up account recovery → Add executor email or phone number',
            credentials: null,
            tips: ['Executor can recover account if needed', 'Add their email address', 'This is optional but recommended']
          },
          {
            stepNumber: 5,
            title: 'Document Email Information',
            description: 'Record all account details',
            action: 'Screenshot: Email address, Recovery emails, Recovery phone, 2FA status, Connected apps, Important labels/folders',
            credentials: null,
            tips: ['Note all recovery options', 'List important email folders', 'Document any subscriptions (email lists)']
          }
        ]
      },
      'last_message': {
        title: 'Send Last Message in Gmail',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Gmail',
            description: 'Go to Gmail',
            action: 'Go to https://mail.google.com',
            credentials: null,
            tips: ['Use web browser']
          },
          {
            stepNumber: 2,
            title: 'Login to Gmail',
            description: 'Sign in',
            action: 'Enter email → Enter password',
            credentials: ['email', 'password'],
            tips: ['Verify 2FA if enabled']
          },
          {
            stepNumber: 3,
            title: 'Start New Email',
            description: 'Compose new message',
            action: 'Click "Compose" button (top left) → Email composition window opens',
            credentials: null,
            tips: ['Red "Compose" button', 'Opens compose sidebar on right', 'Or click "+" for full compose page']
          },
          {
            stepNumber: 4,
            title: 'Write Your Message',
            description: 'Write final email',
            action: 'To: Enter recipient email address → Subject: Type subject → Body: Type your message → Review before sending',
            credentials: null,
            tips: ['Can add multiple recipients', 'Consider: Family, Friends, Important contacts', 'Keep tone appropriate and clear']
          },
          {
            stepNumber: 5,
            title: 'Send Email',
            description: 'Send your last message',
            action: 'Review everything → Click "Send" button (arrow icon at bottom) → Confirm sent',
            credentials: null,
            tips: ['Email sent immediately', 'Recipient gets notification', 'You can\'t unsend after brief period']
          }
        ]
      }
    }
  },

  // ============= EMAIL: OUTLOOK =============
  'Outlook': {
    appName: 'Outlook',
    icon: 'fas fa-envelope',
    category: 'Email',
    color: '#0078D4',
    actions: {
      'delete': {
        title: 'Delete Outlook Account',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Microsoft Account',
            description: 'Go to Microsoft Account settings',
            action: 'Go to https://account.microsoft.com',
            credentials: null,
            tips: ['This is Microsoft Account management', 'Not Outlook.com - use account.microsoft.com', 'You might be auto-logged in']
          },
          {
            stepNumber: 2,
            title: 'Login to Microsoft Account',
            description: 'Sign in with Outlook email',
            action: 'Enter email → Enter password → Complete 2FA (text or phone call or app)',
            credentials: ['email', 'password'],
            tips: ['Email associated with Outlook/Microsoft', 'If 2FA enabled, approve request']
          },
          {
            stepNumber: 3,
            title: 'Go to Privacy & Security',
            description: 'Access account settings',
            action: 'In left sidebar, click "Privacy & security" or "Data & privacy"',
            credentials: null,
            tips: ['Left menu shows different sections', 'Look for privacy-related section']
          },
          {
            stepNumber: 4,
            title: 'Find Account Closure',
            description: 'Locate deletion option',
            action: 'Scroll down → Look for "Close your account" or "Delete account" → Click it',
            credentials: null,
            tips: ['Usually at bottom of page', 'Warning explains what happens', 'Cannot undo after closure']
          },
          {
            stepNumber: 5,
            title: 'Confirm Closure',
            description: 'Complete account closure',
            action: 'Verify account (may need to enter password) → Check boxes for understanding → Click "Close account" → Confirm final deletion',
            credentials: ['password'],
            tips: ['May require password verification', 'Data deletion takes 30 days', 'Cannot be recovered after']
          }
        ]
      },
      'pass': {
        title: 'Pass Outlook Account to Executor',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Outlook',
            description: 'Go to Outlook',
            action: 'Go to https://outlook.com or https://mail.live.com',
            credentials: null,
            tips: ['Use web browser']
          },
          {
            stepNumber: 2,
            title: 'Login to Outlook',
            description: 'Sign in',
            action: 'Enter email → Enter password → Complete 2FA',
            credentials: ['email', 'password'],
            tips: ['Verify credentials']
          },
          {
            stepNumber: 3,
            title: 'Change Account Password',
            description: 'Set new password',
            action: 'Go to https://account.microsoft.com → Click "Security" → Click "Password" → Change password → Enter current password → Set new temporary password',
            credentials: ['password'],
            tips: ['Create strong temporary password', 'Share securely with executor']
          },
          {
            stepNumber: 4,
            title: 'Add Trusted Contact',
            description: 'Set up recovery contact',
            action: 'In account.microsoft.com → Security → "Advanced security options" → Add trusted contact → Enter executor email/phone',
            credentials: null,
            tips: ['Microsoft allows trusted contacts', 'They can help recover account', 'Add executor as contact']
          },
          {
            stepNumber: 5,
            title: 'Document Account Details',
            description: 'Record all information',
            action: 'Screenshot: Email address, Recovery email, Recovery phone, 2FA method, Vault items (if any), Connected apps',
            credentials: null,
            tips: ['Note recovery options', 'List connected apps/services', 'Document important folders']
          }
        ]
      },
      'last_message': {
        title: 'Send Last Message in Outlook',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Outlook',
            description: 'Go to Outlook',
            action: 'Go to https://outlook.com',
            credentials: null,
            tips: ['Use web browser']
          },
          {
            stepNumber: 2,
            title: 'Login to Outlook',
            description: 'Sign in',
            action: 'Enter email → Enter password',
            credentials: ['email', 'password'],
            tips: ['Verify 2FA if enabled']
          },
          {
            stepNumber: 3,
            title: 'Start New Email',
            description: 'Compose new message',
            action: 'Click "New message" button (top left) → Compose pane opens',
            credentials: null,
            tips: ['Usually says "New message"', 'Or press keyboard shortcut (N)', 'Opens on right side or full page']
          },
          {
            stepNumber: 4,
            title: 'Write Your Final Email',
            description: 'Type your message',
            action: 'To: Enter recipient email → Subject: Type subject → Body: Type your message → Review',
            credentials: null,
            tips: ['Can add multiple recipients', 'Consider important people', 'Keep message professional']
          },
          {
            stepNumber: 5,
            title: 'Send Email',
            description: 'Send your message',
            action: 'Review email → Click "Send" button (arrow at bottom) → Confirm sent',
            credentials: null,
            tips: ['Email sent immediately', 'Recipient receives it right away', 'Cannot unsend after few seconds']
          }
        ]
      }
    }
  },

  // ============= FINANCE: PAYPAL =============
  'PayPal': {
    appName: 'PayPal',
    icon: 'fab fa-paypal',
    category: 'Finance',
    color: '#003087',
    actions: {
      'delete': {
        title: 'Delete PayPal Account',
        steps: [
          {
            stepNumber: 1,
            title: 'Open PayPal',
            description: 'Go to PayPal website',
            action: 'Go to https://www.paypal.com',
            credentials: null,
            tips: ['Use web browser', 'Verify blue PayPal logo', 'Check HTTPS lock icon']
          },
          {
            stepNumber: 2,
            title: 'Login to PayPal',
            description: 'Sign in with credentials',
            action: 'Click "Log In" → Enter email → Enter password → Complete 2FA if needed',
            credentials: ['email', 'password'],
            tips: ['If 2FA enabled, approve from phone', 'Keep logged in for next steps']
          },
          {
            stepNumber: 3,
            title: 'Open Account Settings',
            description: 'Go to settings menu',
            action: 'Click account icon (top right) → Click "Settings" or "Account settings"',
            credentials: null,
            tips: ['Account icon shows initials/photo', 'Look for Settings in dropdown menu']
          },
          {
            stepNumber: 4,
            title: 'Find Account Closure Option',
            description: 'Locate delete account',
            action: 'In Settings → Look for "Security" or "Account" section → Scroll down → Click "Close account" or "Deactivate account"',
            credentials: null,
            tips: ['Usually in Security settings', 'At bottom of options', 'PayPal calls it "Close your account"']
          },
          {
            stepNumber: 5,
            title: 'Confirm Account Closure',
            description: 'Complete deletion',
            action: 'Read warning → Verify outstanding balance is zero → Click "Close your account" → Enter password → Confirm',
            credentials: ['password'],
            tips: ['Must have zero balance', 'No pending transactions', 'Account closed immediately']
          }
        ]
      },
      'pass': {
        title: 'Pass PayPal Account to Executor',
        steps: [
          {
            stepNumber: 1,
            title: 'Open PayPal',
            description: 'Go to PayPal',
            action: 'Go to https://www.paypal.com',
            credentials: null,
            tips: ['Use web browser']
          },
          {
            stepNumber: 2,
            title: 'Login to PayPal',
            description: 'Sign in',
            action: 'Log In → Enter email → Enter password',
            credentials: ['email', 'password'],
            tips: ['Verify 2FA']
          },
          {
            stepNumber: 3,
            title: 'Change Password',
            description: 'Set new password for executor',
            action: 'Account icon → Settings → Security → Change password → Enter current password → Set new temporary password → Save',
            credentials: ['password'],
            tips: ['Create strong temporary password', 'Share with executor securely']
          },
          {
            stepNumber: 4,
            title: 'Update Account Recovery',
            description: 'Add executor as trusted contact',
            action: 'In Settings → Security → Click "Add a recovery phone" or "Add recovery option" → Add executor phone number or email',
            credentials: null,
            tips: ['Executor can recover account', 'Add secondary phone/email', 'Optional but recommended']
          },
          {
            stepNumber: 5,
            title: 'Document Financial Information',
            description: 'Record all account details',
            action: 'Screenshot: Email address, Phone number, Bank accounts (last 4 digits), Credit cards (last 4 digits), PayPal balance, Transaction history, Beneficiaries',
            credentials: null,
            tips: ['Note all linked bank accounts', 'Record card information', 'Screenshot recent transactions']
          }
        ]
      }
    }
  },

  // ============= FINANCE: GOOGLE PAY =============
  'Google Pay': {
    appName: 'Google Pay',
    icon: 'fab fa-google',
    category: 'Finance',
    color: '#5F6368',
    actions: {
      'delete': {
        title: 'Delete Google Pay Account',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Google Account',
            description: 'Go to Google Account settings',
            action: 'Go to https://myaccount.google.com',
            credentials: null,
            tips: ['Google Pay data linked to Google Account', 'Use Google Account settings', 'May be auto-logged in']
          },
          {
            stepNumber: 2,
            title: 'Login to Google Account',
            description: 'Sign in',
            action: 'Enter email (if not already logged in) → Enter password → Complete 2FA',
            credentials: ['email', 'password'],
            tips: ['Same email as Google Pay']
          },
          {
            stepNumber: 3,
            title: 'Go to Data & Privacy',
            description: 'Access data settings',
            action: 'In left sidebar → Click "Data & privacy"',
            credentials: null,
            tips: ['Shows privacy and data options']
          },
          {
            stepNumber: 4,
            title: 'Delete Google Pay Information',
            description: 'Remove payment methods',
            action: 'Scroll down → Click "Delete your Google Account" OR "Delete a service" → Select "Google Pay" or "Payment methods"',
            credentials: null,
            tips: ['Can delete just Google Pay without deleting whole account', 'Or delete entire Google account']
          },
          {
            stepNumber: 5,
            title: 'Confirm Deletion',
            description: 'Complete the deletion',
            action: 'Confirm payment methods will be removed → Enter password → Click "Delete" → Final confirmation',
            credentials: ['password'],
            tips: ['All payment methods removed', 'Past transactions kept for records', 'Cannot be undone']
          }
        ]
      },
      'pass': {
        title: 'Pass Google Pay to Executor',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Google Pay',
            description: 'Go to Google Pay',
            action: 'Go to https://pay.google.com OR open Google Pay app on phone/device',
            credentials: null,
            tips: ['Web version at pay.google.com', 'Or use mobile app']
          },
          {
            stepNumber: 2,
            title: 'Login with Google Account',
            description: 'Sign in',
            action: 'Enter Google email → Enter password → Complete 2FA',
            credentials: ['email', 'password'],
            tips: ['Same Google Account as Gmail', 'Verify 2FA setting']
          },
          {
            stepNumber: 3,
            title: 'Change Google Account Password',
            description: 'Set new password',
            action: 'Go to https://myaccount.google.com → Security → Password → Change password → Enter current password → Set temporary password',
            credentials: ['password'],
            tips: ['Share new password with executor', 'Create strong temporary password']
          },
          {
            stepNumber: 4,
            title: 'Document Payment Methods',
            description: 'Record all card/bank information',
            action: 'In Google Pay or myaccount.google.com → Screenshot: All credit cards (last 4 digits), Bank accounts (last 4 digits), PayPal if linked, Transaction history',
            credentials: null,
            tips: ['Note all payment methods', 'Record expiration dates', 'Screenshot recent activity']
          },
          {
            stepNumber: 5,
            title: 'Set Recovery Options',
            description: 'Add executor for account recovery',
            action: 'In myaccount.google.com → Data & privacy → Add recovery contact → Add executor email or phone',
            credentials: null,
            tips: ['Helps executor access Google account', 'They can manage Google Pay', 'Optional but recommended']
          }
        ]
      }
    }
  },

  // ============= STORAGE: GOOGLE DRIVE =============
  'Google Drive': {
    appName: 'Google Drive',
    icon: 'fab fa-google-drive',
    category: 'Cloud Storage',
    color: '#4285F4',
    actions: {
      'delete': {
        title: 'Delete Google Drive Account',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Google Account',
            description: 'Go to Google Account settings',
            action: 'Go to https://myaccount.google.com',
            credentials: null,
            tips: ['Google Drive linked to Google Account', 'Use myaccount.google.com', 'Not drive.google.com']
          },
          {
            stepNumber: 2,
            title: 'Login to Google Account',
            description: 'Sign in',
            action: 'Enter email (if needed) → Enter password → Complete 2FA',
            credentials: ['email', 'password'],
            tips: ['Same email as Google Drive']
          },
          {
            stepNumber: 3,
            title: 'Go to Data & Privacy',
            description: 'Access data settings',
            action: 'In left sidebar → Click "Data & privacy"',
            credentials: null,
            tips: ['Shows all data management options']
          },
          {
            stepNumber: 4,
            title: 'Download Data (Optional)',
            description: 'Backup your files first',
            action: 'Click "Download or delete your data" → Click "Delete a service" → Look for Google Drive → Choose "Delete files"',
            credentials: null,
            tips: ['Optional but recommended', 'Can export all files first', 'Or just delete without backup']
          },
          {
            stepNumber: 5,
            title: 'Complete Deletion',
            description: 'Finalize deletion',
            action: 'Click "Delete a service" → Select Google Drive/Storage → Click "Delete all files" → Enter password → Confirm deletion',
            credentials: ['password'],
            tips: ['All files permanently deleted', '30-day recovery period', 'After 30 days, cannot be recovered']
          }
        ]
      },
      'pass': {
        title: 'Pass Google Drive to Executor',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Google Drive',
            description: 'Go to Google Drive',
            action: 'Go to https://drive.google.com',
            credentials: null,
            tips: ['Use web browser', 'Not the desktop app']
          },
          {
            stepNumber: 2,
            title: 'Login to Google Drive',
            description: 'Sign in',
            action: 'Enter Google email (if needed) → Enter password',
            credentials: ['email', 'password'],
            tips: ['Same email as Gmail']
          },
          {
            stepNumber: 3,
            title: 'Change Google Account Password',
            description: 'Set new password for executor',
            action: 'Go to https://myaccount.google.com → Security → Password → Change password → Enter current password → Set temporary password',
            credentials: ['password'],
            tips: ['Create strong password', 'Share with executor securely']
          },
          {
            stepNumber: 4,
            title: 'Share Important Files',
            description: 'Give executor access to key files',
            action: 'In Google Drive → Right-click important files → Click "Share" → Enter executor email → Set permissions (Viewer or Editor) → Send invite',
            credentials: null,
            tips: ['Can share specific files or folders', 'Use "Editor" for control, "Viewer" for read-only', 'Executor gets email notification']
          },
          {
            stepNumber: 5,
            title: 'Document File Locations',
            description: 'Record all important files',
            action: 'Screenshot: Folder structure, Important files list, Shared files list, Anyone with link files, Permissions granted',
            credentials: null,
            tips: ['Create a "README" document for executor', 'Explain important files', 'Note any collaborative projects']
          }
        ]
      }
    }
  },

  // ============= ENTERTAINMENT: NETFLIX =============
  'Netflix': {
    appName: 'Netflix',
    icon: 'fas fa-tv',
    category: 'Entertainment',
    color: '#E50914',
    actions: {
      'delete': {
        title: 'Delete Netflix Account',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Netflix',
            description: 'Go to Netflix website',
            action: 'Go to https://www.netflix.com',
            credentials: null,
            tips: ['Use web browser', 'Not the app', 'Verify red Netflix logo']
          },
          {
            stepNumber: 2,
            title: 'Login to Netflix',
            description: 'Sign in',
            action: 'Click "Sign In" → Enter email → Enter password → Click "Sign In"',
            credentials: ['email', 'password'],
            tips: ['Email registered with Netflix', 'Keep logged in']
          },
          {
            stepNumber: 3,
            title: 'Open Account Settings',
            description: 'Go to settings',
            action: 'Click profile icon (top right) → Click "Account" OR go to https://www.netflix.com/account',
            credentials: null,
            tips: ['Profile icon shows avatar', 'Takes you to account page']
          },
          {
            stepNumber: 4,
            title: 'Find Membership Option',
            description: 'Locate cancel/delete',
            action: 'In Account page → Look for "Membership & Billing" → Click "Cancel membership" or "Finish cancellation"',
            credentials: null,
            tips: ['Netflix calls it "Cancel membership"', 'Not full account deletion', 'Membership ends on certain date']
          },
          {
            stepNumber: 5,
            title: 'Confirm Cancellation',
            description: 'Complete cancellation',
            action: 'Click "Finish cancellation" → Confirm last date of service → Click "Cancel membership" again → Confirm',
            credentials: null,
            tips: ['Account becomes inactive', 'Data usually deleted after period', 'Can reactivate if needed']
          }
        ]
      },
      'pass': {
        title: 'Pass Netflix Account to Executor',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Netflix',
            description: 'Go to Netflix',
            action: 'Go to https://www.netflix.com',
            credentials: null,
            tips: ['Use web browser']
          },
          {
            stepNumber: 2,
            title: 'Login to Netflix',
            description: 'Sign in',
            action: 'Sign In → Enter email → Enter password',
            credentials: ['email', 'password'],
            tips: ['Verify credentials']
          },
          {
            stepNumber: 3,
            title: 'Change Account Password',
            description: 'Set new password',
            action: 'Profile icon → Account → Scroll to "Password" section → Click "Change password" → Enter current password → Set new temporary password → Save',
            credentials: ['password'],
            tips: ['Create strong temporary password', 'Share securely with executor']
          },
          {
            stepNumber: 4,
            title: 'Update Billing Information',
            description: 'Set billing for executor',
            action: 'In Account → Membership & Billing → Update payment method if needed → Can add executor payment method',
            credentials: null,
            tips: ['Keep subscription active', 'Update payment if expiring', 'Can share credential access']
          },
          {
            stepNumber: 5,
            title: 'Document Account Details',
            description: 'Record all information',
            action: 'Screenshot: Email address, Phone number, Current plan type, Payment method (last 4 digits), Billing date, Profiles created',
            credentials: null,
            tips: ['Note plan type (Basic/Standard/Premium)', 'List all profiles created', 'Document watch history access']
          }
        ]
      }
    }
  },

  // ============= ENTERTAINMENT: DISNEY+ =============
  'Disney+': {
    appName: 'Disney+',
    icon: 'fas fa-play-circle',
    category: 'Entertainment',
    color: '#113CCF',
    actions: {
      'delete': {
        title: 'Delete Disney+ Account',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Disney+',
            description: 'Go to Disney+ website',
            action: 'Go to https://www.disneyplus.com',
            credentials: null,
            tips: ['Use web browser', 'Not the app', 'Verify Disney+ logo']
          },
          {
            stepNumber: 2,
            title: 'Login to Disney+',
            description: 'Sign in',
            action: 'Click "Sign In" → Enter email → Enter password → Click "Sign In"',
            credentials: ['email', 'password'],
            tips: ['Email registered with Disney+', 'May need to verify 2FA']
          },
          {
            stepNumber: 3,
            title: 'Go to Account Settings',
            description: 'Access account page',
            action: 'Click profile icon (top right) → Click "Account" or go to https://www.disneyplus.com/account',
            credentials: null,
            tips: ['Should show account information']
          },
          {
            stepNumber: 4,
            title: 'Find Subscription Cancellation',
            description: 'Locate cancel option',
            action: 'In Account → Look for "Subscription" section → Click "Cancel subscription" or "Manage subscription"',
            credentials: null,
            tips: ['Usually under Subscription/Billing', 'Disney+ calls it "Cancel subscription"', 'Not complete account deletion']
          },
          {
            stepNumber: 5,
            title: 'Confirm Cancellation',
            description: 'Complete the cancellation',
            action: 'Click "Continue canceling" or "Cancel subscription" → Confirm end date → Click "Cancel" → Final confirmation',
            credentials: null,
            tips: ['You can watch until end date', 'Account inactive after', 'Can resubscribe anytime']
          }
        ]
      },
      'pass': {
        title: 'Pass Disney+ Account to Executor',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Disney+',
            description: 'Go to Disney+',
            action: 'Go to https://www.disneyplus.com',
            credentials: null,
            tips: ['Use web browser']
          },
          {
            stepNumber: 2,
            title: 'Login to Disney+',
            description: 'Sign in',
            action: 'Sign In → Enter email → Enter password',
            credentials: ['email', 'password'],
            tips: ['Verify credentials']
          },
          {
            stepNumber: 3,
            title: 'Change Account Password',
            description: 'Set new password',
            action: 'Profile icon → Account → Look for "Password" or "Security" → Change password → Enter current password → Set new temporary password',
            credentials: ['password'],
            tips: ['Create strong temporary password', 'Share securely with executor']
          },
          {
            stepNumber: 4,
            title: 'Update Subscription Details',
            description: 'Manage subscription for executor',
            action: 'In Account → Subscription section → Update payment method if needed → Can update billing email',
            credentials: null,
            tips: ['Keep subscription active', 'Update payment if expiring', 'Can share executor email']
          },
          {
            stepNumber: 5,
            title: 'Document Account Information',
            description: 'Record all details',
            action: 'Screenshot: Email address, Phone number, Subscription type, Payment method (last 4 digits), Billing date, Profiles created',
            credentials: null,
            tips: ['Note subscription tier', 'List all profiles', 'Document viewing preferences']
          }
        ]
      }
    }
  }
};

// Helper function to get workflow
function getWorkflow(platformName, actionType = null) {
  const workflow = WORKFLOWS[platformName];
  if (!workflow) return null;
  
  if (actionType && workflow.actions[actionType]) {
    return {
      appName: workflow.appName,
      icon: workflow.icon,
      category: workflow.category,
      color: workflow.color,
      steps: workflow.actions[actionType].steps,
      title: workflow.actions[actionType].title
    };
  }
  
  return workflow;
}

// Get available actions for a platform
function getAvailableActions(platformName) {
  const workflow = WORKFLOWS[platformName];
  return workflow ? Object.keys(workflow.actions) : [];
}

// Get all platforms
function getAvailablePlatforms() {
  return Object.keys(WORKFLOWS);
}
