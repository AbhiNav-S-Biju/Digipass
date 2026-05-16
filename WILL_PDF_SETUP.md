# Digital Will PDF Generation Setup Guide

## Overview

This setup integrates a professional PDF generation system for Digital Wills in DIGIPASS. The system uses:

- **Backend**: Node.js/Express (calls Python as subprocess)
- **PDF Generation**: Python with ReportLab library
- **Database**: PostgreSQL (Neon)
- **Output**: Professional 2-page Digital Will & Estate Declaration PDF

---

## Installation Steps

### 1. Install Python 3.8+ on Your System

**Windows**:
```bash
# Download from https://www.python.org/downloads/
# Or use Chocolatey:
choco install python
```

**macOS**:
```bash
# Using Homebrew:
brew install python3
```

**Linux**:
```bash
sudo apt-get install python3 python3-pip
```

### 2. Install ReportLab Python Library

```bash
pip install reportlab
```

Or specify the version:
```bash
pip install reportlab==4.0.9
```

Verify installation:
```bash
python -c "import reportlab; print(reportlab.__version__)"
```

### 3. Move Python Script to Project Root

The `generate-will.py` script should be in the project root directory:
```
Digipass/
├── generate-will.py          ← Place here
├── backend/
├── frontend/
└── ...
```

### 4. Update Node.js Backend

The following files have been created/modified:

**New Files**:
- `backend/src/routes/willRoutes.js` - Express routes for PDF generation
- `backend/src/utils/willQueries.js` - Database query functions

**Modified Files**:
- `backend/src/server.js` - Added will routes

The routes are automatically mounted at `/api/will/*`

### 5. Verify Database Schema

Ensure your PostgreSQL database has the required tables:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Digital Assets table
CREATE TABLE digital_assets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255),
  category VARCHAR(50),
  description TEXT,
  preferred_action VARCHAR(50),
  final_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Executors table
CREATE TABLE executors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone_number VARCHAR(20),
  relationship VARCHAR(100),
  verification_status VARCHAR(50) DEFAULT 'Pending',
  access_granted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emergency Contacts table
CREATE TABLE emergency_contacts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255),
  role VARCHAR(100),
  email VARCHAR(255),
  phone_number VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Will Generation History table
CREATE TABLE will_generations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_path VARCHAR(500),
  status VARCHAR(50) DEFAULT 'completed'
);
```

---

## API Endpoints

### 1. Generate and Download PDF

**Request**:
```
GET /api/will/download/:userId
```

**Response**:
- Content-Type: `application/pdf`
- File downloaded as: `Digital_Will_{userId}_{YYYYMMDD}.pdf`

**Example**:
```bash
curl http://localhost:5000/api/will/download/123 --output will.pdf
```

**Frontend JavaScript**:
```javascript
async function downloadDigitalWill(userId) {
  try {
    const response = await fetch(`/api/will/download/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Digital_Will_${userId}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  } catch (error) {
    console.error('Error downloading will:', error);
  }
}
```

### 2. Preview Will Data (Without Generating PDF)

**Request**:
```
GET /api/will/preview/:userId
```

**Response** (JSON):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "full_name": "John Doe",
      "email": "john@example.com",
      "created_at": "2026-01-15T10:30:00Z"
    },
    "assets": [
      {
        "id": 1,
        "name": "Instagram Account",
        "category": "social",
        "description": "Personal Instagram",
        "preferred_action": "delete",
        "final_message": "Thanks everyone!",
        "created_at": "2026-01-15T10:30:00Z"
      }
    ],
    "executors": [
      {
        "id": 1,
        "full_name": "Jane Smith",
        "email": "jane@example.com",
        "relationship": "Sister",
        "verification_status": "Verified",
        "access_granted": true
      }
    ],
    "emergency_contacts": [
      {
        "name": "Lawyer",
        "role": "Attorney",
        "email": "lawyer@example.com",
        "phone_number": "+1234567890"
      }
    ]
  }
}
```

---

## Troubleshooting

### Issue: "Python executable not found"

**Solution**:
```bash
# Windows: Add Python to PATH
# Or explicitly set in willRoutes.js:
const pythonExecutable = 'python';  // or 'python3' on Linux/Mac
const pythonProcess = spawn(pythonExecutable, [path.join(__dirname, '../../generate-will.py')]);
```

### Issue: "ModuleNotFoundError: No module named 'reportlab'"

**Solution**:
```bash
pip install reportlab
# Or for Python 3 specifically:
pip3 install reportlab
```

### Issue: PDF is corrupted or empty

**Check**:
1. Is Python script receiving data? Add debug output:
```python
# In generate-will.py, before: data = json.loads(sys.stdin.read())
import sys
data_str = sys.stdin.read()
sys.stderr.write(f"Received: {len(data_str)} bytes\n")
data = json.loads(data_str)
```

2. Check Node.js error output:
```javascript
pythonProcess.stderr.on('data', (data) => {
  console.error('Python stderr:', data.toString());
});
```

### Issue: Large assets list causes timeout

**Solution**: Add timeout handling in willRoutes.js:
```javascript
pythonProcess.on('error', (error) => {
  return res.status(500).json({
    success: false,
    message: 'PDF generation failed',
    error: error.message
  });
});

