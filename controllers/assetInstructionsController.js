const pool = require('../db.js');

/**
 * Get detailed instructions for an asset
 * GET /api/executor/asset-instructions/:assetId
 */
async function getAssetInstructions(req, res) {
  try {
    const { assetId } = req.params;
    
    // Executor info already verified by middleware
    const executor = req.executor;
    
    if (!executor) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Get asset details
    const { rows: assetRows } = await pool.query(
      'SELECT * FROM digital_assets WHERE asset_id = $1 AND user_id = $2',
      [assetId, executor.user_id]
    );

    if (assetRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const asset = assetRows[0];

    // Get user details for registered email
    const { rows: userRows } = await pool.query(
      'SELECT full_name, email FROM users WHERE user_id = $1',
      [executor.user_id]
    );

    const user = userRows[0];

    // Generate instructions based on action type
    const instructions = generateInstructions(asset, user, executor);

    return res.status(200).json({
      success: true,
      data: {
        asset: {
          asset_id: asset.asset_id,
          platform_name: asset.platform_name,
          account_identifier: asset.account_identifier,
          account_password: asset.account_password,
          action_type: asset.action_type,
          last_message: asset.last_message,
          category: asset.category,
          created_at: asset.created_at
        },
        user: {
          full_name: user.full_name,
          email: user.email
        },
        executor: {
          executor_name: executor.executor_name,
          executor_email: executor.executor_email
        },
        instructions
      }
    });
  } catch (error) {
    console.error('Asset Instructions Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch asset instructions'
    });
  }
}

/**
 * Generate platform-specific instructions
 */
