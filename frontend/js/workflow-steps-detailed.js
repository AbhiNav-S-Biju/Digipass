/**
 * DIGIPASS Detailed Workflow Steps - Action-Specific Versions
 * Comprehensive instructions for Delete, Pass, and Last Message operations
 * Perfect for creating screenshot guides
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
        title: 'Delete Instagram Account Permanently',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Instagram Website',
            description: 'Access Instagram through web browser (not mobile app)',
            action: 'Open your web browser (Chrome, Firefox, Safari, Edge) → Type "instagram.com" in address bar → Press Enter',
            credentials: null,
            tips: [
              'Use desktop/web browser - Instagram app does not have delete option',
              'Make sure you see the Instagram logo and blue color scheme',
              'Check the URL shows "instagram.com" with padlock icon (HTTPS)',
              'Clear browser cookies first for security'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Instagram Account',
            description: 'Enter your account credentials',
            action: 'Click "Log In" button → Enter username or email address → Press Tab/Click password field → Enter password → Click "Log in" button',
            credentials: ['username/email', 'password'],
            tips: [
              'Use the exact username or email registered to the account',
              'Password is case-sensitive',
              'If two-factor authentication is enabled, approve the login on your phone when prompted',
              'Do NOT check "Save your login info" checkbox',
              'Wait for page to fully load after login'
            ]
          },
          {
            stepNumber: 3,
            title: 'Navigate to Account Settings',
            description: 'Access the settings menu',
            action: 'Click "More" in the bottom-left sidebar → Click "Settings" → In the left sidebar, click "Accounts Center"',
            credentials: null,
            tips: [
              'On web, "More" is in the bottom-left navigation sidebar (not top right)',
              '"Accounts Center" manages settings across all Meta apps',
              'If you do not see Accounts Center, scroll down in Settings'
            ]
          },
          {
            stepNumber: 4,
            title: 'Access Account Deletion Page',
            description: 'Find the permanent delete option',
            action: 'In Accounts Center → Click "Personal details" → Click "Account ownership and control" → Click "Deactivation or deletion" → Select your Instagram account → Select "Delete account" → Click "Continue"',
            credentials: null,
            tips: [
              'The old instagram.com/accounts/remove URL no longer works — it redirects to Accounts Center',
              'If you have multiple Instagram accounts, select the correct one',
              'Do NOT choose "Deactivate account" — that is only temporary',
              'You can download your data from Accounts Center before proceeding'
            ]
          },
          {
            stepNumber: 5,
            title: 'Confirm Permanent Deletion',
            description: 'Complete the account deletion process',
            action: 'Select a reason for deletion (select "Privacy concerns" or similar to avoid being shown alternatives) → Click "Continue" → Re-enter your password → Click "Delete account" → Confirm on the final screen',
            credentials: ['password'],
            tips: [
              'Selecting "Privacy concerns" as reason helps move the flow forward without showing retention offers',
              'You MUST re-enter your password to confirm',
              'Your account is hidden immediately but fully deleted after 30 days',
              'If you log back in within 30 days, deletion is automatically cancelled',
              'Full deletion takes up to 90 days to clear from servers and backups',
              'Linked Facebook or Threads accounts are NOT deleted — handle those separately'
            ]
          }
        ]
      },
      'pass': {
        title: 'Pass Instagram Account to Executor',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Instagram Website',
            description: 'Access Instagram in web browser',
            action: 'Open web browser → Go to instagram.com → Verify page loads with Instagram logo',
            credentials: null,
            tips: [
              'Use desktop/web version for better control',
              'Ensure you have a stable internet connection',
              'Use a private/incognito window for security'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Instagram Account',
            description: 'Sign in with account credentials',
            action: 'Click "Log In" → Enter username/email → Enter password → Click "Log in"',
            credentials: ['username/email', 'password'],
            tips: [
              'Verify credentials are correct before proceeding',
              'If 2FA is enabled, complete the verification',
              'Wait for page to fully load'
            ]
          },
          {
            stepNumber: 3,
            title: 'Change Account Password',
            description: 'Update password for executor access',
            action: 'Click profile picture (top right) → Click menu icon → Click "Settings" → Look for "Login" or "Security" section → Click "Password" → Enter your current password → Enter new temporary password (strong) → Confirm new password → Click "Change password"',
            credentials: ['current password'],
            tips: [
              'New password must be different from old password',
              'Use a strong password (mix of letters, numbers, symbols)',
              'Write down the temporary password securely',
              'Share this password with executor through secure method (not email/text)',
              'Example strong password: Insta@Pass2024!Exec'
            ]
          },
          {
            stepNumber: 4,
            title: 'Setup Trusted Contacts (Optional)',
            description: 'Allow executor to help manage account',
            action: 'In Settings → Click "Help" → Click "Trusted Contacts" (if available) → Add executor\'s contact information',
            credentials: null,
            tips: [
              'Not all accounts have this feature',
              'Trusted contacts can help recover account if locked out',
              'Add executor email and phone number',
              'They will receive notification that they\'re a trusted contact'
            ]
          },
          {
            stepNumber: 5,
            title: 'Document Account Information',
            description: 'Prepare handoff documentation',
            action: 'Take screenshots of: 1) Account settings page 2) Email address connected 3) Phone number 4) Recovery options 5) Linked accounts (Facebook, etc.) 6) Save this info in a secure document for executor',
            credentials: null,
            tips: [
              'Write down the email address used for account recovery',
              'Note any phone number associated with account',
              'List all two-factor authentication methods',
              'Document any linked social accounts',
              'Note any business accounts or collaborators'
            ]
          }
        ]
      },
      'last_message': {
        title: 'Send Last Message on Instagram',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Instagram',
            description: 'Access Instagram website',
            action: 'Open web browser → Go to instagram.com',
            credentials: null,
            tips: [
              'Direct messages work best on web/app',
              'Mobile browser version also works'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Account',
            description: 'Sign in with credentials',
            action: 'Click "Log In" → Enter username/email → Enter password → Click "Log in"',
            credentials: ['username/email', 'password'],
            tips: [
              'Complete 2FA if enabled',
              'Wait for full page load'
            ]
          },
          {
            stepNumber: 3,
            title: 'Open Direct Messages',
            description: 'Access your message inbox',
            action: 'In top right corner, click the messenger icon (looks like a paper plane ✈️ or chat bubble) → Your inbox will open showing all conversations',
            credentials: null,
            tips: [
              'Icon is in the top navigation bar on the right side',
              'Shows all active conversations sorted by most recent',
              'You can search for specific people using the search box',
              'If no conversations exist, click the new message button'
            ]
          },
          {
            stepNumber: 4,
            title: 'Select Recipient for Final Message',
            description: 'Choose who will receive your last message',
            action: 'In the message list, click on the person/group you want to message → If new recipient: Click "Send Message" icon, search their name, click on them',
            credentials: null,
            tips: [
              'Choose people important to you (close family, best friends)',
              'You can send messages to multiple people',
              'Consider messaging each person individually for a personal touch',
              'Group messages also work if you prefer'
            ]
          },
          {
            stepNumber: 5,
            title: 'Type and Send Final Message',
            description: 'Compose and send your last message',
            action: 'Click in the message text field → Type your farewell message (example: "I wanted to let you know how much you mean to me...") → Click the send button (arrow icon on right) → Message is sent immediately',
            credentials: null,
            tips: [
              'Keep message thoughtful but not too long',
              'Explain that you\'re preparing your digital estate',
              'You can include executor contact info if appropriate',
              'Message will appear immediately in their inbox',
              'They will see you sent it',
              'Consider messaging your closest people first'
            ]
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
        title: 'Delete Facebook Account Permanently',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Facebook Website',
            description: 'Navigate to Facebook in your web browser',
            action: 'Open web browser → Type "facebook.com" in address bar → Press Enter → Verify page loads with Facebook logo',
            credentials: null,
            tips: [
              'Use desktop/web browser for best results',
              'Check URL shows "facebook.com" with HTTPS padlock',
              'Look for the blue Facebook logo',
              'Avoid clicking any ads on the page'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Facebook Account',
            description: 'Enter your account credentials',
            action: 'Click "Log In" (top right) → Enter your email/phone number in first field → Click password field → Enter your password → Click "Log In" button',
            credentials: ['email/phone', 'password'],
            tips: [
              'Use the exact email or phone number registered to account',
              'Password is case-sensitive',
              'If you see "Unrecognized browser" or 2FA prompt, approve from your phone',
              'Do not save password',
              'Wait for page to fully load after login'
            ]
          },
          {
            stepNumber: 3,
            title: 'Access Settings & Privacy',
            description: 'Open account settings',
            action: 'In top right corner, click your profile picture → Click "Settings & Privacy" from the dropdown → Click "Settings" → In the left sidebar, click "Accounts Center"',
            credentials: null,
            tips: [
              'Facebook moved all account ownership controls into Accounts Center in 2023',
              'Do not click "Help & Support" — go to Accounts Center instead',
              'Accounts Center manages your Facebook, Instagram, and Messenger settings together'
            ]
          },
          {
            stepNumber: 4,
            title: 'Find Account Deactivation & Deletion',
            description: 'Locate the deletion option',
            action: 'In Accounts Center → Click "Personal details" → Click "Account ownership and control" → Click "Deactivation or deletion" → Select your Facebook account',
            credentials: null,
            tips: [
              'This path is inside Accounts Center, not the old Settings sidebar',
              'Select the specific Facebook account if you have multiple Meta accounts linked',
              'Next screen will let you choose between Deactivate and Delete'
            ]
          },
          {
            stepNumber: 5,
            title: 'Confirm Permanent Deletion',
            description: 'Complete the deletion process',
            action: 'Select "Delete account" → Click "Continue" → Optionally select a reason → Review alternatives shown (download data, archive posts) → Click "Continue" → Re-enter your password → Click "Delete account" → Confirm on final screen',
            credentials: ['password'],
            tips: [
              'Must re-enter password for security',
              'Deletion is permanent after 30 days — you can cancel by logging in within that window',
              'Full data purge takes up to 90 days from servers and backups',
              'Deleting Facebook also deletes your Messenger account and messages',
              'Any third-party apps using Facebook Login will lose access',
              'If you are the admin of Facebook Pages or Groups, transfer ownership first'
            ]
          }
        ]
      },
      'pass': {
        title: 'Pass Facebook Account to Executor',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Facebook',
            description: 'Access Facebook website',
            action: 'Open browser → Go to facebook.com',
            credentials: null,
            tips: [
              'Use web version for full control'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Account',
            description: 'Sign in',
            action: 'Click "Log In" → Enter email/phone → Enter password → Click "Log In"',
            credentials: ['email/phone', 'password'],
            tips: [
              'Verify credentials work correctly'
            ]
          },
          {
            stepNumber: 3,
            title: 'Change Password',
            description: 'Set new temporary password for executor',
            action: 'Click down arrow (top right) → Click "Settings & privacy" → Click "Settings" → In left menu, click "Password" (under "Login") → Enter your current password → Enter new temporary password → Confirm new password → Click "Change Password"',
            credentials: ['current password'],
            tips: [
              'Create a strong temporary password',
              'Example: FB@Pass2024!Exec',
              'Share password with executor securely',
              'Use password manager or encrypted message',
              'Not email or text message'
            ]
          },
          {
            stepNumber: 4,
            title: 'Add Recovery Contact',
            description: 'Set up account recovery options',
            action: 'In Settings → Click "Personal information" → Look for "Email addresses" or "Phone numbers" → Add executor\'s contact information (email/phone) → Click "Add" and confirm',
            credentials: null,
            tips: [
              'This allows executor to recover account if needed',
              'Add executor email and/or phone number',
              'They will receive notification'
            ]
          },
          {
            stepNumber: 5,
            title: 'Document Account Details',
            description: 'Prepare comprehensive handoff info',
            action: 'Take screenshots of: 1) Account settings page 2) Email address 3) Phone number 4) Recovery contacts 5) Linked accounts 6) Create a document with all account information',
            credentials: null,
            tips: [
              'List all emails connected to account',
              'Note recovery phone number',
              'Document any business pages managed',
              'List all trusted contacts',
              'Note date account was created'
            ]
          }
        ]
      },
      'last_message': {
        title: 'Send Last Message on Facebook',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Facebook',
            description: 'Go to Facebook website',
            action: 'Open browser → Go to facebook.com',
            credentials: null,
            tips: [
              'Use web browser'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Account',
            description: 'Sign in',
            action: 'Click "Log In" → Enter email/phone → Enter password',
            credentials: ['email/phone', 'password'],
            tips: [
              'Complete 2FA if needed'
            ]
          },
          {
            stepNumber: 3,
            title: 'Open Messenger',
            description: 'Access your messages',
            action: 'In top left, click the Messenger icon (speech bubble icon 💬) → Your inbox opens showing all conversations',
            credentials: null,
            tips: [
              'Icon is in top left navigation',
              'Alternative: Go to messenger.com directly',
              'Shows all conversations sorted by recent',
              'Click "+" or new message icon to start new conversation'
            ]
          },
          {
            stepNumber: 4,
            title: 'Select Recipient',
            description: 'Choose who to message',
            action: 'Click on a conversation from the list, OR click new message icon → Search for person\'s name → Click to open conversation',
            credentials: null,
            tips: [
              'Message close family members and friends',
              'Can send to multiple people',
              'Personal 1-on-1 messages are more meaningful'
            ]
          },
          {
            stepNumber: 5,
            title: 'Compose and Send Final Message',
            description: 'Write and send your last message',
            action: 'Click message input field at bottom → Type your farewell message (e.g., "I wanted you to know how important you are to me...") → Click send button (airplane icon ✈️) → Message is sent',
            credentials: null,
            tips: [
              'Keep message heartfelt but appropriate',
              'Can include executor contact info if desired',
              'Message arrives immediately',
              'Person will see it in their inbox',
              'Consider adding them to your story with farewell message'
            ]
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
        title: 'Delete Twitter (X) Account Permanently',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Twitter/X Website',
            description: 'Navigate to Twitter in web browser',
            action: 'Open browser → Type "twitter.com" or "x.com" in address bar → Press Enter',
            credentials: null,
            tips: [
              'Twitter has rebranded to X but twitter.com still works',
              'Use desktop web browser for full access',
              'Make sure URL shows HTTPS padlock'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Twitter Account',
            description: 'Sign in with your credentials',
            action: 'On login page → Enter your phone/email/username → Click "Next" → Enter your password → Click "Log in"',
            credentials: ['email/phone/username', 'password'],
            tips: [
              'Use registered email, phone, or username',
              'Password is case-sensitive',
              'If 2FA enabled, enter verification code from app',
              'Do not save password'
            ]
          },
          {
            stepNumber: 3,
            title: 'Open Settings & Privacy',
            description: 'Access account settings',
            action: 'Click "More" (three-dot icon in a circle) in the left sidebar → Click "Settings and Support" from the dropdown → Click "Settings and privacy"',
            credentials: null,
            tips: [
              '"More" icon is in the left navigation sidebar on the web version',
              'On mobile: tap your profile photo → tap "Settings and Support" → tap "Settings and privacy"',
              'The icon may appear as three dots in a circle'
            ]
          },
          {
            stepNumber: 4,
            title: 'Navigate to Account Deactivation',
            description: 'Find deletion option',
            action: 'Click "Your account" at the top of the Settings menu → Click "Deactivate your account" → Read the deactivation details carefully',
            credentials: null,
            tips: [
              'The option is called "Deactivate your account" — X uses deactivation as the first step to permanent deletion',
              'Do NOT log back in within 30 days or deletion will be cancelled automatically',
              'Before deactivating, revoke any third-party app access — these apps can auto-login and accidentally reactivate your account',
              'If you have an active X Premium subscription, cancel it separately first'
            ]
          },
          {
            stepNumber: 5,
            title: 'Confirm Account Deletion',
            description: 'Complete the deletion',
            action: 'Click "Deactivate" → Read the warning → Enter your password → Click "Deactivate" again to confirm → Account is immediately deactivated. Do NOT log in again for 30 days — after 30 days of inactivity, the account is permanently deleted',
            credentials: ['password'],
            tips: [
              'Deactivation is immediate — your profile disappears from public view right away',
              'Permanent deletion happens automatically after 30 days of NOT logging in',
              'Even opening the app and viewing your timeline can trigger accidental reactivation',
              'Download your data archive BEFORE deactivating: Settings → Your account → Download an archive of your data',
              'X sends a confirmation of deactivation but NOT a separate confirmation of permanent deletion'
            ]
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
            action: 'Open browser → Go to twitter.com',
            credentials: null,
            tips: [
              'Use web version'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Account',
            description: 'Sign in',
            action: 'Click "Log in" → Enter email/username → Click "Next" → Enter password',
            credentials: ['email/username', 'password'],
            tips: [
              'Verify credentials'
            ]
          },
          {
            stepNumber: 3,
            title: 'Change Password',
            description: 'Update password for executor',
            action: 'Click profile icon → Click "More" → Click "Settings and Privacy" → Click "Account" → Click "Change your password" → Enter current password → Enter new temporary password → Confirm new password → Click "Save"',
            credentials: ['current password'],
            tips: [
              'Create strong temporary password',
              'Share securely with executor',
              'Use 16+ characters if possible'
            ]
          },
          {
            stepNumber: 4,
            title: 'Enable Account Recovery Options',
            description: 'Set up recovery contacts',
            action: 'In Account settings → Click "Email and phone" → Verify email is correct → Add backup phone number (if desired) → Save changes',
            credentials: null,
            tips: [
              'Ensure recovery email is valid',
              'Phone number helps with account recovery',
              'Executor can use these if needed'
            ]
          },
          {
            stepNumber: 5,
            title: 'Document Account Information',
            description: 'Create handoff documentation',
            action: 'Take screenshots of: 1) Profile page 2) Email address 3) Phone number 4) Followers count 5) Saved tweets/lists 6) Create summary document',
            credentials: null,
            tips: [
              'Document verified badge status (if any)',
              'Note any business partnerships',
              'List important followers (collaborators, friends)',
              'Note any API keys or integrations'
            ]
          }
        ]
      },
      'last_message': {
        title: 'Send Last Message on Twitter',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Twitter',
            description: 'Go to Twitter/X',
            action: 'Open browser → Go to twitter.com',
            credentials: null,
            tips: [
              'Use web or app'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Account',
            description: 'Sign in',
            action: 'Click "Log in" → Enter email/username → Click "Next" → Enter password',
            credentials: ['email/username', 'password'],
            tips: [
              'Complete 2FA if enabled'
            ]
          },
          {
            stepNumber: 3,
            title: 'Open Direct Messages',
            description: 'Access your DM inbox',
            action: 'In left sidebar, click "Messages" icon (looks like envelope ✉️) → Your DM inbox opens',
            credentials: null,
            tips: [
              'Messages icon in left navigation',
              'Shows all conversations',
              'Can click "+" to start new message'
            ]
          },
          {
            stepNumber: 4,
            title: 'Select Recipient',
            description: 'Choose who to message',
            action: 'Click existing conversation, OR click "+" → Search for person → Click their name',
            credentials: null,
            tips: [
              'Choose people important to you',
              'Can message multiple people separately',
              'Personal messages are most meaningful'
            ]
          },
          {
            stepNumber: 5,
            title: 'Type and Send Final Message',
            description: 'Compose and send last message',
            action: 'Click message field → Type your farewell (e.g., "I wanted to reach out and let you know...") → Click send button → Message is delivered',
            credentials: null,
            tips: [
              'Keep message sincere',
              'Can include executor contact if helpful',
              'Message arrives instantly',
              'Recipient will see notification',
              'Consider pinning a final tweet to profile'
            ]
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
    color: '#0077B5',
    actions: {
      'delete': {
        title: 'Delete LinkedIn Account Permanently',
        steps: [
          {
            stepNumber: 1,
            title: 'Open LinkedIn',
            description: 'Navigate to LinkedIn website',
            action: 'Open browser → Go to linkedin.com → Verify LinkedIn logo and blue color',
            credentials: null,
            tips: [
              'Use desktop web browser',
              'Check HTTPS padlock in URL bar',
              'Look for LinkedIn logo'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to LinkedIn',
            description: 'Sign in with your credentials',
            action: 'Click "Sign in" → Enter email address → Press Tab → Enter password → Click "Sign in" button',
            credentials: ['email', 'password'],
            tips: [
              'Use registered email address',
              'Password is case-sensitive',
              'If 2FA enabled, approve login code',
              'Wait for profile page to load'
            ]
          },
          {
            stepNumber: 3,
            title: 'Access Account Settings',
            description: 'Open settings menu',
            action: 'Click your profile photo ("Me" icon) in the top right → Click "Settings & Privacy" from the dropdown → In the left sidebar, click "Account preferences"',
            credentials: null,
            tips: [
              'Profile photo / Me icon is in the top right navigation bar',
              'Settings & Privacy opens into the Account preferences section by default',
              'On mobile: tap your profile picture → tap Settings (bottom-left on iOS, gear icon on Android)'
            ]
          },
          {
            stepNumber: 4,
            title: 'Find Account Closure Option',
            description: 'Locate deletion section',
            action: 'In Account preferences → Scroll down to the "Account management" section → Click "Close account"',
            credentials: null,
            tips: [
              'The option is called "Close account", not "Delete account"',
              'If you have a Premium subscription, cancel it separately first — deleting your account does not automatically cancel Premium billing',
              'If you are the sole admin of a Company Page, assign a new admin or close the page first',
              'You can download your data first: Settings & Privacy → Data privacy → Get a copy of your data'
            ]
          },
          {
            stepNumber: 5,
            title: 'Confirm Account Closure',
            description: 'Complete deletion',
            action: 'Click "Continue" on the warning screen → Select a reason for leaving from the list → Click "Next" → Enter your account password → Click "Done" → Account is immediately deactivated',
            credentials: ['password'],
            tips: [
              'Must enter password for verification',
              'Account is deactivated immediately and permanently deleted after a 14-day grace period (shorter than most platforms)',
              'You can reactivate within 14 days by logging back in',
              'After 14 days, restoration is NOT possible',
              'Recommendations, endorsements, connections, and messages are all permanently removed',
              'Your profile may still appear in search engine caches for a short period after deletion'
            ]
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
            action: 'Open browser → Go to linkedin.com',
            credentials: null,
            tips: [
              'Use web version'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to LinkedIn',
            description: 'Sign in',
            action: 'Click "Sign in" → Enter email → Enter password',
            credentials: ['email', 'password'],
            tips: [
              'Verify credentials'
            ]
          },
          {
            stepNumber: 3,
            title: 'Change Password',
            description: 'Set new password for executor',
            action: 'Click profile photo → "Settings & privacy" → "Settings" → In left menu, look for "Sign in & security" → Click "Password" → Enter current password → Enter new temporary password → Confirm → Click "Update"',
            credentials: ['current password'],
            tips: [
              'Create strong password',
              'Share securely with executor',
              'Example: LinkedIn@2024!Exec'
            ]
          },
          {
            stepNumber: 4,
            title: 'Add Email Recovery Option',
            description: 'Set up account recovery',
            action: 'In Settings → Click "Email addresses" → Verify primary email → Add secondary email (executor email) → Click "Add email"',
            credentials: null,
            tips: [
              'Secondary email helps account recovery',
              'Executor can use to recover if needed',
              'Send them confirmation code'
            ]
          },
          {
            stepNumber: 5,
            title: 'Document Profile Information',
            description: 'Create handoff documentation',
            action: 'Take screenshots of: 1) Profile page 2) Work experience 3) Education 4) Connections (total number) 5) Premium status (if any) 6) Create summary',
            credentials: null,
            tips: [
              'Document connections count',
              'Note any endorsements',
              'List important professional relationships',
              'Screenshot LinkedIn URL for profile',
              'Note any group memberships'
            ]
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
            action: 'Open browser → Go to linkedin.com',
            credentials: null,
            tips: [
              'Use web or app'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Account',
            description: 'Sign in',
            action: 'Click "Sign in" → Enter email → Enter password',
            credentials: ['email', 'password'],
            tips: [
              'Complete 2FA if needed'
            ]
          },
          {
            stepNumber: 3,
            title: 'Open Messaging',
            description: 'Access your messages',
            action: 'In top left, click "Messaging" icon (looks like chat bubble 💬) → Your inbox shows all conversations',
            credentials: null,
            tips: [
              'Icon in top navigation',
              'Shows conversation list',
              'Can click "+" to start new message'
            ]
          },
          {
            stepNumber: 4,
            title: 'Select Connection to Message',
            description: 'Choose recipient',
            action: 'Click on existing conversation, OR click "+" → Search for connection name → Click their name',
            credentials: null,
            tips: [
              'Choose professional contacts important to you',
              'Can message multiple people',
              'Messages are professional in tone'
            ]
          },
          {
            stepNumber: 5,
            title: 'Compose and Send Final Message',
            description: 'Write and send last message',
            action: 'Click message field → Type your message (e.g., "I wanted to connect one more time...") → Click send button → Message delivered',
            credentials: null,
            tips: [
              'Keep message professional',
              'Can be heartfelt but appropriate for workplace',
              'Message arrives immediately',
              'Recipient gets notification',
              'Consider writing a profile recommendation for key people'
            ]
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
        title: 'Delete Gmail Account Permanently',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Google Account Page',
            description: 'Go to Google Account settings',
            action: 'Open browser → Go to myaccount.google.com → Or: Go to gmail.com, click profile icon, click "Manage your Google Account"',
            credentials: null,
            tips: [
              'myaccount.google.com is the direct link',
              'Must be logged into Google account first',
              'Check HTTPS padlock'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Google Account',
            description: 'Sign in if not already signed in',
            action: 'If not logged in: Click "Sign in" → Enter email address → Click "Next" → Enter password → Click "Next"',
            credentials: ['email', 'password'],
            tips: [
              'Use Gmail email address',
              'Complete 2FA if enabled',
              'May ask for phone verification'
            ]
          },
          {
            stepNumber: 3,
            title: 'Navigate to Data & Privacy',
            description: 'Access data deletion options',
            action: 'In the left sidebar on myaccount.google.com, click "Data & privacy" → Scroll down to the "Download or delete your data" section',
            credentials: null,
            tips: [
              'Click "Data & privacy" NOT "Security" — these are separate tabs',
              'Before deleting, use Google Takeout (takeout.google.com) to download all your data including emails, Drive files, and Photos',
              'Deleting Gmail only removes the Gmail service — you can keep your Google Account active for YouTube, Drive, etc. if you prefer'
            ]
          },
          {
            stepNumber: 4,
            title: 'Choose Delete Google Account',
            description: 'Select account deletion option',
            action: 'To delete only Gmail: Click "Delete a Google service" → Enter your password → Click the trash icon next to Gmail → Provide an alternate email address (non-Gmail) for your remaining Google Account → Click "Send verification email" → Verify the alternate email to confirm. To delete entire Google Account: Scroll down and click "Delete your Google Account" → Read all warnings → Click "Continue"',
            credentials: null,
            tips: [
              'Deleting Gmail does NOT delete your entire Google Account — they are separate options',
              'Deleting your entire Google Account removes: Gmail, Drive, Photos, YouTube, Calendar, Play purchases, and all other Google services',
              'You MUST provide an alternate non-Gmail email if deleting only Gmail but keeping your Google Account',
              'Cannot restore after the 20-30 day recovery window expires'
            ]
          },
          {
            stepNumber: 5,
            title: 'Confirm Account Deletion',
            description: 'Complete the deletion',
            action: 'Verify your identity → Enter your password → Check the "I want to permanently delete my account" checkbox → Click "Delete account" → Check your alternate email for a verification link if deleting Gmail only',
            credentials: ['password'],
            tips: [
              'Must verify with password',
              'Google retains data for approximately 30 days — there is a recovery window if you change your mind',
              'Full deletion from all Google servers and backups may take additional weeks',
              'Your Gmail address becomes permanently unavailable — no one else can ever claim it',
              'Deleting the full Google Account also cancels all Google Play and YouTube purchases'
            ]
          }
        ]
      },
      'pass': {
        title: 'Pass Gmail Account to Executor',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Gmail',
            description: 'Access Gmail',
            action: 'Open browser → Go to gmail.com or mail.google.com',
            credentials: null,
            tips: [
              'Make sure you\'re signed in'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Gmail',
            description: 'Sign in',
            action: 'If not signed in: Click "Sign in" → Enter email → Click "Next" → Enter password',
            credentials: ['email', 'password'],
            tips: [
              'Use Gmail address',
              'Complete 2FA if needed'
            ]
          },
          {
            stepNumber: 3,
            title: 'Change Gmail Password',
            description: 'Update password for executor access',
            action: 'Go to myaccount.google.com → Click "Security" tab → In left menu, find "Password" → Click "Password" → Enter current password → Enter new temporary password → Click "Change password"',
            credentials: ['current password'],
            tips: [
              'Create strong temporary password',
              'Share securely with executor',
              'Example: Gmail@Exec2024!'
            ]
          },
          {
            stepNumber: 4,
            title: 'Add Recovery Contact',
            description: 'Set up account recovery',
            action: 'In Security tab → Click "Recovery email" or "Recovery phone" → Add executor email address or phone → Click "Add" and verify',
            credentials: null,
            tips: [
              'Recovery email helps executor recover account',
              'They will receive verification code',
              'Executor should confirm recovery email'
            ]
          },
          {
            stepNumber: 5,
            title: 'Document Email Information',
            description: 'Create handoff documentation',
            action: 'Take screenshots of: 1) Gmail inbox 2) Storage usage 3) Recovery contacts 4) Forwarding address (if any) 5) Create detailed summary',
            credentials: null,
            tips: [
              'Document important email folders',
              'Note any email forwarding rules',
              'Screenshot total storage capacity',
              'List important contacts/subscriptions',
              'Note any filters or labels created'
            ]
          }
        ]
      },
      'last_message': {
        title: 'Send Last Email on Gmail',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Gmail',
            description: 'Go to Gmail',
            action: 'Open browser → Go to gmail.com',
            credentials: null,
            tips: [
              'Make sure logged in'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Gmail',
            description: 'Sign in',
            action: 'Click "Sign in" → Enter email → Click "Next" → Enter password',
            credentials: ['email', 'password'],
            tips: [
              'Complete 2FA if enabled'
            ]
          },
          {
            stepNumber: 3,
            title: 'Compose New Email',
            description: 'Start writing new email',
            action: 'Click "Compose" button (top left, usually red) → New email window opens',
            credentials: null,
            tips: [
              'Compose button in top left',
              'Opens new email form'
            ]
          },
          {
            stepNumber: 4,
            title: 'Add Recipient and Subject',
            description: 'Enter who to email',
            action: 'Click "To" field → Type recipient email address → Click their name from suggestions → Click "Subject" field → Type subject line (e.g., "A Message from Me")',
            credentials: null,
            tips: [
              'Can send to multiple recipients',
              'Use meaningful subject',
              'Use email addresses of close family/friends',
              'Can also add CC or BCC'
            ]
          },
          {
            stepNumber: 5,
            title: 'Type and Send Final Email',
            description: 'Write and send farewell email',
            action: 'Click in email body → Type your message (e.g., "Dear [Name], I wanted to reach out...") → Click "Send" button → Email is sent immediately',
            credentials: null,
            tips: [
              'Keep message heartfelt',
              'Can be as long as needed',
              'Include executor contact info',
              'Consider sending to multiple people',
              'Check "Undo Send" if Gmail shows it (quick regret option)'
            ]
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
        title: 'Delete Outlook Account Permanently',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Microsoft Account Page',
            description: 'Access your Microsoft Account',
            action: 'Open browser → Go to account.microsoft.com → Click "Sign in" if not logged in',
            credentials: null,
            tips: [
              'Direct link: account.microsoft.com',
              'Check HTTPS padlock',
              'Verify Microsoft logo'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Microsoft Account',
            description: 'Sign in with your credentials',
            action: 'Enter your email address → Click "Next" → Enter password → Click "Sign in"',
            credentials: ['email', 'password'],
            tips: [
              'Use email associated with Outlook',
              'Complete any 2FA/security verification',
              'May ask for phone verification code'
            ]
          },
          {
            stepNumber: 3,
            title: 'Access Privacy & Data',
            description: 'Go to privacy settings',
            action: 'Go to account.microsoft.com → In the left menu, look for "Privacy" or navigate directly to the account closure page at: account.live.com/closeaccount.aspx',
            credentials: null,
            tips: [
              'The direct closure URL is account.live.com/closeaccount.aspx',
              'Before closing: cancel any Microsoft 365/Xbox/OneDrive subscriptions, download OneDrive files, and save important emails',
              'If you use this Microsoft account to sign in to Windows, switch your Windows sign-in to a local account first'
            ]
          },
          {
            stepNumber: 4,
            title: 'Choose Delete Account Option',
            description: 'Select account deletion option',
            action: 'On the Close Account page → Verify all pre-closure checklist items → Click "Next" → Review the list of services that will be closed (Outlook, OneDrive, Xbox, Skype, Microsoft 365, etc.) → Check each acknowledgement checkbox → Click "Mark account for closure"',
            credentials: null,
            tips: [
              'Microsoft shows a checklist of things to do before closing — review each item',
              'Closing the Microsoft account closes Outlook.com, OneDrive, Xbox, Skype, and all linked Microsoft services',
              'The Outlook.com email address is permanently deleted and cannot be reused or reclaimed by anyone',
              'After marking for closure, there is a reopen window (typically 30-60 days) before permanent deletion'
            ]
          },
          {
            stepNumber: 5,
            title: 'Confirm Account Deletion',
            description: 'Complete the deletion',
            action: 'Check all required acknowledgement boxes → Click "Mark account for closure" → Microsoft sends a confirmation email → Account enters a closure period before permanent deletion',
            credentials: null,
            tips: [
              'All checkboxes must be checked to proceed',
              'Microsoft confirms closure via email',
              'There is a reopen window — log in during this period to cancel closure if you change your mind',
              'After the window closes, all data is permanently deleted per Microsoft Services Agreement',
              'Your Outlook/Hotmail/Live email address can never be used again by anyone'
            ]
          }
        ]
      },
      'pass': {
        title: 'Pass Outlook Account to Executor',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Outlook',
            description: 'Access Outlook',
            action: 'Open browser → Go to outlook.com or outlook.office.com',
            credentials: null,
            tips: [
              'Web version of Outlook'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Outlook',
            description: 'Sign in',
            action: 'Click "Sign in" → Enter email → Click "Next" → Enter password → Click "Sign in"',
            credentials: ['email', 'password'],
            tips: [
              'Complete 2FA if enabled'
            ]
          },
          {
            stepNumber: 3,
            title: 'Change Account Password',
            description: 'Set new password for executor',
            action: 'Go to account.microsoft.com → In left menu, click "Security" → Click "Password" → Enter current password → Enter new temporary password → Click "Next" → Click "Finish"',
            credentials: ['current password'],
            tips: [
              'Create strong temporary password',
              'Share securely with executor',
              'Use 12+ characters'
            ]
          },
          {
            stepNumber: 4,
            title: 'Add Recovery Contact',
            description: 'Set up account recovery',
            action: 'In Security section → Click "Recovery options" → Click "Add recovery email" → Enter executor email address → Click "Save"',
            credentials: null,
            tips: [
              'Executor email helps account recovery',
              'They will need to verify',
              'Provides backup access method'
            ]
          },
          {
            stepNumber: 5,
            title: 'Document Account Details',
            description: 'Create handoff documentation',
            action: 'Take screenshots of: 1) Inbox 2) Folders 3) Storage info 4) Recovery options 5) OneDrive integration 6) Create summary document',
            credentials: null,
            tips: [
              'Document important email folders',
              'Note OneDrive storage',
              'List any email rules or filters',
              'Screenshot total emails (if possible)',
              'Note any shared mailboxes'
            ]
          }
        ]
      },
      'last_message': {
        title: 'Send Last Email via Outlook',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Outlook',
            description: 'Go to Outlook',
            action: 'Open browser → Go to outlook.com',
            credentials: null,
            tips: [
              'Web version'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Outlook',
            description: 'Sign in',
            action: 'Click "Sign in" → Enter email → Click "Next" → Enter password',
            credentials: ['email', 'password'],
            tips: [
              'Complete 2FA if needed'
            ]
          },
          {
            stepNumber: 3,
            title: 'Compose New Email',
            description: 'Start new email',
            action: 'Click "New message" button (top left) → New email window opens',
            credentials: null,
            tips: [
              'Usually blue button'
            ]
          },
          {
            stepNumber: 4,
            title: 'Add Recipients and Subject',
            description: 'Enter recipients',
            action: 'Click "To" field → Type recipient email → Select from suggestions → Click "Subject" → Type subject line',
            credentials: null,
            tips: [
              'Can add multiple recipients',
              'Use CC for others',
              'Use BCC for private recipients'
            ]
          },
          {
            stepNumber: 5,
            title: 'Compose and Send Final Email',
            description: 'Write and send farewell email',
            action: 'Click message body → Type your farewell message → Click "Send" button → Email is sent',
            credentials: null,
            tips: [
              'Keep message meaningful',
              'Can include executor contact info',
              'Email arrives immediately',
              'Recipients see immediately',
              'Consider saving draft for review first'
            ]
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
        title: 'Delete PayPal Account Permanently',
        steps: [
          {
            stepNumber: 1,
            title: 'Open PayPal Website',
            description: 'Navigate to PayPal',
            action: 'Open browser → Go to paypal.com → Look for "Log In" button',
            credentials: null,
            tips: [
              'Use web browser',
              'Check for PayPal logo and blue color',
              'Verify HTTPS padlock'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to PayPal Account',
            description: 'Sign in with your credentials',
            action: 'Click "Log In" → Enter your email → Click "Next" → Enter password → Click "Log In" → Complete 2FA if prompted',
            credentials: ['email', 'password'],
            tips: [
              'Use registered email address',
              'Password is case-sensitive',
              'Complete security verification if needed',
              'May need to verify from phone'
            ]
          },
          {
            stepNumber: 3,
            title: 'Access Account Settings',
            description: 'Open settings menu',
            action: 'Click the gear icon (Settings) in the top right corner of the screen',
            credentials: null,
            tips: [
              'Settings icon looks like a gear/cog in the top navigation bar',
              'Before proceeding: withdraw all remaining balance to your bank — PayPal will not let you close an account with funds remaining',
              'Also resolve any open disputes, pending transactions, or chargebacks before attempting closure'
            ]
          },
          {
            stepNumber: 4,
            title: 'Find Account Closure Option',
            description: 'Locate deletion section',
            action: 'In Settings → Scroll down to the "Account options" section → Click "Close your account"',
            credentials: null,
            tips: [
              'The link is labeled "Close your account" under Account options',
              'If you cannot see the option, ensure your balance is zero and all disputes are resolved',
              'Cancel any active recurring payments or subscriptions linked to your PayPal before closing',
              'Remove linked bank accounts and cards first if desired'
            ]
          },
          {
            stepNumber: 5,
            title: 'Confirm Account Closure',
            description: 'Complete account deletion',
            action: 'Click "Close your account" → Read the warning that closure is permanent and irreversible → PayPal may prompt you to request data deletion at this point → Click "Close Account" to confirm → Receive confirmation email',
            credentials: null,
            tips: [
              'Closure is immediate and permanent — account cannot be reopened',
              'You CAN open a brand new PayPal account with the same email address afterwards, but all history is lost',
              'Export your transaction history before closing: Activity → Download section',
              'PayPal will not let you close if there is any remaining balance, negative balance, or unresolved disputes',
              'Confirmation email is sent to your registered email address'
            ]
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
            action: 'Open browser → Go to paypal.com',
            credentials: null,
            tips: [
              'Use web version'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to PayPal',
            description: 'Sign in',
            action: 'Click "Log In" → Enter email → Click "Next" → Enter password',
            credentials: ['email', 'password'],
            tips: [
              'Complete 2FA if needed'
            ]
          },
          {
            stepNumber: 3,
            title: 'Change Account Password',
            description: 'Update password for executor',
            action: 'Click profile icon → "Settings" → "Security" or "Account security" → Click "Change password" → Enter current password → Enter new temporary password → Click "Save"',
            credentials: ['current password'],
            tips: [
              'Create strong password',
              'Share securely with executor',
              'Example: PayPal@Exec2024!'
            ]
          },
          {
            stepNumber: 4,
            title: 'Add Authorized User or Contact',
            description: 'Set up executor as contact',
            action: 'In Settings → Look for "Manage Authorized Persons" or "Security" → Add executor email address → Send them invitation',
            credentials: null,
            tips: [
              'Executor can access account with new password',
              'Some PayPal accounts allow authorized users',
              'May need to add them as business user'
            ]
          },
          {
            stepNumber: 5,
            title: 'Document Account Information',
            description: 'Create handoff documentation',
            action: 'Take screenshots of: 1) Account balance 2) Payment methods 3) Bank account linked 4) Transaction history 5) Any seller settings 6) Create comprehensive summary',
            credentials: null,
            tips: [
              'Document current balance',
              'List all linked bank accounts',
              'Note any credit cards on file',
              'Screenshot seller limits (if applicable)',
              'Document dispute history'
            ]
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
            title: 'Open Google Account Settings',
            description: 'Go to your Google Account',
            action: 'Open browser → Go to myaccount.google.com → Log in if not already logged in',
            credentials: null,
            tips: [
              'Direct link to Google Account',
              'Must be signed into Google'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Google Account',
            description: 'Sign in',
            action: 'Click "Sign in" → Enter email → Click "Next" → Enter password → Click "Next"',
            credentials: ['email', 'password'],
            tips: [
              'Complete 2FA if needed',
              'Phone verification may be required'
            ]
          },
          {
            stepNumber: 3,
            title: 'Navigate to Data & Privacy',
            description: 'Go to data settings',
            action: 'In left menu, click "Data & privacy" → Scroll down to "Delete your data or account" section',
            credentials: null,
            tips: [
              'Different from Security tab',
              'Look for "Data & privacy" in left menu'
            ]
          },
          {
            stepNumber: 4,
            title: 'Delete Google Account',
            description: 'Start deletion process',
            action: 'In deletion section → Click "Delete your account" → Read all warnings → Click "Continue"',
            credentials: null,
            tips: [
              'Deletion affects ALL Google services',
              'Gmail, Drive, Photos, YouTube, Play Store, etc.',
              'Cannot restore after deletion',
              'All payment methods will be removed from Google Pay'
            ]
          },
          {
            stepNumber: 5,
            title: 'Confirm Account Deletion',
            description: 'Complete the deletion',
            action: 'Verify identity → Enter password → Check acceptance → Click "Delete account"',
            credentials: ['password'],
            tips: [
              'Must verify with password',
              'Google sends confirmation email',
              'All Google Pay data deleted with account',
              'Takes time to fully process',
              'Cannot restore'
            ]
          }
        ]
      },
      'pass': {
        title: 'Pass Google Pay to Executor',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Google Pay',
            description: 'Access Google Pay',
            action: 'Open browser → Go to pay.google.com or open Google Pay app → Log in if needed',
            credentials: null,
            tips: [
              'Web or app version'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Google Account',
            description: 'Sign in',
            action: 'Click "Sign in" → Enter email → Enter password',
            credentials: ['email', 'password'],
            tips: [
              'Complete 2FA if enabled'
            ]
          },
          {
            stepNumber: 3,
            title: 'Change Google Account Password',
            description: 'Update password for executor',
            action: 'Go to myaccount.google.com → Click "Security" tab → Find "Password" → Click "Change password" → Enter current password → Enter new temporary password → Click "Change password"',
            credentials: ['current password'],
            tips: [
              'Create strong password',
              'Share securely with executor',
              'Must be 12+ characters'
            ]
          },
          {
            stepNumber: 4,
            title: 'Add Recovery Contact',
            description: 'Set up account recovery',
            action: 'In Security tab → Click "Recovery options" → Add executor email as recovery contact → Verify email',
            credentials: null,
            tips: [
              'Executor can recover account if needed',
              'Verification email will be sent',
              'Executor must confirm'
            ]
          },
          {
            stepNumber: 5,
            title: 'Document Payment Information',
            description: 'Create handoff documentation',
            action: 'Take screenshots of: 1) Payment methods 2) Cards on file 3) Bank account linked 4) Transaction history 5) Create detailed summary',
            credentials: null,
            tips: [
              'Document all linked cards',
              'Note bank account details',
              'Screenshot recent transactions',
              'List any stored payment methods',
              'Note any security settings (2FA, etc.)'
            ]
          }
        ]
      }
    }
  },

  // ============= STORAGE: GOOGLE DRIVE =============
  'Google Drive': {
    appName: 'Google Drive',
    icon: 'fab fa-google-drive',
    category: 'Storage',
    color: '#4285F4',
    actions: {
      'delete': {
        title: 'Delete Google Drive & Account',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Google Account Settings',
            description: 'Access your Google Account',
            action: 'Open browser → Go to myaccount.google.com',
            credentials: null,
            tips: [
              'Direct Google Account link',
              'Must be signed in'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Google Account',
            description: 'Sign in if needed',
            action: 'Click "Sign in" → Enter email → Click "Next" → Enter password',
            credentials: ['email', 'password'],
            tips: [
              'Complete 2FA if needed'
            ]
          },
          {
            stepNumber: 3,
            title: 'Go to Data & Privacy',
            description: 'Access data deletion options',
            action: 'In left menu, click "Data & privacy" → Scroll down to "Delete your data or account"',
            credentials: null,
            tips: [
              'Different tab from Security',
              'Scroll down to find deletion section'
            ]
          },
          {
            stepNumber: 4,
            title: 'Delete Google Account',
            description: 'Start account deletion',
            action: 'Click "Delete your account" → Read warnings about losing Google Drive, Gmail, YouTube, etc. → Click "Continue"',
            credentials: null,
            tips: [
              'Deletion affects all Google services',
              'All Drive files permanently deleted',
              'Gmail account deleted',
              'YouTube account deleted',
              'Cannot restore after deletion'
            ]
          },
          {
            stepNumber: 5,
            title: 'Confirm Deletion',
            description: 'Complete the deletion',
            action: 'Verify identity → Enter password → Check "I want to permanently delete my account" → Click "Delete account"',
            credentials: ['password'],
            tips: [
              'Final confirmation with password',
              'Google sends confirmation email',
              'All Drive files permanently deleted',
              'Takes time to fully process',
              'Cannot undo'
            ]
          }
        ]
      },
      'pass': {
        title: 'Pass Google Drive to Executor',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Google Drive',
            description: 'Access Google Drive',
            action: 'Open browser → Go to drive.google.com',
            credentials: null,
            tips: [
              'Use web version'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Google Account',
            description: 'Sign in',
            action: 'Click "Sign in" → Enter email → Enter password',
            credentials: ['email', 'password'],
            tips: [
              'Complete 2FA if enabled'
            ]
          },
          {
            stepNumber: 3,
            title: 'Change Google Password',
            description: 'Update password for executor',
            action: 'Go to myaccount.google.com → Click "Security" → Click "Password" → Enter current password → Enter new temporary password → Click "Change password"',
            credentials: ['current password'],
            tips: [
              'Create strong password',
              'Share with executor securely',
              'Use 12+ characters'
            ]
          },
          {
            stepNumber: 4,
            title: 'Share Important Files',
            description: 'Give executor access to files',
            action: 'In Google Drive → Select important files/folders → Click "Share" → Enter executor email → Set permission level (Editor, Viewer) → Click "Send"',
            credentials: null,
            tips: [
              'Editor = can modify files',
              'Viewer = can only read',
              'Executor gets email notification',
              'Can access shared files without password',
              'Share most important documents'
            ]
          },
          {
            stepNumber: 5,
            title: 'Document Drive Contents',
            description: 'Create inventory of files',
            action: 'Take screenshots of: 1) Main Drive folder 2) Storage used 3) Shared files 4) Important documents 5) Create file list document',
            credentials: null,
            tips: [
              'Document file/folder structure',
              'Note storage capacity used',
              'List important file names',
              'Screenshot folder organization',
              'Note any shared drives'
            ]
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
        title: 'Delete Netflix Account Permanently',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Netflix Website',
            description: 'Go to Netflix',
            action: 'Open browser → Go to netflix.com → Click "Sign In" button',
            credentials: null,
            tips: [
              'Use web version',
              'Look for Netflix logo',
              'Check HTTPS padlock'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Netflix',
            description: 'Sign in with credentials',
            action: 'Enter email address → Click "Next" → Enter password → Click "Sign In"',
            credentials: ['email', 'password'],
            tips: [
              'Use registered email',
              'Password is case-sensitive',
              'May ask for 2FA code if enabled'
            ]
          },
          {
            stepNumber: 3,
            title: 'Access Account Settings',
            description: 'Open account menu',
            action: 'In top right corner, click profile icon/name → From dropdown, click "Account" or "Settings"',
            credentials: null,
            tips: [
              'Profile icon in top right',
              'Should see dropdown menu',
              'Look for "Account" option'
            ]
          },
          {
            stepNumber: 4,
            title: 'Find Account Cancellation/Deletion',
            description: 'Locate account closure option',
            action: 'In the Account page → Scroll to the "Membership & Billing" section → Click "Cancel Membership". Alternatively, go directly to netflix.com/cancelplan',
            credentials: null,
            tips: [
              'The direct URL netflix.com/cancelplan takes you straight to the cancellation page',
              'Netflix calls this "Cancel Membership" not "Delete Account"',
              'Simply deleting the Netflix app or signing out does NOT cancel your account — you must do this through account settings or netflix.com/cancelplan',
              'Netflix may offer you a pause option (up to 3 months) as an alternative'
            ]
          },
          {
            stepNumber: 5,
            title: 'Confirm Account Cancellation',
            description: 'Complete deletion',
            action: 'Click "Cancel Membership" → Netflix shows alternatives (pausing, downgrading) → Click "Finish Cancellation" to confirm → Receive confirmation email → Access continues until end of current billing period',
            credentials: null,
            tips: [
              'You keep access until the end of your current billing cycle — no immediate cutoff',
              'Netflix retains your viewing history, recommendations, and preferences for 10 months after cancellation',
              'If you resubscribe within 10 months, your history and preferences are restored',
              'For permanent account deletion (not just cancellation), contact Netflix support at privacy@netflix.com or via live chat at help.netflix.com',
              'If you subscribed through Apple, you must cancel via iPhone Settings → Apple ID → Subscriptions → Netflix',
              'If you subscribed through Google Play, cancel through Play Store → Subscriptions'
            ]
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
            action: 'Open browser → Go to netflix.com',
            credentials: null,
            tips: [
              'Use web version'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Netflix',
            description: 'Sign in',
            action: 'Click "Sign In" → Enter email → Enter password',
            credentials: ['email', 'password'],
            tips: [
              'Verify credentials'
            ]
          },
          {
            stepNumber: 3,
            title: 'Change Account Password',
            description: 'Update password for executor',
            action: 'Click profile icon → "Account" → Scroll to "Account" section → Click "Change password" → Enter current password → Enter new temporary password → Click "Save"',
            credentials: ['current password'],
            tips: [
              'Create strong password',
              'Share securely with executor',
              'Example: Netflix@2024!Exec'
            ]
          },
          {
            stepNumber: 4,
            title: 'Update Payment Method (Optional)',
            description: 'Ensure payment can continue',
            action: 'In Account → "Membership & Billing" → "Billing details" → Verify credit card is valid or add executor payment method',
            credentials: null,
            tips: [
              'Ensure card won\'t expire soon',
              'Update expiration date if needed',
              'Executor can update if account is active'
            ]
          },
          {
            stepNumber: 5,
            title: 'Document Account Information',
            description: 'Create handoff documentation',
            action: 'Take screenshots of: 1) Profile page 2) Subscription plan 3) Profiles on account 4) Viewing history 5) Create summary',
            credentials: null,
            tips: [
              'Document subscription tier',
              'Screenshot number of profiles',
              'Note any shared profiles',
              'Document payment method expiration',
              'List important saved shows'
            ]
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
        title: 'Delete Disney+ Account Permanently',
        steps: [
          {
            stepNumber: 1,
            title: 'Open Disney+ Website',
            description: 'Navigate to Disney+',
            action: 'Open browser → Go to disneyplus.com → Click "Log In" button',
            credentials: null,
            tips: [
              'Use web version',
              'Look for Disney+ logo',
              'Check for HTTPS padlock'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Disney+',
            description: 'Sign in with credentials',
            action: 'Enter email → Click "Log In" → Enter password → Click "Log In"',
            credentials: ['email', 'password'],
            tips: [
              'Use registered email',
              'Password is case-sensitive',
              'May ask for 2FA code'
            ]
          },
          {
            stepNumber: 3,
            title: 'Access Account Settings',
            description: 'Open your account',
            action: 'In top right, click profile icon → Click "Account"',
            credentials: null,
            tips: [
              'Profile icon in top right corner',
              'Should see Account option',
              'May also see Settings'
            ]
          },
          {
            stepNumber: 4,
            title: 'Find Subscription/Account Settings',
            description: 'Locate account deletion',
            action: 'In Account page → Look for "Subscriptions" or "Membership" → Scroll down to find "Cancel Subscription" or "Delete Account" option',
            credentials: null,
            tips: [
              'May appear in Billing section',
              'Look for red Cancel button',
              'Read all warnings'
            ]
          },
          {
            stepNumber: 5,
            title: 'Confirm Account Cancellation',
            description: 'Complete deletion',
            action: 'Click "Cancel Subscription" → Select reason (optional) → Click "Cancel Subscription" to confirm → Verify cancellation email',
            credentials: null,
            tips: [
              'Disney+ sends confirmation email',
              'Access ends immediately or at end of billing period',
              'Cannot restore account',
              'Any prepaid time is forfeited'
            ]
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
            action: 'Open browser → Go to disneyplus.com',
            credentials: null,
            tips: [
              'Use web version'
            ]
          },
          {
            stepNumber: 2,
            title: 'Login to Disney+',
            description: 'Sign in',
            action: 'Click "Log In" → Enter email → Enter password',
            credentials: ['email', 'password'],
            tips: [
              'Verify credentials'
            ]
          },
          {
            stepNumber: 3,
            title: 'Change Account Password',
            description: 'Update password for executor',
            action: 'Click profile icon → "Account" → In Account settings, find "Security" or "Password" → Click "Change password" → Enter current password → Enter new temporary password → Click "Save"',
            credentials: ['current password'],
            tips: [
              'Create strong password',
              'Share securely with executor',
              'Use 12+ characters'
            ]
          },
          {
            stepNumber: 4,
            title: 'Update Billing Information',
            description: 'Ensure account stays active',
            action: 'In Account → "Subscriptions" → Verify payment method → Ensure card is valid → Executor can update later if needed',
            credentials: null,
            tips: [
              'Check card expiration date',
              'Update if expiring soon',
              'Executor can manage subscription'
            ]
          },
          {
            stepNumber: 5,
            title: 'Document Account Details',
            description: 'Create handoff documentation',
            action: 'Take screenshots of: 1) Profile page 2) Subscription plan 3) Linked profiles 4) Payment method 5) Create summary',
            credentials: null,
            tips: [
              'Document subscription tier',
              'Note number of profiles',
              'Screenshot payment details',
              'List important content/watchlists',
              'Document renewal date'
            ]
          }
        ]
      }
    }
  }
};

/**
 * Helper functions to access workflows
 */
function getWorkflow(platformName, actionType) {
  const workflow = WORKFLOWS[platformName];
  if (!workflow) return null;
  return workflow.actions[actionType] || null;
}

function getAvailableActions(platformName) {
  const workflow = WORKFLOWS[platformName];
  if (!workflow) return [];
  return Object.keys(workflow.actions);
}

function getAvailablePlatforms() {
  return Object.keys(WORKFLOWS);
}