// Set timeout (30 seconds)
const timeout = setTimeout(() => {
  pythonProcess.kill();
  return res.status(504).json({
    success: false,
    message: 'PDF generation timeout'
  });
}, 30000);
```

---

## Testing

### 1. Test Python Script Directly

```bash
# Create test data file
cat > test-data.json << 'EOF'
{
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "created_at": "January 15, 2026"
  },
  "assets": [
    {
      "name": "Instagram",
      "category": "social",
      "description": "Personal account",
      "preferred_action": "delete",
      "created_at": "January 15, 2026"
    }
  ],
  "executors": [
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "relationship": "Sister",
      "status": "Verified",
      "access_granted": true,
      "created_at": "January 15, 2026"
    }
  ],
  "emergency_contacts": []
}
EOF

# Run Python script
python generate-will.py < test-data.json > test-output.pdf

# Check if PDF was created
file test-output.pdf
```

### 2. Test API Endpoint

```bash
# Start backend server
cd backend
npm run dev

# In another terminal
curl http://localhost:5000/api/will/download/1 --output will.pdf
```

### 3. Full Integration Test

```bash
# 1. Create test user in database
psql -h your-neon-host -d digipass -c "
  INSERT INTO users (full_name, email) VALUES ('Test User', 'test@example.com');
"

# 2. Create some assets and executors
# 3. Call API endpoint to download PDF

curl http://localhost:5000/api/will/download/1 --output test-will.pdf
open test-will.pdf  # macOS
# or
start test-will.pdf  # Windows
```

---

## Frontend Integration

### Add "Download Will" Button to Dashboard

```html
<button onclick="downloadWill()" class="btn btn-primary">
  <i class="fas fa-download"></i> Download Digital Will
</button>

<script>
async function downloadWill() {
  const userId = getCurrentUserId(); // Get from session/auth
  
  try {
    const response = await fetch(`/api/will/download/${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      alert(`Error: ${error.message}`);
      return;
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Digital_Will_${userId}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    
    // Optional: Show success message
    showToast('Will downloaded successfully!', 'success');
  } catch (error) {
    console.error('Download failed:', error);
    showToast('Failed to download will. Please try again.', 'error');
  }
}
</script>
```

---

## Production Deployment

### 1. Render.com (Backend)

Ensure `.env` includes:
```
DB_HOST=your-neon-host
DB_PORT=5432
DB_NAME=digipass
DB_USER=your-user
DB_PASSWORD=your-password
PORT=5000
```

### 2. Add Python to Build Command

In `render.yaml` or Render dashboard:
```yaml
buildCommand: |
  npm install
  pip install reportlab
```

Or in `package.json` postinstall script:
```json
{
  "scripts": {
    "postinstall": "pip install reportlab || pip3 install reportlab"
  }
}
```

### 3. Vercel (Frontend)

Add environment variable:
```
REACT_APP_API_URL=https://your-render-backend.onrender.com
```

Update API calls to use full URL:
```javascript
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const response = await fetch(`${apiUrl}/api/will/download/${userId}`);
```

---

## Performance Optimization

### 1. Cache Generated PDFs

Modify `willRoutes.js` to save PDFs:
```javascript
const fs = require('fs').promises;
const pdfDir = path.join(__dirname, '../../generated-wills');

// After PDF generation:
await fs.mkdir(pdfDir, { recursive: true });
const filename = `Digital_Will_${userId}_${new Date().toISOString().split('T')[0]}.pdf`;
const filepath = path.join(pdfDir, filename);
await fs.writeFile(filepath, pdfBuffer);

// Serve from cache if available
const cachedPdf = path.join(pdfDir, filename);
if (fs.existsSync(cachedPdf)) {
  return res.sendFile(cachedPdf);
}
```

### 2. Async Queue for Large Batches

Use Bull or similar for bulk PDF generation:
```javascript
const Bull = require('bull');
const pdfQueue = new Bull('pdf-generation', process.env.REDIS_URL);

pdfQueue.process(async (job) => {
  return await generatePDF(job.data);
});
```

---

## Security Considerations

1. **Passwords Never in PDF**: Credentials are intentionally excluded
2. **Verify Ownership**: Check user owns the will they're downloading
3. **Rate Limiting**: Add rate limit to PDF endpoint
4. **Logging**: Log PDF generation for audit trail
5. **Encryption**: PDFs can be encrypted (ReportLab supports this)

Example rate limiting:
```javascript
const rateLimit = require('express-rate-limit');

const willLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: 'Too many PDF generation requests'
});

router.get('/download/:userId', willLimiter, async (req, res) => {
  // ... rest of code
});
```

---

## Support & Maintenance

### Database Backup

Regular backups of user data (Neon handles this automatically)

### Python Version Management

Keep ReportLab updated:
```bash
pip install --upgrade reportlab
```

### Monitor Performance

Track PDF generation times in logs:
```javascript
const startTime = Date.now();
pythonProcess.on('close', () => {
  const duration = Date.now() - startTime;
  console.log(`PDF generated in ${duration}ms`);
});
```

---

## Next Steps

1. ✅ Install Python and ReportLab
2. ✅ Place `generate-will.py` in project root
3. ✅ Update backend server.js with will routes
4. ✅ Verify database schema
5. ✅ Test API endpoints
6. ✅ Add frontend download button
7. ✅ Deploy to Render + Vercel

**Questions?** Check troubleshooting section above or review the API documentation.
