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
      delete: 'https://twitter.com/logout'
    },
    gmail: {
      login: 'https://accounts.google.com/login',
      settings: 'https://myaccount.google.com/',
      delete: 'https://myaccount.google.com/deleteaccount'
    },
    linkedin: {
      login: 'https://www.linkedin.com/login',
      settings: 'https://www.linkedin.com/account/settings',
      delete: 'https://www.linkedin.com/account/settings?trk=account-settings'
    },
    discord: {
      login: 'https://discord.com/login',
      settings: 'https://discord.com/channels/@me',
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
    }
  };

  const links = platformLinks[platform] || {
    login: `https://${platform}.com/login`,
    settings: `https://${platform}.com/settings`,
    delete: `https://${platform}.com/delete`
  };

  const baseInstructions = {
    overview: {
      platform: asset.platform_name,
      username_or_email: asset.account_identifier,
      registered_email: user.email,
      action: actionType === 'delete' ? 'Delete Account' : actionType === 'pass' ? 'Pass to Executor' : 'Send Final Message'
    },
    links
  };

  if (actionType === 'delete') {
    return {
      ...baseInstructions,
      steps: [
        {
          step: 1,
          title: 'Open Official Login Page',
          description: `Go to ${asset.platform_name}'s official login page`,
          action: `Click to open login page`,
          link: links.login
        },
        {
          step: 2,
          title: 'Enter Account Credentials',
          description: `Use the username/email: ${asset.account_identifier}`,
          action: 'If you have the password, enter it. Otherwise, click "Forgot Password"'
        },
        {
          step: 3,
          title: 'Password Recovery (if needed)',
          description: 'If you don\'t have the password, use the "Forgot Password" option',
          action: `Check the registered email (${user.email}) for password reset link`
        },
        {
          step: 4,
          title: 'Navigate to Account Settings',
          description: `Once logged in, go to Settings or Account Settings`,
          action: `Click on your profile → Settings → Account or Security settings`,
          link: links.settings
        },
        {
          step: 5,
          title: 'Find Delete Account Option',
          description: `Look for "Delete Account", "Deactivate", or "Close Account" option`,
          action: 'This is usually near the bottom of the Account Settings page'
        },
        {
          step: 6,
          title: 'Confirm Deletion',
          description: 'The platform will ask for confirmation and may require password re-entry',
          action: 'Follow all prompts and confirm the deletion'
        },
        {
          step: 7,
          title: 'Document Completion',
          description: 'Take a screenshot showing the confirmation message',
          action: 'Save as proof that the account has been deleted'
        }
      ],
      checklist: [
        'Accessed login page',
        'Entered credentials',
        'Navigated to account settings',
        'Located delete option',
        'Confirmed deletion',
        'Documented completion'
      ]
    };
  } else if (actionType === 'pass') {
    return {
      ...baseInstructions,
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
          action: 'If password is unknown, use the "Forgot Password" option'
        },
        {
          step: 3,
          title: 'Generate Temporary Password',
          description: 'Use the tool below to generate a secure temporary password',
          action: 'Click "Generate Password" and copy it securely'
        },
        {
          step: 4,
          title: 'Set Your Own Secure Password',
          description: 'Change the password to one you will remember',
          action: 'Go to Settings → Security → Change Password, and set a new password',
          link: links.settings
        },
        {
          step: 5,
          title: 'Enable Two-Factor Authentication',
          description: 'Add your phone number or authenticator app to secure the account',
          action: 'Go to Settings → Security → Enable 2FA'
        },
        {
          step: 6,
          title: 'Update Recovery Email',
          description: 'Change recovery email to yours for future access',
          action: `Update recovery email to: ${executor.executor_email}`
        },
        {
          step: 7,
          title: 'Remove Old Devices',
          description: 'Remove any old/unknown devices that have access',
          action: 'Go to Settings → Active Sessions/Devices, and logout other sessions'
        },
        {
          step: 8,
          title: 'Store Credentials Securely',
          description: 'Save the new password in a secure password manager',
          action: 'Consider using a password manager like Bitwarden, 1Password, or similar'
        },
        {
          step: 9,
          title: 'Document Handover',
          description: 'Record completion and any important notes',
          action: 'Take final screenshot showing account is accessible'
        }
      ],
      checklist: [
        'Accessed login page',
        'Logged into account',
        'Set secure password',
        'Enabled 2FA',
        'Updated recovery email',
        'Removed old devices',
        'Stored credentials securely',
        'Documented handover'
      ]
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
          title: 'Navigate to Messaging/Posts',
          description: 'Go to the appropriate section to share the message',
          action: 'For social media: go to Messages or create a new Post. For email: compose a new message.',
          link: links.settings
        },
        {
          step: 4,
          title: 'Copy the Final Message',
          description: 'Use the pre-filled message below',
          action: 'Copy the message text to your clipboard'
        },
        {
          step: 5,
          title: 'Send/Post the Message',
          description: 'Post or send to appropriate recipients',
          action: 'For social media: post publicly or send DM. For email: send to contacts as needed.'
        },
        {
          step: 6,
          title: 'Verify Delivery',
          description: 'Confirm the message was successfully sent/posted',
          action: 'Check that message appears in sent/posts section'
        },
        {
          step: 7,
          title: 'Logout',
          description: 'Sign out of the account',
          action: 'Click Logout or Sign Out button'
        }
      ],
      checklist: [
        'Accessed login page',
        'Logged into account',
        'Navigated to messaging',
        'Sent final message',
        'Verified delivery',
        'Logged out'
      ]
    };
  }

  return baseInstructions;
}

module.exports = {
  getAssetInstructions
};
