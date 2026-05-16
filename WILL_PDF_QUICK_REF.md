# Digital Will PDF Generation - Quick Reference

## Quick Start (5 minutes)

### 1. Install Python Dependencies
```bash
pip install reportlab
```

### 2. Verify Files Are in Place
```bash
# Check project root
ls -la generate-will.py

# Check backend routes
ls -la backend/src/routes/willRoutes.js
ls -la backend/src/utils/willQueries.js
```

### 3. Start Backend
```bash
cd backend
npm run dev
```

### 4. Test Endpoint
```bash
# Option A: Download as PDF
curl http://localhost:5000/api/will/download/1 --output will.pdf

# Option B: Preview JSON data
curl http://localhost:5000/api/will/preview/1
```

---

## File Structure

```
Digipass/
├── generate-will.py                    ← Python PDF generator
├── WILL_PDF_SETUP.md                   ← Full documentation
├── WILL_PDF_QUICK_REF.md               ← This file
├── backend/
│   ├── src/
│   │   ├── server.js                   ← Updated with will routes
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── willRoutes.js           ← NEW: PDF generation routes
│   │   └── utils/
│   │       └── willQueries.js          ← NEW: Database queries
│   ├── config/
│   │   └── database.js
│   └── package.json
└── frontend/
    └── (dashboard, etc.)
```

---

## API Endpoints

### Download PDF
```
GET /api/will/download/:userId

Response: PDF file (application/pdf)
Filename: Digital_Will_{userId}_{YYYYMMDD}.pdf
```

**JavaScript Example**:
```javascript
async function downloadWill(userId) {
  const response = await fetch(`/api/will/download/${userId}`);
  const blob = await response.blob();
  
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `will_${userId}.pdf`;
  a.click();
}
```

### Preview Data
```
GET /api/will/preview/:userId

Response: JSON with user, assets, executors, emergency_contacts
```

---

## PDF Contents

**Page 1**:
- Header with DIGIPASS vault icon and branding
- Article I: Testator Identification (name, email, ID, registration date)
- Article II: Schedule of Digital Assets (name, category, description, action)
- Article III: Appointment of Executors (name, email, relationship, status)

**Page 2**:
- Execution Statement (witness declaration)
- Testator Signature Section
- Attestation of Witnesses (2 witnesses)
- Notarial Acknowledgement with DIGIPASS seal
- Final certification

---

## Color Palette

```
Primary:     #1b3a2d (Forest)
Secondary:   #8cbf9c (Sage)
Background:  #f5ead8 (Cream)
Cards:       #fdf6ec (Cream Light)
Text Dark:   #1a2e22
Text Light:  #8a9e90
Status OK:   #3d7a5a (Green)
Status Warn: #7a5a00 (Amber)
```

---

## Database Tables Required

```sql
users (id, full_name, email, created_at)
digital_assets (id, user_id, name, category, description, preferred_action, final_message, created_at)
executors (id, user_id, full_name, email, relationship, verification_status, access_granted, created_at)
emergency_contacts (id, user_id, name, role, email, phone_number, created_at)
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "python not found" | Install Python 3.8+, add to PATH |
| "reportlab not found" | Run `pip install reportlab` |
| Empty/corrupted PDF | Check Python script receiving valid JSON |
| Timeout on large estates | Increase timeout in willRoutes.js |
| 404 on /api/will/download | Verify willRoutes.js is mounted in server.js |

---

## Environment Variables

Add to backend `.env`:
```
DB_HOST=your-neon-host
DB_PORT=5432
DB_NAME=digipass
DB_USER=postgres
DB_PASSWORD=****
PORT=5000
CORS_ORIGIN=http://localhost:3000,https://your-frontend.vercel.app
```

---

## Performance

- PDF generation: ~1-2 seconds per will
- Max assets per page: ~6-8 cards
- Max executors per page: ~3-4 cards
- Typical PDF size: 200-400 KB

---

## Next Integration

After basic setup works:

1. Add "Download Will" button to user dashboard
2. Add to will preview/verification page
3. Email PDF to user or estate attorney
4. Archive generated PDFs for user reference
5. Track generation history in database

---

## Support Files

- `WORKFLOW_SYSTEM_PROMPT.md` - Workflow/instructions system documentation
- `WILL_PDF_SETUP.md` - Detailed setup guide
- `WILL_PDF_QUICK_REF.md` - This file

---

**Last Updated**: May 16, 2026  
**Python Version**: 3.8+  
**ReportLab Version**: 4.0+
