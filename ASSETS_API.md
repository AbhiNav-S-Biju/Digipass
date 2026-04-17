# Digital Assets Module - API Documentation

## Overview
The Digital Assets module provides secure storage and management of sensitive account credentials and digital assets. All data is encrypted using AES-256-GCM before storage and returned only in encrypted form (never decrypted to the client).

## Security Features
- **AES-256-GCM Encryption**: Military-grade authenticated encryption
- **Per-Asset Encryption**: Each asset is encrypted individually with a random IV
- **Authentication Required**: All endpoints require valid JWT token
- **No Plaintext Return**: Encrypted data is never decrypted and sent to client
- **Access Control**: Users can only access their own assets
- **Cascading Deletion**: Asset deletion enforced at database level via foreign key

## Database Schema

```sql
CREATE TABLE digital_assets (
  asset_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  asset_name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(50) NOT NULL,
  encrypted_data TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

## API Endpoints

### 1. Add Digital Asset
**POST** `/api/assets`

Add a new digital asset with encrypted data.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "asset_name": "Gmail Account",
  "asset_type": "email",
  "asset_data": {
    "username": "user@gmail.com",
    "password": "SecurePass123",
    "recovery_email": "recovery@example.com",
    "two_factor": "enabled"
  }
}
```

**Valid Asset Types:**
- `email` - Email accounts
- `bank_account` - Banking credentials
- `social_media` - Social media accounts
- `crypto` - Cryptocurrency wallets
- `password_manager` - Password manager accounts
- `legal_doc` - Legal documents (references)
- `other` - Miscellaneous assets

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Asset added successfully",
  "data": {
    "asset_id": 1,
    "asset_name": "Gmail Account",
    "asset_type": "email",
    "created_at": "2026-04-12T12:34:56.000Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Asset name, type, and data are required"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Invalid asset type. Valid types: email, bank_account, social_media, crypto, password_manager, legal_doc, other"
}
```

---

### 2. Get User's Digital Assets
**GET** `/api/assets`

Retrieve all digital assets for the authenticated user.

**Authentication:** Required (Bearer token)

**Query Parameters:** None

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Assets retrieved successfully",
  "data": [
    {
      "asset_id": 1,
      "asset_name": "Gmail Account",
      "asset_type": "email",
      "created_at": "2026-04-12T12:34:56.000Z"
    },
    {
      "asset_id": 2,
      "asset_name": "Chase Bank Account",
      "asset_type": "bank_account",
      "created_at": "2026-04-12T12:35:00.000Z"
    }
  ],
  "count": 2
}
```

**Note:** The `encrypted_data` field is **NOT** returned to the client. Only metadata is provided.

---

### 3. Delete Digital Asset
**DELETE** `/api/assets/:id`

Delete a digital asset by ID. Only the asset owner can delete their assets.

**Authentication:** Required (Bearer token)

**Parameters:**
- `id` (URL param, required) - Asset ID to delete

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Asset deleted successfully",
  "data": {
    "asset_id": 1,
    "asset_name": "Gmail Account"
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Asset not found or unauthorized"
}
```

---

## Encryption Details

### How It Works

1. **Client sends plaintext data:**
   ```javascript
   {
     "username": "user@example.com",
     "password": "MyPassword123"
   }
   ```

2. **Server encrypts using AES-256-GCM:**
   - Generates random 16-byte IV
   - Encrypts JSON data with the encryption key
   - Gets authentication tag from cipher
   - Stores as: `{encrypted, iv, authTag}` in JSON format

3. **Stored in database:**
   ```json
   {
     "encrypted": "a1b2c3d4e5f6...",
     "iv": "1a2b3c4d5e6f7g8h9i0j1k2l",
     "authTag": "7f8g9h0i1j2k3l4m5n6o7p"
   }
   ```

4. **API Response:**
   - Returns asset metadata only
   - Never returns `encrypted_data` field
   - No way for client to decrypt the data

### Encryption Key Management

The encryption key is derived from:
```javascript
const ENCRYPTION_KEY = crypto.scryptSync(
  process.env.ENCRYPTION_KEY || 'your-secret-key-change-in-production',
  'salt',
  32
);
```

**⚠️ Production Requirements:**
- Set `ENCRYPTION_KEY` environment variable to a strong, unique key
- Never share this key with clients
- Use a key management service (AWS KMS, Azure Key Vault) in production
- Rotate keys periodically

---

## Error Responses

| Status | Code | Message |
|--------|------|---------|
| 400 | BAD_REQUEST | Missing required fields |
| 400 | INVALID_TYPE | Invalid asset type |
| 401 | UNAUTHORIZED | No token provided |
| 403 | FORBIDDEN | Invalid or expired token |
| 404 | NOT_FOUND | Asset not found or unauthorized access |
| 500 | SERVER_ERROR | Internal server error |

---

## Code Structure

### Files
- `/utils/crypto.js` - Encryption/decryption utilities
- `/controllers/assetsController.js` - Business logic (add, get, delete)
- `/routes/assetsRoutes.js` - API route definitions
- `server.js` - Main Express app with route registration

### Controller Functions

```javascript
// Add Asset
addAsset(req, res)
  - Validates input
  - Encrypts asset_data
  - Stores in database
  - Returns metadata only

// Get Assets
getAssets(req, res)
  - Queries user's assets
  - Returns list without encrypted_data
  - Sorted by creation date (newest first)

// Delete Asset
deleteAsset(req, res)
  - Verifies asset ownership
  - Deletes asset
  - Returns deleted asset metadata
```

---

## Usage Examples

### cURL

**Add Asset:**
```bash
curl -X POST http://localhost:3000/api/assets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "asset_name": "Gmail Account",
    "asset_type": "email",
    "asset_data": {
      "username": "user@gmail.com",
      "password": "SecurePass123"
    }
  }'
```

**Get Assets:**
```bash
curl -X GET http://localhost:3000/api/assets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Delete Asset:**
```bash
curl -X DELETE http://localhost:3000/api/assets/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### JavaScript/Fetch

```javascript
// Add Asset
const token = localStorage.getItem('token');

const assetData = {
  asset_name: "Gmail Account",
  asset_type: "email",
  asset_data: {
    username: "user@gmail.com",
    password: "SecurePass123"
  }
};

const response = await fetch('http://localhost:3000/api/assets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(assetData)
});

const result = await response.json();
console.log(result);
```

---

## Testing

Run the automated test suite:
```bash
.\Test-Assets.ps1
```

This tests all 7 scenarios:
1. User registration
2. Add Email asset
3. Add Bank asset
4. Get all assets
5. Verify encryption (no plaintext returned)
6. Delete asset
7. Verify deleted count

---

## Next Steps

The Digital Assets module integrates with:
- **Authentication Module** - Uses JWT tokens for access control
- **Database** - PostgreSQL with foreign key to users table
- **Encryption** - Node.js crypto module with AES-256-GCM

Future modules can leverage this pattern for:
- **Executor System** - Reference assets by asset_id
- **Digital Will** - Generate PDF with asset inventory
- **Notifications** - Alert on asset modifications
