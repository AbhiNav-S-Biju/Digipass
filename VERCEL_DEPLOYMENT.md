# Vercel Deployment Guide for DIGIPASS

## Overview
This guide explains how to deploy your DIGIPASS application to Vercel with both frontend and backend running on the same domain.

## Current Setup
- **Frontend**: `https://digipass-pi.vercel.app` (Vercel)
- **Backend**: Should also be deployed to Vercel
- **Database**: PostgreSQL (must be externally hosted, e.g., Heroku PostgreSQL, AWS RDS, Azure Database)

## Step-by-Step Deployment

### 1. Prepare Your Database
Your PostgreSQL database must be externally accessible (not on localhost). Options:
- **Heroku Postgres** (free tier available): https://www.heroku.com/postgres
- **AWS RDS** (free tier available): https://aws.amazon.com/rds/
- **Azure Database for PostgreSQL**: https://azure.microsoft.com/en-us/services/postgresql/
- **Railway.app** (very easy): https://railway.app/

**Once you have an external database**, note these credentials:
- `DB_HOST`: Your database host (e.g., `ec2-xxx.compute-1.amazonaws.com`)
- `DB_PORT`: Usually `5432`
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password  
- `DB_NAME`: Database name

### 2. Update Vercel Environment Variables
In your Vercel Dashboard, add these environment variables to your project:

```
NODE_ENV=production
JWT_SECRET=your-super-secret-key-change-this-in-production
CORS_ORIGIN=https://digipass-pi.vercel.app
APP_BASE_URL=https://digipass-pi.vercel.app
DB_HOST=<your-external-database-host>
DB_PORT=5432
DB_USER=<your-database-user>
DB_PASSWORD=<your-database-password>
DB_NAME=<your-database-name>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=abhinavbijusn@gmail.com
SMTP_PASS=gdij ycdr ryaa jfxh
EMAIL_FROM=abhinavbijusn@gmail.com
```

### 3. Install and Deploy with Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to your Vercel account
vercel login

# Deploy from your project directory
vercel --prod
```

### 4. Verify Deployment
After deployment, test your backend:

```bash
curl https://digipass-pi.vercel.app/api/health
```

Should return:
```json
{
  "success": true,
  "message": "DIGIPASS API Running",
  "timestamp": "2026-04-17T..."
}
```

### 5. Test from Mobile
1. Open your phone browser and go to: `https://digipass-pi.vercel.app`
2. Try logging in with a test account
3. Check that all API calls work (not showing "Network error")

## Important Notes

### Frontend Configuration
✅ **Already done**: Your frontend JavaScript files now use:
```javascript
const API_URL = window.location.origin + '/api';
```

This means:
- **Locally**: `http://localhost:3000/api`
- **On Vercel**: `https://digipass-pi.vercel.app/api`
- **On mobile**: `https://digipass-pi.vercel.app/api`

### Backend Configuration
✅ **Updated**: Your `db.js` now uses environment variables instead of hardcoded localhost.

The `vercel.json` file is configured to:
1. Use Node.js runtime
2. Route all requests to `server.js`
3. Read environment variables for configuration

### CORS Configuration
Your `server.js` CORS middleware now checks:
```javascript
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:8080,http://localhost:3000')
```

In production on Vercel, this will be set to `https://digipass-pi.vercel.app`.

## Troubleshooting

### "Network error" on mobile
- ❌ Old problem: Frontend hardcoded to `http://localhost:3000/api`
- ✅ Fixed: Now uses `window.location.origin + '/api'`
- Redeploy to Vercel to apply changes

### Database connection errors
- Check that your external database is running
- Verify all `DB_*` environment variables are set correctly in Vercel Dashboard
- Test connection locally: `node -e "const db = require('./db'); db.query('SELECT 1', (err, res) => { console.log(err ? 'Error: ' + err.message : 'Connected'); process.exit(0); })"`

### CORS errors in browser console
- Ensure `CORS_ORIGIN` environment variable includes your Vercel frontend domain
- For local development, add `http://localhost:3000` to CORS_ORIGIN

### API returns 404
- Verify all routes are properly mounted in `server.js`
- Check that static files are being served from `/frontend`
- Test health endpoint first: `curl https://your-domain/api/health`

## Local Development with Production Database

To test with your production database locally:

```bash
# Create .env with production values
DB_HOST=your.external.host
DB_USER=prod_user
DB_PASSWORD=prod_password
DB_NAME=prod_db
# ... other vars

# Start local server
npm start
```

## Next Steps

1. **Get an external PostgreSQL database** (if you don't have one)
2. **Add environment variables to Vercel Dashboard**
3. **Deploy with Vercel CLI**: `vercel --prod`
4. **Test on mobile**: Open app and try login
5. **Monitor logs**: Check Vercel dashboard for any errors

Good luck with your deployment! 🚀
