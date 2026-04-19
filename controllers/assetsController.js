const pool = require('../db');
const { logActivity } = require('../utils/activityLogger');

// Valid platforms mapped to categories
const PLATFORM_CATEGORIES = {
  social: ['Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'TikTok', 'Snapchat', 'Discord'],
  email: ['Gmail', 'Outlook', 'Yahoo Mail', 'ProtonMail', 'Apple Mail'],
  finance: ['PayPal', 'Amazon', 'Banking App', 'Stripe', 'Square'],
  storage: ['Google Drive', 'Dropbox', 'OneDrive', 'iCloud'],
  entertainment: ['Netflix', 'Spotify', 'Disney+', 'Hulu'],
  other: ['Other']
};

const ACTION_TYPES = ['pass', 'delete', 'last_message'];

function buildAssetResponse(asset) {
  return {
    asset_id: asset.asset_id,
    platform_name: asset.platform_name,
    category: asset.category,
    account_identifier: asset.account_identifier,
    action_type: asset.action_type,
    last_message: asset.last_message,
    created_at: asset.created_at
  };
}

function getAuthenticatedUserId(req) {
  return req.userId;
}

// Validate platform exists in categories
function getValidPlatforms() {
  return Object.values(PLATFORM_CATEGORIES).flat();
}

async function addAsset(req, res) {
  try {
    const userId = getAuthenticatedUserId(req);
    const { platform_name, category, account_identifier, account_password, action_type, last_message } = req.body;

    // Validation
    if (!platform_name || !category || !account_identifier || !account_password || !action_type) {
      return res.status(400).json({
        success: false,
        message: 'platform_name, category, account_identifier, account_password, and action_type are required'
      });
    }

    if (!ACTION_TYPES.includes(action_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid action_type. Valid values: ${ACTION_TYPES.join(', ')}`
      });
    }

    if (action_type === 'last_message' && !last_message) {
      return res.status(400).json({
        success: false,
        message: 'last_message is required when action_type is "last_message"'
      });
    }

    // Try new schema first
    let result;
    try {
      result = await pool.query(
        `INSERT INTO digital_assets (user_id, platform_name, category, account_identifier, account_password, action_type, last_message, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING asset_id, platform_name, category, account_identifier, account_password, action_type, last_message, created_at`,
        [userId, platform_name.trim(), category, account_identifier.trim(), account_password.trim(), action_type, last_message || null]
      );
    } catch (newSchemaError) {
      // Fall back to old schema if new columns don't exist
      console.warn('New schema columns not found, using old schema:', newSchemaError.message);
      result = await pool.query(
        `INSERT INTO digital_assets (user_id, asset_name, asset_type, encrypted_data, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING asset_id, asset_name, asset_type, created_at`,
        [userId, platform_name.trim(), category, JSON.stringify({ account: account_identifier, password: account_password, action: action_type, message: last_message })]
      );
      
      // Transform to new format for response
      const oldRow = result.rows[0];
      const newFormatRow = {
        asset_id: oldRow.asset_id,
        platform_name: oldRow.asset_name,
        category: oldRow.asset_type,
        account_identifier: account_identifier,
        account_password: account_password,
        action_type: action_type,
        last_message: last_message,
        created_at: oldRow.created_at
      };
      
      return res.status(201).json({
        success: true,
        message: 'Asset added successfully',
        data: buildAssetResponse(newFormatRow)
      });
    }

    const { rows } = result;
    const asset = rows[0];
    
    // Log activity
    await logActivity(
      userId,
      'asset_created',
      `Asset created: ${platform_name}`,
      'asset',
      asset.asset_id
    );
    
    return res.status(201).json({
      success: true,
      message: 'Asset added successfully',
      data: buildAssetResponse(asset)
    });
  } catch (error) {
    console.error('Add Asset Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add asset'
    });
  }
}

async function getAssets(req, res) {
  try {
    const userId = getAuthenticatedUserId(req);

    // Use COALESCE to handle both old and new schemas seamlessly
    const result = await pool.query(
      `SELECT 
        asset_id,
        COALESCE(platform_name, asset_name) as platform_name,
        COALESCE(category, asset_type) as category,
        account_identifier,
        action_type,
        last_message,
        encrypted_data,
        created_at
       FROM digital_assets
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    // Transform assets to ensure consistency, extracting account info from encrypted_data if needed
    const rows = result.rows.map(asset => {
      let accountIdentifier = asset.account_identifier;
      let actionType = asset.action_type;
      let lastMessage = asset.last_message;

      // If using old schema, parse encrypted_data to extract account info
      if (!accountIdentifier && asset.encrypted_data) {
        try {
          const decrypted = JSON.parse(asset.encrypted_data);
          accountIdentifier = decrypted.account || null;
          actionType = decrypted.action || 'pass';
          lastMessage = decrypted.message || null;
        } catch (e) {
          console.warn(`Failed to parse encrypted_data for asset ${asset.asset_id}`);
        }
      }

      return {
        asset_id: asset.asset_id,
        platform_name: asset.platform_name,
        category: asset.category,
        account_identifier: accountIdentifier,
        action_type: actionType,
        last_message: lastMessage,
        created_at: asset.created_at
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Assets retrieved successfully',
      count: rows.length,
      data: rows.map(buildAssetResponse)
    });
  } catch (error) {
    console.error('Get Assets Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve assets'
    });
  }
}

async function deleteAsset(req, res) {
  try {
    const userId = getAuthenticatedUserId(req);
    const assetId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(assetId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid asset id is required'
      });
    }

    const { rows } = await pool.query(
      `DELETE FROM digital_assets
       WHERE asset_id = $1 AND user_id = $2
       RETURNING asset_id, asset_name`,
      [assetId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const deletedAsset = rows[0];
    
    // Log activity
    await logActivity(
      userId,
      'asset_deleted',
      `Asset deleted: ${deletedAsset.asset_name || 'Unknown'}`,
      'asset',
      assetId
    );

    return res.status(200).json({
      success: true,
      message: 'Asset deleted successfully',
      data: deletedAsset
    });
  } catch (error) {
    console.error('Delete Asset Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete asset'
    });
  }
}

module.exports = {
  addAsset,
  getAssets,
  deleteAsset,
  PLATFORM_CATEGORIES,
  ACTION_TYPES,
  getValidPlatforms
};
