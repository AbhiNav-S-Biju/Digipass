const pool = require('../db');
const { encryptData } = require('../utils/crypto');

const VALID_ASSET_TYPES = [
  'email',
  'bank_account',
  'social_media',
  'crypto',
  'password_manager',
  'legal_doc',
  'other'
];

function buildAssetResponse(asset) {
  return {
    asset_id: asset.asset_id,
    asset_name: asset.asset_name,
    asset_type: asset.asset_type,
    created_at: asset.created_at
  };
}

function getAuthenticatedUserId(req) {
  return req.userId;
}

async function addAsset(req, res) {
  try {
    const userId = getAuthenticatedUserId(req);
    const { asset_name, asset_type, asset_data } = req.body;

    if (!asset_name || !asset_type || asset_data === undefined) {
      return res.status(400).json({
        success: false,
        message: 'asset_name, asset_type, and asset_data are required'
      });
    }

    if (!VALID_ASSET_TYPES.includes(asset_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid asset_type. Valid values: ${VALID_ASSET_TYPES.join(', ')}`
      });
    }

    const encrypted_data = JSON.stringify(encryptData(asset_data));

    const { rows } = await pool.query(
      `INSERT INTO digital_assets (user_id, asset_name, asset_type, encrypted_data, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING asset_id, asset_name, asset_type, created_at`,
      [userId, asset_name.trim(), asset_type, encrypted_data]
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
      `SELECT asset_id, asset_name, asset_type, created_at
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
  VALID_ASSET_TYPES
};