function generateInstructions(asset, user, executor) {
  const platform = asset.platform_name.toLowerCase();
  const actionType = asset.action_type;

  const platformLinks = {
    instagram: {
      login: 'https://instagram.com/accounts/login/',
      settings: 'https://instagram.com/accounts/edit/',
      delete: 'https://instagram.com/accounts/remove/request/'
    },
    facebook: {
      login: 'https://www.facebook.com/login/',
      settings: 'https://www.facebook.com/settings',
      delete: 'https://www.facebook.com/help/delete_account'
    },
    twitter: {
      login: 'https://twitter.com/login',
      settings: 'https://twitter.com/settings/account',
      delete: 'https://twitter.com/settings/deactivate'
    },
    gmail: {
      login: 'https://accounts.google.com/login',
      settings: 'https://myaccount.google.com/',
      delete: 'https://myaccount.google.com/deleteaccount'
    },
    linkedin: {
      login: 'https://www.linkedin.com/login',
      settings: 'https://www.linkedin.com/account/settings',
      delete: 'https://www.linkedin.com/account/settings'
    },
    discord: {
      login: 'https://discord.com/login',
      settings: 'https://discord.com/app-directory',
      delete: 'https://discord.com/app-directory'
    },
    paypal: {
      login: 'https://www.paypal.com/signin',
      settings: 'https://www.paypal.com/myaccount/settings',
      delete: 'https://www.paypal.com/myaccount/settings'
    },
    amazon: {
      login: 'https://www.amazon.com/ap/signin',
      settings: 'https://www.amazon.com/gp/css/homepage.html',
      delete: 'https://www.amazon.com/gp/help/customer/display.html'
    },
    youtube: {
      login: 'https://accounts.google.com/login',
      settings: 'https://www.youtube.com/account',
      delete: 'https://myaccount.google.com/deleteaccount'
    },
    twitch: {
      login: 'https://www.twitch.tv/login',
      settings: 'https://www.twitch.tv/settings/account',
      delete: 'https://www.twitch.tv/settings/account'
    },
    reddit: {
      login: 'https://www.reddit.com/login',
      settings: 'https://www.reddit.com/settings/account',
      delete: 'https://www.reddit.com/settings/account'
    },
    spotify: {
      login: 'https://www.spotify.com/login',
      settings: 'https://www.spotify.com/account/edit/',
      delete: 'https://www.spotify.com/account/settings'
    },
    'disney+': {
      login: 'https://www.disneyplus.com/login',
      settings: 'https://www.disneyplus.com/account',
      delete: 'https://www.disneyplus.com/account'
    },
    tiktok: {
      login: 'https://www.tiktok.com/login',
      settings: 'https://www.tiktok.com/setting',
      delete: 'https://www.tiktok.com/setting'
    },
    snapchat: {
      login: 'https://accounts.snapchat.com/login',
      settings: 'https://accounts.snapchat.com/accounts/settings',
      delete: 'https://accounts.snapchat.com/accounts/delete'
    },
    netflix: {
      login: 'https://www.netflix.com/login',
      settings: 'https://www.netflix.com/account',
      delete: 'https://www.netflix.com/account'
    },
    hulu: {
      login: 'https://www.hulu.com/account/login',
      settings: 'https://account.hulu.com/account/settings',
      delete: 'https://account.hulu.com/account/settings'
    },
    'google drive': {
      login: 'https://accounts.google.com/login',
      settings: 'https://myaccount.google.com/',
      delete: 'https://myaccount.google.com/deleteaccount'
    },
    dropbox: {
      login: 'https://www.dropbox.com/login',
      settings: 'https://www.dropbox.com/account',
      delete: 'https://www.dropbox.com/account'
    },
    outlook: {
      login: 'https://outlook.office.com/',
      settings: 'https://account.microsoft.com/account',
      delete: 'https://account.microsoft.com/account/delete'
    },
    onedrive: {
      login: 'https://onedrive.live.com',
      settings: 'https://account.microsoft.com/account',
      delete: 'https://account.microsoft.com/account/delete'
    },
    icloud: {
      login: 'https://www.icloud.com/login',
      settings: 'https://www.icloud.com/',
      delete: 'https://account.apple.com/account'
    }
  };

  const links = platformLinks[platform] || {
    login: `https://${platform}.com/login`,
    settings: `https://${platform}.com/settings`,
    delete: `https://${platform}.com/delete`
  };

  // Platform-specific delete instructions
  const deleteInstructions = {
    instagram: [
      {
        step: 1,
        title: 'Open Instagram Login',
        description: 'Go to Instagram\'s official login page',
        action: 'Click the button to open Instagram',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'If you don\'t have the password, click "Need help signing in" for recovery'
      },
      {
        step: 3,
        title: 'Navigate to Settings',
        description: 'Go to account settings from your profile',
        action: 'Tap the menu icon (☰) → Settings and Privacy',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Account Center',
        description: 'Look for Account Center or Help Center',
        action: 'Go to Account Center → Accounts → [Your Account]'
      },
      {
        step: 5,
        title: 'Deactivate or Delete',
        description: 'Instagram offers Deactivate (temporary) or Delete (permanent) options',
        action: 'Choose "Delete Account" for permanent deletion (wait 30 days for irreversible deletion)'
      },
      {
        step: 6,
        title: 'Confirm Deletion Reason',
        description: 'Instagram will ask why you\'re leaving',
        action: 'Select reason and provide feedback if prompted'
      },
      {
        step: 7,
        title: 'Final Confirmation',
        description: 'Re-enter your password to confirm deletion',
        action: 'Complete the process and account will be deleted after 30 days'
      }
    ],
    facebook: [
      {
        step: 1,
        title: 'Open Facebook Login',
        description: 'Go to Facebook\'s official login page',
        action: 'Click the button to open Facebook',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter credentials or use password recovery if needed'
      },
      {
        step: 3,
        title: 'Access Settings',
        description: 'Go to Settings from the menu',
        action: 'Click the menu icon → Settings and privacy → Settings',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Deactivation or Deletion',
        description: 'Navigate to account controls',
        action: 'Go to "Deactivation and Deletion" in the left sidebar'
      },
      {
        step: 5,
        title: 'Choose Deletion Option',
        description: 'Facebook offers Deactivate (temporary) or Delete (permanent)',
        action: 'Select "Delete Account" for permanent removal'
      },
      {
        step: 6,
        title: 'Confirm Your Identity',
        description: 'Complete the identity verification',
        action: 'Re-enter password and complete any security checks'
      },
      {
        step: 7,
        title: 'Submit Deletion Request',
        description: 'Account will be scheduled for deletion',
        action: 'Follow final prompts - deletion takes ~30 days to complete'
      }
    ],
    gmail: [
      {
        step: 1,
        title: 'Open Google Account',
        description: 'Go to your Google Account page',
        action: 'Click the button to open Google Account',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Complete any security verification needed'
      },
      {
        step: 3,
        title: 'Navigate to Data & Privacy',
        description: 'Go to Data & Privacy settings',
        action: 'Click "Data & Privacy" in the left sidebar',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Delete Your Google Account',
        description: 'Scroll down to "More options" section',
        action: 'Look for "Delete your Google Account and data"'
      },
      {
        step: 5,
        title: 'Choose Deletion Option',
        description: 'You can delete just Gmail or entire Google Account',
        action: 'Select "Delete your entire Google Account and data" for complete removal'
      },
      {
        step: 6,
        title: 'Download Your Data (Optional)',
        description: 'Google offers option to download your data first',
        action: 'Skip or download if needed, then proceed'
      },
      {
        step: 7,
        title: 'Confirm Your Password',
        description: 'Verify identity with your password',
        action: 'Enter password and complete the deletion request'
      }
    ],
    discord: [
      {
        step: 1,
        title: 'Open Discord Login',
        description: 'Go to Discord\'s official login page',
        action: 'Click the button to open Discord',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Complete login and any multi-factor authentication'
      },
      {
        step: 3,
        title: 'Access User Settings',
        description: 'Open Discord User Settings',
        action: 'Click the gear icon ⚙️ in the bottom left corner'
      },
      {
        step: 4,
        title: 'Navigate to Account',
        description: 'Find Account settings in the left sidebar',
        action: 'Scroll down to "Account" section'
      },
      {
        step: 5,
        title: 'Scroll to Delete Account',
        description: 'Look for Delete Account option at bottom',
        action: 'Click "Delete Account" button'
      },
      {
        step: 6,
        title: 'Confirm Your Password',
        description: 'Enter your password to verify deletion',
        action: 'Type password in the confirmation dialog'
      },
      {
        step: 7,
        title: 'Final Confirmation',
        description: 'Confirm you want to permanently delete your account',
        action: 'Click "Delete Account" to complete - account will be deleted immediately'
      }
    ],
    linkedin: [
      {
        step: 1,
        title: 'Open LinkedIn Login',
        description: 'Go to LinkedIn\'s official login page',
        action: 'Click the button to open LinkedIn',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter credentials or use password recovery'
      },
      {
        step: 3,
        title: 'Go to Account Settings',
        description: 'Access your account settings',
        action: 'Click your profile picture → Settings and Privacy',
        link: links.settings
      },
      {
        step: 4,
        title: 'Navigate to Account Preferences',
        description: 'Find Account Preferences',
        action: 'Click "Account preferences" under "Account"'
      },
      {
        step: 5,
        title: 'Find Close Account Option',
        description: 'Look for account closure option',
        action: 'Find "Closing your account" at the bottom of settings'
      },
      {
        step: 6,
        title: 'Review Account Deletion Info',
        description: 'LinkedIn will show what happens when you delete',
        action: 'Review the consequences and click "Delete account"'
      },
      {
        step: 7,
        title: 'Confirm with Password',
        description: 'Verify your identity before deletion',
        action: 'Enter your password and complete the deletion'
      }
    ],
    twitter: [
      {
        step: 1,
        title: 'Open Twitter/X Login',
        description: 'Go to X (formerly Twitter) login page',
        action: 'Click the button to open X.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Complete login with password and 2FA if enabled'
      },
      {
        step: 3,
        title: 'Go to Settings',
        description: 'Access account settings',
        action: 'Click the three dots menu (•••) → Settings and privacy',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Account Section',
        description: 'Navigate to Account settings',
        action: 'Click "Account" in the left sidebar'
      },
      {
        step: 5,
        title: 'Deactivate Account',
        description: 'Look for Deactivation option',
        action: 'Scroll down and click "Deactivate my account"'
      },
      {
        step: 6,
        title: 'Read Warnings',
        description: 'Review what happens when account is deactivated',
        action: 'Read the information - you have 30 days to restore'
      },
      {
        step: 7,
        title: 'Confirm Deactivation',
        description: 'Verify your password and complete deactivation',
        action: 'Click "Deactivate" - account will be deleted after 30 days'
      }
    ],
    youtube: [
      {
        step: 1,
        title: 'Open Google Account',
        description: 'YouTube is owned by Google, go to Google Account',
        action: 'Click the button to access your Google Account',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Complete login with proper security verification'
      },
      {
        step: 3,
        title: 'Go to Data & Privacy',
        description: 'Access Data & Privacy settings',
        action: 'Click "Data & Privacy" in the left menu',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find YouTube Deletion',
        description: 'Look for YouTube deletion option',
        action: 'Find "Delete your YouTube channel" or "Delete your entire Google Account"'
      },
      {
        step: 5,
        title: 'Choose Deletion Scope',
        description: 'You can delete just the channel or entire Google Account',
        action: 'Select appropriate option based on your needs'
      },
      {
        step: 6,
        title: 'Download Data (Optional)',
        description: 'Option to backup your data before deletion',
        action: 'Choose to download or skip, then proceed'
      },
      {
        step: 7,
        title: 'Confirm Deletion',
        description: 'Verify with password',
        action: 'Enter password and complete the deletion request'
      }
    ],
    paypal: [
      {
        step: 1,
        title: 'Open PayPal Login',
        description: 'Go to PayPal\'s official login page',
        action: 'Click the button to open PayPal',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Complete login with credentials and any security verification'
      },
      {
        step: 3,
        title: 'Go to Account Settings',
        description: 'Access your account settings',
        action: 'Click on Settings icon or "Account" from menu',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Account Closure Option',
        description: 'Look for Close Account or Permanently Close Account',
        action: 'Scroll through settings to find account closure option'
      },
      {
        step: 5,
        title: 'Review Account Status',
        description: 'PayPal will show your account balance and pending transactions',
        action: 'Resolve any outstanding transactions or payments before closure'
      },
      {
        step: 6,
        title: 'Confirm Closure Reason',
        description: 'PayPal may ask for reason of closure',
        action: 'Provide reason if requested'
      },
      {
        step: 7,
        title: 'Final Confirmation',
        description: 'Confirm account closure with password',
        action: 'Verify with password - account will be closed permanently'
      }
    ],
    amazon: [
      {
        step: 1,
        title: 'Open Amazon Login',
        description: 'Go to Amazon\'s official login page',
        action: 'Click the button to open Amazon',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Complete login with password and any 2FA'
      },
      {
        step: 3,
        title: 'Go to Account Settings',
        description: 'Access your account settings',
        action: 'Click "Account" → "Your Account" in dropdown menu',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Login & Security',
        description: 'Navigate to Login & Security section',
        action: 'Look for "Login & Security" option'
      },
      {
        step: 5,
        title: 'Look for Delete Account',
        description: 'Scroll down to find account deletion option',
        action: 'Find "Close your Amazon account" link'
      },
      {
        step: 6,
        title: 'Review Closure Terms',
        description: 'Amazon will show what happens when account closes',
        action: 'Read and understand the closure consequences'
      },
      {
        step: 7,
        title: 'Confirm Closure',
        description: 'Complete account closure request',
        action: 'Follow final steps - account will be closed permanently'
      }
    ],
    twitch: [
      {
        step: 1,
        title: 'Open Twitch Login',
        description: 'Go to Twitch\'s official login page',
        action: 'Click the button to open Twitch',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Complete login with password and 2FA if enabled'
      },
      {
        step: 3,
        title: 'Go to Settings',
        description: 'Access account settings from menu',
        action: 'Click profile icon → Settings',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Security and Privacy',
        description: 'Look for Security or Account settings',
        action: 'Navigate to relevant settings section'
      },
      {
        step: 5,
        title: 'Look for Delete Account',
        description: 'Find account deletion option',
        action: 'Look for "Delete Account" button'
      },
      {
        step: 6,
        title: 'Confirm Deletion',
        description: 'Twitch will request password confirmation',
        action: 'Enter password to verify your identity'
      },
      {
        step: 7,
        title: 'Complete Deletion',
        description: 'Final step to delete account',
        action: 'Confirm deletion - your account will be removed'
      }
    ],
    reddit: [
      {
        step: 1,
        title: 'Open Reddit Login',
        description: 'Go to Reddit\'s official login page',
        action: 'Click the button to open Reddit',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Complete login with credentials'
      },
      {
        step: 3,
        title: 'Go to User Settings',
        description: 'Access your account settings',
        action: 'Click your profile icon → User Settings',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Account Preferences',
        description: 'Navigate to Account section',
        action: 'Look for "Account" tab in settings'
      },
      {
        step: 5,
        title: 'Look for Deactivate Account',
        description: 'Find account deactivation option',
        action: 'Scroll to find "Deactivate Account" option'
      },
      {
        step: 6,
        title: 'Confirm Deactivation',
        description: 'Enter password to confirm deactivation',
        action: 'Type password in confirmation field'
      },
      {
        step: 7,
        title: 'Complete Deactivation',
        description: 'Finalize the account deactivation',
        action: 'Click "Deactivate" to complete - account will be permanently deleted after 30 days'
      }
    ],
    amazon: [
      {
        step: 1,
        title: 'Open Amazon Login',
        description: 'Go to Amazon\'s official login page',
        action: 'Click the button to open Amazon.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email/phone and password to access account'
      },
      {
        step: 3,
        title: 'Go to Account Settings',
        description: 'Navigate to your account settings',
        action: 'Click "Account & Lists" → "Your Account"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Login & Security',
        description: 'Look for Account settings section',
        action: 'Go to "Login & security" section in Account settings'
      },
      {
        step: 5,
        title: 'Close Your Account',
        description: 'Look for account closure option',
        action: 'Scroll down and find "Close your account" link'
      },
      {
        step: 6,
        title: 'Review Account Status',
        description: 'Review any outstanding orders or obligations',
        action: 'Check for active subscriptions, orders, or refunds before closure'
      },
      {
        step: 7,
        title: 'Confirm Closure',
        description: 'Complete the account deletion process',
        action: 'Follow instructions to permanently delete account'
      }
    ],
    spotify: [
      {
        step: 1,
        title: 'Open Spotify Login',
        description: 'Go to Spotify\'s official login page',
        action: 'Click the button to open Spotify.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email and password to access account'
      },
      {
        step: 3,
        title: 'Go to Account Settings',
        description: 'Navigate to your account settings',
        action: 'Click your profile name → "Account"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Privacy Settings',
        description: 'Look for privacy and data options',
        action: 'Scroll down to find "Data rights" or "Privacy" section'
      },
      {
        step: 5,
        title: 'Download or Delete Data',
        description: 'Choose to delete account permanently',
        action: 'Click "Download your data" or look for delete account option'
      },
      {
        step: 6,
        title: 'Confirm Your Password',
        description: 'Enter password to verify account deletion',
        action: 'Type your password in the confirmation dialog'
      },
      {
        step: 7,
        title: 'Complete Deletion',
        description: 'Finalize the account deletion',
        action: 'Confirm deletion - your Spotify account will be permanently deleted'
      }
    ],
    'disney+': [
      {
        step: 1,
        title: 'Open Disney+ Login',
        description: 'Go to Disney+ website and login',
        action: 'Click the button to open DisneyPlus.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email and password to access account'
      },
      {
        step: 3,
        title: 'Go to Account Settings',
        description: 'Navigate to your account settings',
        action: 'Click your profile icon → "Account"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Account Details',
        description: 'Look for account information section',
        action: 'Go to "Account" or "Profile" section'
      },
      {
        step: 5,
        title: 'Cancel Subscription (if needed)',
        description: 'Cancel active subscription before deleting account',
        action: 'Cancel any active Disney+ subscription first'
      },
      {
        step: 6,
        title: 'Delete Account',
        description: 'Look for account deletion option',
        action: 'Find and click "Delete account" or "Close account" link'
      },
      {
        step: 7,
        title: 'Confirm Deletion',
        description: 'Complete the account deletion',
        action: 'Confirm deletion - your Disney+ account and all data will be removed'
      }
    ],
    tiktok: [
      {
        step: 1,
        title: 'Open TikTok Login',
        description: 'Go to TikTok website or app login',
        action: 'Click the button to open TikTok.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email/phone and password to access account'
      },
      {
        step: 3,
        title: 'Go to Settings',
        description: 'Navigate to account settings',
        action: 'Click profile icon → "Settings and privacy"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Account Section',
        description: 'Look for account management options',
        action: 'Go to "Account" section'
      },
      {
        step: 5,
        title: 'Delete Account',
        description: 'Look for account deletion option',
        action: 'Find "Delete account" option'
      },
      {
        step: 6,
        title: 'Enter Password',
        description: 'Verify your identity',
        action: 'Enter password to confirm deletion'
      },
      {
        step: 7,
        title: 'Confirm Final Deletion',
        description: 'Complete the deletion process',
        action: 'Confirm deletion - your TikTok account will be permanently deleted'
      }
    ],
    snapchat: [
      {
        step: 1,
        title: 'Open Snapchat Login',
        description: 'Go to Snapchat web login',
        action: 'Visit accounts.snapchat.com to login',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter username and password'
      },
      {
        step: 3,
        title: 'Go to Account Settings',
        description: 'Navigate to account management',
        action: 'Click "Account" in the menu',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Delete Account Option',
        description: 'Look for account deletion settings',
        action: 'Find "Delete Account" or "Close Account" option'
      },
      {
        step: 5,
        title: 'Review Account Data',
        description: 'Snapchat will show what data will be deleted',
        action: 'Review all data that will be removed'
      },
      {
        step: 6,
        title: 'Confirm Your Password',
        description: 'Verify your identity',
        action: 'Enter password to confirm deletion'
      },
      {
        step: 7,
        title: 'Complete Deletion',
        description: 'Finalize the deletion process',
        action: 'Confirm deletion - your Snapchat account will be deleted'
      }
    ],
    netflix: [
      {
        step: 1,
        title: 'Open Netflix Login',
        description: 'Go to Netflix website',
        action: 'Visit Netflix.com and login',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email and password'
      },
      {
        step: 3,
        title: 'Go to Account Settings',
        description: 'Navigate to account page',
        action: 'Click profile icon → "Account"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Membership Section',
        description: 'Look for membership and billing settings',
        action: 'Find "Membership & billing"'
      },
      {
        step: 5,
        title: 'Cancel Membership',
        description: 'First cancel active subscription',
        action: 'Click "Cancel membership" - account can be deleted only after'
      },
      {
        step: 6,
        title: 'Delete Account After Cancellation',
        description: 'Delete account option appears after cancellation',
        action: 'Return to settings and find "Delete account" option'
      },
      {
        step: 7,
        title: 'Confirm Account Deletion',
        description: 'Complete the deletion',
        action: 'Confirm deletion - your Netflix account will be permanently deleted'
      }
    ],
    hulu: [
      {
        step: 1,
        title: 'Open Hulu Login',
        description: 'Go to Hulu website',
        action: 'Visit Hulu.com and login',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email and password'
      },
      {
        step: 3,
        title: 'Go to Account Settings',
        description: 'Navigate to account management',
        action: 'Click account icon → "Account Settings"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Subscription Details',
        description: 'Look for subscription and plan details',
        action: 'Navigate to subscription section'
      },
      {
        step: 5,
        title: 'Cancel Subscription',
        description: 'Cancel active Hulu subscription first',
        action: 'Click "Cancel subscription"'
      },
      {
        step: 6,
        title: 'Delete Account',
        description: 'Delete account option available after cancellation',
        action: 'Find and click "Delete account" option'
      },
      {
        step: 7,
        title: 'Confirm Deletion',
        description: 'Complete the account deletion',
        action: 'Confirm deletion - your Hulu account will be permanently deleted'
      }
    ],
    'google drive': [
      {
        step: 1,
        title: 'Open Google Account',
        description: 'Go to Google Account page',
        action: 'Visit accounts.google.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email and password (this affects all Google services)'
      },
      {
        step: 3,
        title: 'Go to Data & Privacy',
        description: 'Navigate to data deletion settings',
        action: 'Click "Data & Privacy" in the left menu',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Download or Delete Options',
        description: 'Look for data download or deletion',
        action: 'Find "Delete your data or account" section'
      },
      {
        step: 5,
        title: 'Delete Your Google Account',
        description: 'Choose to delete entire Google Account (includes Drive)',
        action: 'Click "Delete your entire Google Account and data"'
      },
      {
        step: 6,
        title: 'Download Data (Optional)',
        description: 'Option to backup your Google Drive files',
        action: 'Choose to download or skip backup'
      },
      {
        step: 7,
        title: 'Confirm Deletion',
        description: 'Complete the account and data deletion',
        action: 'Confirm deletion - Google Account and Drive will be deleted'
      }
    ],
    dropbox: [
      {
        step: 1,
        title: 'Open Dropbox Login',
        description: 'Go to Dropbox website',
        action: 'Visit Dropbox.com and login',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email and password'
      },
      {
        step: 3,
        title: 'Go to Account Settings',
        description: 'Navigate to account settings',
        action: 'Click profile picture → "Settings"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Account Tab',
        description: 'Look for account management section',
        action: 'Click on "Account" tab'
      },
      {
        step: 5,
        title: 'Scroll to Delete Account',
        description: 'Find account deletion option',
        action: 'Look for "Delete account" link at bottom'
      },
      {
        step: 6,
        title: 'Review Account Data',
        description: 'Dropbox shows data that will be deleted',
        action: 'Review all files that will be removed'
      },
      {
        step: 7,
        title: 'Confirm Deletion',
        description: 'Complete account deletion',
        action: 'Confirm deletion - your Dropbox account will be permanently deleted'
      }
    ],
    outlook: [
      {
        step: 1,
        title: 'Open Outlook Login',
        description: 'Go to Outlook.office.com',
        action: 'Click the button to open Outlook',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email and password'
      },
      {
        step: 3,
        title: 'Go to Microsoft Account Settings',
        description: 'Navigate to Microsoft account management',
        action: 'Click profile icon → "View account"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Privacy and Data Options',
        description: 'Look for account deletion options',
        action: 'Go to "Privacy" or "Security" settings'
      },
      {
        step: 5,
        title: 'Delete Microsoft Account',
        description: 'Choose to delete entire Microsoft account (includes Outlook)',
        action: 'Find "Delete account" option'
      },
      {
        step: 6,
        title: 'Confirm Your Identity',
        description: 'Microsoft will verify your identity',
        action: 'Complete identity verification steps'
      },
      {
        step: 7,
        title: 'Complete Deletion',
        description: 'Finalize the account deletion',
        action: 'Confirm deletion - your Outlook account will be permanently deleted'
      }
    ],
    onedrive: [
      {
        step: 1,
        title: 'Open OneDrive Login',
        description: 'Go to OneDrive',
        action: 'Visit OneDrive.live.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email and password'
      },
      {
        step: 3,
        title: 'Go to Microsoft Account',
        description: 'Navigate to account settings',
        action: 'Click profile icon → "View account"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Account Deletion',
        description: 'Look for delete account option',
        action: 'Go to "Security" or "More security" options'
      },
      {
        step: 5,
        title: 'Delete Microsoft Account',
        description: 'Choose to delete entire Microsoft account (includes OneDrive)',
        action: 'Find "Delete account" option'
      },
      {
        step: 6,
        title: 'Review Data',
        description: 'Microsoft will show files that will be deleted',
        action: 'Review all OneDrive files'
      },
      {
        step: 7,
        title: 'Confirm Deletion',
        description: 'Complete account deletion',
        action: 'Confirm deletion - your OneDrive account will be permanently deleted'
      }
    ],
    icloud: [
      {
        step: 1,
        title: 'Open iCloud Login',
        description: 'Go to iCloud website',
        action: 'Visit iCloud.com and login',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter Apple ID and password'
      },
      {
        step: 3,
        title: 'Go to Account Settings',
        description: 'Navigate to Apple ID account settings',
        action: 'Click profile name → "Account Settings"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Find Account Deletion',
        description: 'Look for account deletion section',
        action: 'Find "Delete account" or "Account & security" option'
      },
      {
        step: 5,
        title: 'Delete Apple ID Account',
        description: 'Choose to delete entire Apple ID',
        action: 'Click "Delete your account"'
      },
      {
        step: 6,
        title: 'Review Consequences',
        description: 'Apple will show consequences of deletion',
        action: 'Review what data will be deleted from all Apple services'
      },
      {
        step: 7,
        title: 'Confirm Deletion',
        description: 'Complete the account deletion',
        action: 'Confirm deletion - your iCloud account will be permanently deleted'
      }
    ]
  };

  // Platform-specific pass/handover instructions
  const passInstructions = {
    instagram: [
      {
        step: 1,
        title: 'Open Instagram Login',
        description: 'Go to Instagram\'s official login page',
        action: 'Click the button to open Instagram',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Complete login with password'
      },
      {
        step: 3,
        title: 'Update Email Address',
        description: 'Change email to executor\'s email for recovery',
        action: 'Go to Settings → Account → Email, change to executor\'s email',
        link: links.settings
      },
      {
        step: 4,
        title: 'Update Phone Number',
        description: 'Add executor\'s phone if available',
        action: 'Go to Settings → Account → Phone, add new number'
      },
      {
        step: 5,
        title: 'Enable Two-Factor Authentication',
        description: 'Secure the account with 2FA',
        action: 'Go to Settings → Security → Two-Factor Authentication, enable it'
      },
      {
        step: 6,
        title: 'Review Login Activity',
        description: 'Check who has accessed the account',
        action: 'Go to Settings → Security → Login Activity, logout unfamiliar sessions'
      },
      {
        step: 7,
        title: 'Share New Credentials',
        description: 'Provide new password to executor',
        action: 'Use the password provided in Login Credentials box above'
      }
    ],
    gmail: [
      {
        step: 1,
        title: 'Open Google Account',
        description: 'Go to your Google Account page',
        action: 'Click the button to open Google Account',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Complete login with password and security verification'
      },
      {
        step: 3,
        title: 'Update Recovery Email',
        description: 'Change recovery email to executor\'s email',
        action: `Go to Security → Recovery options → Change recovery email to ${executor.executor_email}`,
        link: links.settings
      },
      {
        step: 4,
        title: 'Update Recovery Phone',
        description: 'Add executor\'s phone number for account recovery',
        action: 'Go to Security → Recovery options → Add recovery phone'
      },
      {
        step: 5,
        title: 'Enable Two-Factor Authentication',
        description: 'Protect account with 2FA',
        action: 'Go to Security → 2-Step Verification, set it up with executor\'s phone'
      },
      {
        step: 6,
        title: 'Create App Passwords',
        description: 'Generate secure app-specific passwords',
        action: 'Go to Security → App passwords, create password for mail client'
      },
      {
        step: 7,
        title: 'Review Active Sessions',
        description: 'Logout unauthorized devices',
        action: 'Go to Security → Your devices, manage active sessions'
      }
    ],
    discord: [
      {
        step: 1,
        title: 'Open Discord Login',
        description: 'Go to Discord\'s official login page',
        action: 'Click the button to open Discord',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Complete login with password'
      },
      {
        step: 3,
        title: 'Change Email Address',
        description: 'Update email to executor\'s email',
        action: `Go to Settings → Account → Email, change to ${executor.executor_email}`,
        link: links.settings
      },
      {
        step: 4,
        title: 'Enable Two-Factor Authentication',
        description: 'Secure the account',
        action: 'Go to Settings → Account → Two-Factor Authentication, enable'
      },
      {
        step: 5,
        title: 'Transfer Server Ownership (if applicable)',
        description: 'Transfer any owned servers to executor',
        action: 'Go to each server → Server Settings → Transfer Ownership'
      },
      {
        step: 6,
        title: 'Review Authorized Apps',
        description: 'Check and remove unauthorized third-party apps',
        action: 'Go to Settings → Authorized Apps, review and disconnect unfamiliar apps'
      },
      {
        step: 7,
        title: 'Complete Handover',
        description: 'Document that account has been handed over',
        action: 'Take a screenshot showing email is now executor\'s email'
      }
    ],
    linkedin: [
      {
        step: 1,
        title: 'Open LinkedIn Login',
        description: 'Go to LinkedIn\'s official login page',
        action: 'Click the button to open LinkedIn',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Complete login with credentials'
      },
      {
        step: 3,
        title: 'Update Email Address',
        description: 'Change primary email to executor\'s email',
        action: `Go to Settings and Privacy → Account → Change email to ${executor.executor_email}`,
        link: links.settings
      },
      {
        step: 4,
        title: 'Verify New Email',
        description: 'Confirm the new email address',
        action: 'Check executor\'s email and verify the change'
      },
      {
        step: 5,
        title: 'Update Phone Number',
        description: 'Add executor\'s phone for recovery',
        action: 'Go to Settings → Phone, add executor\'s phone number'
      },
      {
        step: 6,
        title: 'Enable Sign-In Notifications',
        description: 'Setup login notifications',
        action: 'Go to Settings → Privacy → Turn on login notifications'
      },
      {
        step: 7,
        title: 'Document Completion',
        description: 'Confirm handover is complete',
        action: 'Take screenshot showing account details have been updated'
      }
    ],
    amazon: [
      {
        step: 1,
        title: 'Open Amazon Login',
        description: 'Go to Amazon\'s official login page',
        action: 'Click the button to open Amazon.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email/phone and password to access account'
      },
      {
        step: 3,
        title: 'Go to Account & Lists',
        description: 'Navigate to your account settings',
        action: 'Click "Account & Lists" → "Your Account"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Update Login & Security',
        description: 'Change email to executor\'s email',
        action: `Go to "Login & security" → Change email to ${executor.executor_email}`
      },
      {
        step: 5,
        title: 'Update Payment Method',
        description: 'Add executor\'s payment method',
        action: 'Go to "Your payments" → Add new payment method under executor\'s name'
      },
      {
        step: 6,
        title: 'Update Address Book',
        description: 'Add executor\'s address as primary',
        action: 'Go to "Your addresses" → Add executor\'s address if needed'
      },
      {
        step: 7,
        title: 'Share Account Access',
        description: 'Document that account has been handed over',
        action: 'Take screenshot showing email is now executor\'s email'
      }
    ],
    spotify: [
      {
        step: 1,
        title: 'Open Spotify Login',
        description: 'Go to Spotify\'s official login page',
        action: 'Click the button to open Spotify.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email and password to access account'
      },
      {
        step: 3,
        title: 'Go to Account Settings',
        description: 'Navigate to your account settings',
        action: 'Click your profile name → "Account"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Update Email Address',
        description: 'Change email to executor\'s email',
        action: `Go to "Email address" section → Change to ${executor.executor_email}`
      },
      {
        step: 5,
        title: 'Update Password',
        description: 'Set a new password for the executor',
        action: 'Go to "Change password" → Enter new secure password'
      },
      {
        step: 6,
        title: 'Manage Subscriptions',
        description: 'Update billing information if needed',
        action: 'Go to "Premium" or "Subscription" → Update payment method to executor\'s'
      },
      {
        step: 7,
        title: 'Complete Handover',
        description: 'Confirm account transfer is complete',
        action: 'Take screenshot showing email is now executor\'s email'
      }
    ],
    'disney+': [
      {
        step: 1,
        title: 'Open Disney+ Login',
        description: 'Go to Disney+ website and login',
        action: 'Click the button to open DisneyPlus.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email and password to access account'
      },
      {
        step: 3,
        title: 'Go to Account Settings',
        description: 'Navigate to your account settings',
        action: 'Click your profile icon → "Account"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Update Email Address',
        description: 'Change email to executor\'s email',
        action: `Go to "Email" → Change email to ${executor.executor_email}`
      },
      {
        step: 5,
        title: 'Update Password',
        description: 'Set a new password for the executor',
        action: 'Go to "Change password" → Set new secure password'
      },
      {
        step: 6,
        title: 'Update Billing Information',
        description: 'Add executor\'s payment method if needed',
        action: 'Go to "Payment method" → Add executor\'s payment information'
      },
      {
        step: 7,
        title: 'Complete Handover',
        description: 'Confirm account has been handed over',
        action: 'Take screenshot showing all account info is updated to executor\'s details'
      }
    ],
    tiktok: [
      {
        step: 1,
        title: 'Open TikTok Login',
        description: 'Go to TikTok website',
        action: 'Visit TikTok.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email/phone and password'
      },
      {
        step: 3,
        title: 'Go to Settings',
        description: 'Navigate to account settings',
        action: 'Click profile icon → "Settings and privacy"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Update Email Address',
        description: 'Change email to executor\'s email',
        action: `Go to "Account" → Change email to ${executor.executor_email}`
      },
      {
        step: 5,
        title: 'Update Password',
        description: 'Set a new password for the executor',
        action: 'Go to "Password" → Set new secure password'
      },
      {
        step: 6,
        title: 'Enable Two-Factor Authentication',
        description: 'Secure the account with 2FA',
        action: 'Go to "Security" → Enable phone verification'
      },
      {
        step: 7,
        title: 'Complete Handover',
        description: 'Document the transfer is complete',
        action: 'Take screenshot showing email is now executor\'s email'
      }
    ],
    snapchat: [
      {
        step: 1,
        title: 'Open Snapchat Login',
        description: 'Go to Snapchat accounts page',
        action: 'Visit accounts.snapchat.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter username and password'
      },
      {
        step: 3,
        title: 'Go to Account Settings',
        description: 'Navigate to account management',
        action: 'Click "Account" in the menu',
        link: links.settings
      },
      {
        step: 4,
        title: 'Update Email Address',
        description: 'Change email to executor\'s email',
        action: `Go to "Email address" → Change to ${executor.executor_email}`
      },
      {
        step: 5,
        title: 'Update Phone Number',
        description: 'Change phone to executor\'s phone',
        action: 'Go to "Phone number" → Update with executor\'s number'
      },
      {
        step: 6,
        title: 'Change Password',
        description: 'Set new password for executor',
        action: 'Go to "Password" → Enter new secure password'
      },
      {
        step: 7,
        title: 'Complete Handover',
        description: 'Confirm transfer is complete',
        action: 'Take screenshot showing executor\'s contact info is now primary'
      }
    ],
    netflix: [
      {
        step: 1,
        title: 'Open Netflix Login',
        description: 'Go to Netflix website',
        action: 'Visit Netflix.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email and password'
      },
      {
        step: 3,
        title: 'Go to Account Settings',
        description: 'Navigate to account page',
        action: 'Click profile icon → "Account"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Update Email Address',
        description: 'Change email to executor\'s email',
        action: `Go to "Email address" → Change to ${executor.executor_email}`
      },
      {
        step: 5,
        title: 'Update Password',
        description: 'Set new password for executor',
        action: 'Go to "Password" → Set new secure password'
      },
      {
        step: 6,
        title: 'Update Payment Method',
        description: 'Add executor\'s payment method',
        action: 'Go to "Payment info" → Add executor\'s payment details'
      },
      {
        step: 7,
        title: 'Complete Handover',
        description: 'Confirm account transfer is complete',
        action: 'Take screenshot showing email is now executor\'s email'
      }
    ],
    hulu: [
      {
        step: 1,
        title: 'Open Hulu Login',
        description: 'Go to Hulu website',
        action: 'Visit Hulu.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email and password'
      },
      {
        step: 3,
        title: 'Go to Account Settings',
        description: 'Navigate to account settings',
        action: 'Click account icon → "Account Settings"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Update Email Address',
        description: 'Change email to executor\'s email',
        action: `Go to "Email" → Change to ${executor.executor_email}`
      },
      {
        step: 5,
        title: 'Update Password',
        description: 'Set new password for executor',
        action: 'Go to "Password" → Set new secure password'
      },
      {
        step: 6,
        title: 'Update Billing Information',
        description: 'Add executor\'s payment method',
        action: 'Go to "Billing" → Add executor\'s payment info'
      },
      {
        step: 7,
        title: 'Complete Handover',
        description: 'Confirm transfer is complete',
        action: 'Take screenshot showing email is now executor\'s email'
      }
    ],
    'google drive': [
      {
        step: 1,
        title: 'Open Google Account',
        description: 'Go to Google Account page',
        action: 'Visit accounts.google.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email and password'
      },
      {
        step: 3,
        title: 'Go to Personal info',
        description: 'Navigate to personal information settings',
        action: 'Click "Personal info" in the left menu',
        link: links.settings
      },
      {
        step: 4,
        title: 'Update Email Address',
        description: 'Change recovery email to executor\'s email',
        action: `Go to "Email" → Change recovery email to ${executor.executor_email}`
      },
      {
        step: 5,
        title: 'Update Phone Number',
        description: 'Change recovery phone to executor\'s phone',
        action: 'Go to "Phone" → Update recovery phone number'
      },
      {
        step: 6,
        title: 'Update Recovery Options',
        description: 'Ensure executor can recover account',
        action: 'Go to "Security" → Update recovery options'
      },
      {
        step: 7,
        title: 'Complete Handover',
        description: 'Confirm account transfer is complete',
        action: 'Take screenshot showing executor\'s info is now recovery contact'
      }
    ],
    dropbox: [
      {
        step: 1,
        title: 'Open Dropbox Login',
        description: 'Go to Dropbox website',
        action: 'Visit Dropbox.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email and password'
      },
      {
        step: 3,
        title: 'Go to Settings',
        description: 'Navigate to account settings',
        action: 'Click profile picture → "Settings"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Update Email Address',
        description: 'Change email to executor\'s email',
        action: `Go to "Email address" → Change to ${executor.executor_email}`
      },
      {
        step: 5,
        title: 'Update Password',
        description: 'Set new password for executor',
        action: 'Go to "Password" → Set new secure password'
      },
      {
        step: 6,
        title: 'Update Security Settings',
        description: 'Setup 2FA if available',
        action: 'Go to "Security" → Enable additional security measures'
      },
      {
        step: 7,
        title: 'Complete Handover',
        description: 'Confirm account transfer is complete',
        action: 'Take screenshot showing email is now executor\'s email'
      }
    ],
    outlook: [
      {
        step: 1,
        title: 'Open Outlook Login',
        description: 'Go to Outlook.office.com',
        action: 'Visit Outlook.office.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email and password'
      },
      {
        step: 3,
        title: 'Go to Account Settings',
        description: 'Navigate to Microsoft account',
        action: 'Click profile icon → "View account"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Update Email Address',
        description: 'Change email to executor\'s email',
        action: `Go to "Email" → Change to ${executor.executor_email}`
      },
      {
        step: 5,
        title: 'Update Password',
        description: 'Set new password for executor',
        action: 'Go to "Change password" → Set new secure password'
      },
      {
        step: 6,
        title: 'Update Security Options',
        description: 'Setup 2FA for additional security',
        action: 'Go to "Security settings" → Enable 2-step verification'
      },
      {
        step: 7,
        title: 'Complete Handover',
        description: 'Confirm account transfer is complete',
        action: 'Take screenshot showing email is now executor\'s email'
      }
    ],
    onedrive: [
      {
        step: 1,
        title: 'Open OneDrive Login',
        description: 'Go to OneDrive',
        action: 'Visit OneDrive.live.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter email and password'
      },
      {
        step: 3,
        title: 'Go to Microsoft Account',
        description: 'Navigate to account settings',
        action: 'Click profile icon → "View account"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Update Email Address',
        description: 'Change email to executor\'s email',
        action: `Go to "Email address" → Change to ${executor.executor_email}`
      },
      {
        step: 5,
        title: 'Update Password',
        description: 'Set new password for executor',
        action: 'Go to "Change password" → Set new secure password'
      },
      {
        step: 6,
        title: 'Update Security Settings',
        description: 'Enable 2FA for security',
        action: 'Go to "Security options" → Enable 2-step verification'
      },
      {
        step: 7,
        title: 'Complete Handover',
        description: 'Confirm account transfer is complete',
        action: 'Take screenshot showing executor now controls the account'
      }
    ],
    icloud: [
      {
        step: 1,
        title: 'Open iCloud Login',
        description: 'Go to iCloud website',
        action: 'Visit iCloud.com',
        link: links.login
      },
      {
        step: 2,
        title: 'Login to Your Account',
        description: `Use: ${asset.account_identifier}`,
        action: 'Enter Apple ID and password'
      },
      {
        step: 3,
        title: 'Go to Account Settings',
        description: 'Navigate to Apple ID settings',
        action: 'Click profile name → "Account Settings"',
        link: links.settings
      },
      {
        step: 4,
        title: 'Update Apple ID Email',
        description: 'Change email to executor\'s email',
        action: `Go to "Email address" → Change to ${executor.executor_email}`
      },
      {
        step: 5,
        title: 'Update Password',
        description: 'Set new password for executor',
        action: 'Go to "Password & Security" → Change password'
      },
      {
        step: 6,
        title: 'Update Trusted Phone Numbers',
        description: 'Change to executor\'s phone number',
        action: 'Go to "Phone Numbers" → Update with executor\'s number'
      },
      {
        step: 7,
        title: 'Complete Handover',
        description: 'Confirm account transfer is complete',
        action: 'Take screenshot showing Apple ID is now under executor\'s control'
      }
    ]
  };

  // Generate generic instructions for unsupported platforms
  const getGenericDeleteSteps = () => [
    {
      step: 1,
      title: `Open ${asset.platform_name} Login`,
      description: `Go to ${asset.platform_name}'s official login page`,
      action: 'Click the button to open login page',
      link: links.login
    },
    {
      step: 2,
      title: 'Login to Your Account',
      description: `Use: ${asset.account_identifier}`,
      action: 'Enter your credentials to access the account'
    },
    {
      step: 3,
      title: 'Navigate to Account Settings',
      description: `Look for Settings, Account, or Profile options`,
      action: 'Click on your profile icon or settings menu',
      link: links.settings
    },
    {
      step: 4,
      title: 'Find Account Deletion/Closure Option',
      description: 'Look for Delete Account, Close Account, or Remove Account',
      action: 'Scroll through settings to find account deletion option'
    },
    {
      step: 5,
      title: 'Review Account Information',
      description: 'Review what will happen when account is deleted',
      action: 'Read any warnings or information provided about deletion'
    },
    {
      step: 6,
      title: 'Confirm Your Identity',
      description: 'You may need to enter password or verify via email',
      action: 'Complete any verification steps requested'
    },
    {
      step: 7,
      title: 'Complete Deletion',
      description: 'Finalize the account deletion',
      action: `Click to confirm - ${asset.platform_name} account will be deleted`
    }
  ];

  const getGenericPassSteps = () => [
    {
      step: 1,
      title: `Open ${asset.platform_name} Login`,
      description: `Go to ${asset.platform_name}'s official login page`,
      action: 'Click the button to open login page',
      link: links.login
    },
    {
      step: 2,
      title: 'Login to Your Account',
      description: `Use: ${asset.account_identifier}`,
      action: 'Enter credentials to access the account'
    },
    {
      step: 3,
      title: 'Navigate to Account Settings',
      description: 'Find Settings or Account options',
      action: 'Look for profile icon or settings menu',
      link: links.settings
    },
    {
      step: 4,
      title: 'Update Account Contact Information',
      description: 'Change email/phone to executor\'s contact info',
      action: `Update email and/or phone to ${executor.executor_email}`
    },
    {
      step: 5,
      title: 'Change Password',
      description: 'Set a new password for the executor',
      action: 'Go to Security or Password settings and update password'
    },
    {
      step: 6,
      title: 'Enable Two-Factor Authentication (if available)',
      description: 'Secure the account with 2FA using executor\'s phone',
      action: 'Go to Security settings and enable 2FA'
    },
    {
      step: 7,
      title: 'Complete Handover',
      description: 'Document that account has been handed over',
      action: `Take a screenshot showing account is now controlled by executor`
    }
  ];

  // Use platform-specific instructions, fallback to generic
  const getSteps = () => {
    if (actionType === 'delete') {
      return deleteInstructions[platform] || getGenericDeleteSteps();
    } else if (actionType === 'pass') {
      return passInstructions[platform] || getGenericPassSteps();
    }
  };

  const baseInstructions = {
    overview: {
      platform: asset.platform_name,
      username_or_email: asset.account_identifier,
      registered_email: user.email,
      executor_email: executor.executor_email,
      action: actionType === 'delete' ? 'Delete Account' : actionType === 'pass' ? 'Hand Over Account' : 'Send Final Message'
    },
    links
  };

  if (actionType === 'delete' || actionType === 'pass') {
    return {
      ...baseInstructions,
      steps: getSteps()
    };
  } else if (actionType === 'last_message') {
    return {
      ...baseInstructions,
      message: asset.last_message,
      steps: [
        {
          step: 1,
          title: 'Open Official Login Page',
          description: `Go to ${asset.platform_name}'s official login page`,
          action: 'Click to open login page',
          link: links.login
        },
        {
          step: 2,
          title: 'Login to Account',
          description: `Use username/email: ${asset.account_identifier}`,
          action: 'Enter credentials to access the account'
        },
        {
          step: 3,
          title: 'Navigate to Messaging/Posts Section',
          description: `On ${asset.platform_name}, find where you can post or message`,
          action: 'Location varies by platform - look for Messages, Posts, or Timeline'
        },
        {
          step: 4,
          title: 'Copy & Paste Final Message',
          description: 'Use the message stored in your account',
          action: 'Copy the message and post/send it to your audience'
        },
        {
          step: 5,
          title: 'Verify Message Posted',
          description: 'Confirm the message is visible to others',
          action: 'Check that message appears correctly on platform'
        },
        {
          step: 6,
          title: 'Screenshot Confirmation',
          description: 'Document that message was successfully posted',
          action: 'Take a screenshot showing the posted message'
        },
        {
          step: 7,
          title: 'Task Complete',
          description: 'Final message has been posted successfully',
          action: 'Executor can now proceed with account closure if desired'
        }
      ]
    };
  }
}

module.exports = {
  getAssetInstructions
};

module.exports = {
  getAssetInstructions
};
