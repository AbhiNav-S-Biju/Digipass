const pool = require('../db');

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
    const { platform_name, category, account_identifier, action_type, last_message } = req.body;

    // Validation
    if (!platform_name || !category || !account_identifier || !action_type) {
      return res.status(400).json({
        success: false,
        message: 'platform_name, category, account_identifier, and action_type are required'
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

    const { rows } = await pool.query(
      `INSERT INTO digital_assets (user_id, platform_name, category, account_identifier, action_type, last_message, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING asset_id, platform_name, category, account_identifier, action_type, last_message, created_at`,
      [userId, platform_name.trim(), category, account_identifier.trim(), action_type, last_message || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Asset added successfully',
      data: buildAssetResponse(rows[0])
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

    const { rows } = await pool.query(
      `SELECT asset_id, platform_name, category, account_identifier, action_type, last_message, created_at
       FROM digital_assets
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

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

    return res.status(200).json({
      success: true,
      message: 'Asset deleted successfully',
      data: rows[0]
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
