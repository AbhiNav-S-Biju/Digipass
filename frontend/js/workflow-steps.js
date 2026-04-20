/**
 * DIGIPASS Workflow Steps & Instructions
 * Defines step-by-step workflows for each digital asset type
 * Includes animated demo videos, credentials, and visual guides
 */

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
        action: 'Go to mail.google.com in your browser address bar',
        videoUrl: 'https://media.giphy.com/media/26uf1EUQzrRMXeoro/giphy.mp4',
        credentials: null,
        tips: ['Use an incognito window for privacy', 'Have the password ready']
      },
      {
        stepNumber: 2,
        title: 'Login with Credentials',
        description: 'Sign in using the provided email and password',
        action: 'Enter your email address, then the password when prompted',
        videoUrl: 'https://media.giphy.com/media/xTiTnhXAXMZtABBxm0/giphy.mp4',
        credentials: ['email', 'password'],
        tips: ['Password is case-sensitive', 'Enable two-factor authentication if available']
      },
      {
        stepNumber: 3,
        title: 'Access Recovery Options',
        description: 'Find account recovery & security settings',
        action: 'Click profile picture → "Manage your Google Account" → Security tab',
        videoUrl: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4',
        credentials: null,
        tips: ['Save recovery email address', 'Note recovery phone number']
      },
      {
        stepNumber: 4,
        title: 'Document Account Details',
        description: 'Write down recovery email and phone number',
        action: 'Screenshot or write down all recovery contact information',
        videoUrl: 'https://media.giphy.com/media/l0HlCY9x8FZo0XO1i/giphy.mp4',
        credentials: null,
        tips: ['Keep this information safe', 'Update recovery contacts regularly']
      },
      {
        stepNumber: 5,
        title: 'Logout Safely',
        description: 'Sign out of Gmail securely',
        action: 'Click profile picture → Sign out of all accounts',
        videoUrl: 'https://media.giphy.com/media/l4KibK3VG1onQejjO/giphy.mp4',
        credentials: null,
        tips: ['Check for signed-in devices', 'Remove unauthorized access if found']
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
        action: 'Go to facebook.com in your browser',
        videoUrl: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 2,
        title: 'Login',
        description: 'Enter your credentials',
        action: 'Enter email and password',
        videoUrl: 'https://media.giphy.com/media/xTiTnhXAXMZtABBxm0/giphy.mp4',
        credentials: ['email', 'password']
      },
      {
        stepNumber: 3,
        title: 'Access Settings',
        description: 'Go to account settings',
        action: 'Click downward arrow → Settings & privacy → Settings',
        videoUrl: 'https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 4,
        title: 'View Account Info',
        description: 'Find personal account information',
        action: 'Click "Personal information" in left menu',
        videoUrl: 'https://media.giphy.com/media/l0HlCY9x8FZo0XO1i/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 5,
        title: 'Logout',
        description: 'Sign out securely',
        action: 'Click downward arrow → Log out',
        videoUrl: 'https://media.giphy.com/media/l4KibK3VG1onQejjO/giphy.mp4',
        credentials: null
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
        description: 'Access Instagram website or app',
        action: 'Go to instagram.com or open the app',
        videoUrl: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 2,
        title: 'Login',
        description: 'Sign in with credentials',
        action: 'Enter username/email and password',
        videoUrl: 'https://media.giphy.com/media/xTiTnhXAXMZtABBxm0/giphy.mp4',
        credentials: ['username', 'password']
      },
      {
        stepNumber: 3,
        title: 'Go to Profile',
        description: 'Access your profile',
        action: 'Click profile icon in bottom right (mobile) or top right (web)',
        videoUrl: 'https://media.giphy.com/media/26uf1EUQzrRMXeoro/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 4,
        title: 'Open Settings',
        description: 'Access account settings',
        action: 'Click menu icon → Settings and privacy',
        videoUrl: 'https://media.giphy.com/media/l0HlCY9x8FZo0XO1i/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 5,
        title: 'Logout',
        description: 'Sign out',
        action: 'Scroll down → Log out',
        videoUrl: 'https://media.giphy.com/media/l4KibK3VG1onQejjO/giphy.mp4',
        credentials: null
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
        title: 'Open PayPal',
        description: 'Navigate to PayPal website',
        action: 'Go to paypal.com',
        videoUrl: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4',
        credentials: null,
        tips: ['Look for login in top right', 'Avoid clicking ads']
      },
      {
        stepNumber: 2,
        title: 'Login',
        description: 'Sign in with your credentials',
        action: 'Enter email and password',
        videoUrl: 'https://media.giphy.com/media/xTiTnhXAXMZtABBxm0/giphy.mp4',
        credentials: ['email', 'password'],
        tips: ['Use strong password', 'Enable 2FA for security']
      },
      {
        stepNumber: 3,
        title: 'Access Wallet',
        description: 'View linked accounts and payment methods',
        action: 'Click "Wallet" in main menu',
        videoUrl: 'https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 4,
        title: 'Document Financial Info',
        description: 'Note down linked bank accounts and cards',
        action: 'Take screenshots of all linked payment methods',
        videoUrl: 'https://media.giphy.com/media/l0HlCY9x8FZo0XO1i/giphy.mp4',
        credentials: null,
        tips: ['Save account numbers (last 4 digits)', 'Note bank names']
      },
      {
        stepNumber: 5,
        title: 'Logout',
        description: 'Sign out safely',
        action: 'Click profile icon → Log out',
        videoUrl: 'https://media.giphy.com/media/l4KibK3VG1onQejjO/giphy.mp4',
        credentials: null
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
        title: 'Visit Your Bank Website',
        description: 'Open your bank\'s online portal',
        action: 'Go to your bank\'s official website',
        videoUrl: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4',
        credentials: null,
        tips: ['Verify you have the correct URL', 'Check address bar for HTTPS']
      },
      {
        stepNumber: 2,
        title: 'Login to Online Banking',
        description: 'Sign in with your banking credentials',
        action: 'Enter your username and password',
        videoUrl: 'https://media.giphy.com/media/xTiTnhXAXMZtABBxm0/giphy.mp4',
        credentials: ['username', 'password'],
        tips: ['Answer security questions if prompted', 'May need OTP (One-Time Password)']
      },
      {
        stepNumber: 3,
        title: 'View Account Details',
        description: 'Find your account numbers and balances',
        action: 'Navigate to "My Accounts" or "Account Overview"',
        videoUrl: 'https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 4,
        title: 'Document Account Info',
        description: 'Record all account numbers and details',
        action: 'Take screenshots of accounts: checking, savings, credit lines',
        videoUrl: 'https://media.giphy.com/media/l0HlCY9x8FZo0XO1i/giphy.mp4',
        credentials: null,
        tips: ['Note account types', 'Record beneficiary information']
      },
      {
        stepNumber: 5,
        title: 'Logout Securely',
        description: 'Sign out of online banking',
        action: 'Click "Logout" or "Sign Out"',
        videoUrl: 'https://media.giphy.com/media/l4KibK3VG1onQejjO/giphy.mp4',
        credentials: null,
        tips: ['Clear browser cache', 'Don\'t stay logged in on shared devices']
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
        title: 'Open Amazon',
        description: 'Navigate to Amazon website',
        action: 'Go to amazon.com',
        videoUrl: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 2,
        title: 'Login',
        description: 'Sign in to your Amazon account',
        action: 'Click account icon → Sign in with email and password',
        videoUrl: 'https://media.giphy.com/media/xTiTnhXAXMZtABBxm0/giphy.mp4',
        credentials: ['email', 'password']
      },
      {
        stepNumber: 3,
        title: 'Go to Your Account',
        description: 'Access account settings',
        action: 'Click account icon → "Your Account"',
        videoUrl: 'https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 4,
        title: 'View Account Details',
        description: 'Document your account information',
        action: 'View addresses, payment methods, and account settings',
        videoUrl: 'https://media.giphy.com/media/l0HlCY9x8FZo0XO1i/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 5,
        title: 'Logout',
        description: 'Sign out',
        action: 'Click account icon → Sign out',
        videoUrl: 'https://media.giphy.com/media/l4KibK3VG1onQejjO/giphy.mp4',
        credentials: null
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
        action: 'Go to drive.google.com',
        videoUrl: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 2,
        title: 'Login',
        description: 'Sign in with your Google account',
        action: 'Use the same email as Gmail',
        videoUrl: 'https://media.giphy.com/media/xTiTnhXAXMZtABBxm0/giphy.mp4',
        credentials: ['email', 'password']
      },
      {
        stepNumber: 3,
        title: 'View Your Files',
        description: 'Navigate through your drive',
        action: 'Check "My Drive" for important documents',
        videoUrl: 'https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 4,
        title: 'Document Important Files',
        description: 'Make note of important documents',
        action: 'Screenshot or list all important files and their locations',
        videoUrl: 'https://media.giphy.com/media/l0HlCY9x8FZo0XO1i/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 5,
        title: 'Logout',
        description: 'Sign out safely',
        action: 'Click profile → Sign out',
        videoUrl: 'https://media.giphy.com/media/l4KibK3VG1onQejjO/giphy.mp4',
        credentials: null
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
        title: 'Open Dropbox',
        description: 'Navigate to Dropbox website',
        action: 'Go to dropbox.com',
        videoUrl: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 2,
        title: 'Login',
        description: 'Sign in with your credentials',
        action: 'Enter email and password',
        videoUrl: 'https://media.giphy.com/media/xTiTnhXAXMZtABBxm0/giphy.mp4',
        credentials: ['email', 'password']
      },
      {
        stepNumber: 3,
        title: 'Browse Files',
        description: 'View your Dropbox contents',
        action: 'Explore all files and folders',
        videoUrl: 'https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 4,
        title: 'Document Files',
        description: 'Record important files',
        action: 'Screenshot important files and folder structure',
        videoUrl: 'https://media.giphy.com/media/l0HlCY9x8FZo0XO1i/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 5,
        title: 'Logout',
        description: 'Sign out',
        action: 'Click profile → Sign out',
        videoUrl: 'https://media.giphy.com/media/l4KibK3VG1onQejjO/giphy.mp4',
        credentials: null
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
        title: 'Open iCloud',
        description: 'Go to iCloud.com',
        action: 'Navigate to icloud.com',
        videoUrl: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 2,
        title: 'Login with Apple ID',
        description: 'Sign in with your Apple ID',
        action: 'Enter Apple ID email and password',
        videoUrl: 'https://media.giphy.com/media/xTiTnhXAXMZtABBxm0/giphy.mp4',
        credentials: ['apple_id', 'password']
      },
      {
        stepNumber: 3,
        title: 'View iCloud Services',
        description: 'See your available iCloud services',
        action: 'Check Mail, Contacts, Reminders, Notes, etc.',
        videoUrl: 'https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 4,
        title: 'Access Account Settings',
        description: 'View account details',
        action: 'Click account name → Account settings',
        videoUrl: 'https://media.giphy.com/media/l0HlCY9x8FZo0XO1i/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 5,
        title: 'Logout',
        description: 'Sign out safely',
        action: 'Click account name → Sign out',
        videoUrl: 'https://media.giphy.com/media/l4KibK3VG1onQejjO/giphy.mp4',
        credentials: null
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
        title: 'Open LinkedIn',
        description: 'Navigate to LinkedIn',
        action: 'Go to linkedin.com',
        videoUrl: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 2,
        title: 'Login',
        description: 'Sign in with credentials',
        action: 'Enter email and password',
        videoUrl: 'https://media.giphy.com/media/xTiTnhXAXMZtABBxm0/giphy.mp4',
        credentials: ['email', 'password']
      },
      {
        stepNumber: 3,
        title: 'Go to Profile',
        description: 'View your LinkedIn profile',
        action: 'Click profile picture → View profile',
        videoUrl: 'https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 4,
        title: 'Document Profile',
        description: 'Record profile information',
        action: 'Screenshot profile, connections, and recommendations',
        videoUrl: 'https://media.giphy.com/media/l0HlCY9x8FZo0XO1i/giphy.mp4',
        credentials: null
      },
      {
        stepNumber: 5,
        title: 'Logout',
        description: 'Sign out',
        action: 'Click profile picture → Sign out',
        videoUrl: 'https://media.giphy.com/media/l4KibK3VG1onQejjO/giphy.mp4',
        credentials: null
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
