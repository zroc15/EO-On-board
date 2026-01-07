# 🚀 EliteOps Onboarding System - Testing Guide

## ✅ Servers Are Running

**Status:** Both servers are running and healthy
- Backend API: http://localhost:3001 ✅
- Frontend App: http://localhost:3000 ✅
- Database: PostgreSQL connected ✅

---

## 🌐 How to Access the App

### Option 1: Local Browser
If you're running this locally, simply open:
**http://localhost:3000**

### Option 2: Remote Environment (Codespaces/GitPod)
If you're in a remote environment:
1. Look for a "PORTS" tab in your IDE
2. Forward port **3000** (frontend)
3. Forward port **3001** (backend)
4. Click the forwarded port URL to open the app

### Option 3: Command Line Testing
Test the API directly:
```bash
# Check backend health
curl http://localhost:3001/health

# Get all onboarding records
curl http://localhost:3001/api/onboarding

# Get all engineers
curl http://localhost:3001/api/engineers
```

---

## 📊 Sample Data Loaded

### 3 Customer Onboarding Records:
1. **Acme Corporation** - Status: Draft
2. **TechStart Industries** - Status: SA Complete (L2 complexity)
3. **Global Finance Corp** - Status: Leadership Approved (L3 complexity)

### 5 Engineers Available:
1. **John Smith** (L4) - Skills: ZIA, ZPA, Cloud
2. **Sarah Johnson** (L3) - Skills: ZIA, DLP, ZCC
3. **Mike Chen** (L3) - Skills: ZPA, Cloud, ZTB
4. **Emily Davis** (L2) - Skills: ZIA, ZPA
5. **Alex Rodriguez** (L1) - Skills: ZIA

---

## 🎯 STEP-BY-STEP TESTING GUIDE

### Test 1: View the Dashboard (2 minutes)
**What to do:**
1. Open http://localhost:3000
2. You should see a table with 3 customers
3. Notice the color-coded status badges
4. Try the "Filter by status" dropdown

**What you'll see:**
- Clean, professional interface with navigation
- Table showing customer name, status, complexity, created date
- "New Onboarding" button in top right
- Status badges in different colors (gray=Draft, blue=SA Complete, purple=Leadership Approved)

---

### Test 2: Create New Onboarding Record (3 minutes)
**What to do:**
1. Click the **"New Onboarding"** button
2. Enter a customer name: "Test Company Inc"
3. Click **"Create"**
4. You'll be redirected to the onboarding form

**What you'll see:**
- Simple form with just customer name field
- After creation, automatic redirect to full form
- 6 tabs at the top for different sections

---

### Test 3: Fill Out Stakeholders Section (5 minutes)
**What to do:**
1. Click **"View"** on "Acme Corporation"
2. You're now in the Stakeholders tab (first tab)
3. Fill in the form:
   - Solutions Architect: "Jane Doe" (required)
   - Customer Primary Name: "John Customer" (required)
   - Customer Primary Email: "john@acme.com" (required)
4. Click **"Save Stakeholders"**

**What you'll see:**
- Form with three sections: EliteOps Team, Zscaler Team, Customer Contacts
- Required fields marked with red asterisk (*)
- Success message after saving
- Fields retain values after save

---

### Test 4: Add Products in Commercial Section (5 minutes)
**What to do:**
1. Click the **"Commercial & Scope"** tab
2. Check these products:
   - ☑ ZIA Deployment
   - ☑ ZPA Deployment
   - ☑ DLP
3. Set deployment type: "Production"
4. Check **"SOW Created"** and **"SOW Approved"**
5. Click **"Save Commercial Data"**

**What you'll see:**
- Grid of product checkboxes
- Date picker for contract start
- Dropdown for POC vs Production
- SOW approval checkboxes (important for workflow!)
- Term length field for contract months

---

### Test 5: Configure Technical Environment (7 minutes)
**What to do:**
1. Click the **"Technical Environment"** tab
2. Fill in:
   - IdP: "Okta"
   - Device OS: Mac 60%, Windows 40%
3. Add a critical SaaS app:
   - Name: "Salesforce"
   - Importance: "High"
   - Click "Add"
4. Add another:
   - Name: "Office 365"
   - Importance: "High"
5. Check cloud providers: ☑ AWS, ☑ Azure
6. Click **"Save Technical Environment"**

**What you'll see:**
- Input fields for IdP, EDR, MDM
- Sliders for OS distribution percentages
- Dynamic list for adding/removing SaaS apps
- Dynamic list for internal apps
- Checkboxes for app types (web, SSH, RDP, etc.)
- Cloud provider checkboxes

---

### Test 6: Set Administrative Details (4 minutes)
**What to do:**
1. Click the **"Administrative"** tab
2. Fill in:
   - Primary Timezone: "Eastern Time"
   - Desired Go-Live Date: Pick a date 2 months from now
   - Customer Bandwidth: "Medium"
3. Add a blackout period:
   - Start: December 20, 2026
   - End: January 2, 2027
   - Reason: "Holiday freeze"
   - Click "Add"
4. Add notes: "Customer prefers morning meetings"
5. Click **"Save Administrative Details"**

**What you'll see:**
- Timezone dropdown with common zones
- Date picker for go-live
- Bandwidth dropdown (Low/Medium/High)
- Dynamic blackout period manager
- Large text area for additional notes

---

### Test 7: Set Complexity Level (3 minutes)
**What to do:**
1. Click the **"Complexity"** tab
2. Read the descriptions for each level
3. Select **"L2: Normal Deployment"** (click the radio button)
4. Click **"Save Complexity Level"**

**What you'll see:**
- 4 visual cards showing L1, L2, L3, L4
- Each card has:
  - Title and color badge
  - Description
  - Bullet points with examples
- Selected card is highlighted with blue border
- Current complexity shown at bottom

---

### Test 8: Assign an Engineer (5 minutes)
**What to do:**
1. Click the **"Engineer Assignment"** tab
2. Notice it shows "Eligible Engineers" based on L2 complexity
3. In the "Primary Engineer" dropdown, select "Emily Davis"
4. Click **"Assign"**
5. Optionally, assign a secondary engineer

**What you'll see:**
- Message if complexity not set (prompts you to set it first)
- Dropdown showing only engineers who can handle L2 or higher
- Engineer details shown: name, level, skills, current workload
- Table of eligible engineers with all their info
- Skills displayed as colored badges
- Current assignments shown at top

---

### Test 9: Test Status Transition Workflow (8 minutes)
**What to do:**
1. At the top of the form, you'll see current status: "Draft"
2. Click **"Move to SA Complete"** button
3. A confirmation dialog appears showing:
   - What status you're moving to
   - Requirements for this status
   - Optional notes field
4. Click **"Confirm Change"**
5. Status badge updates to "SA Complete"
6. Now click **"Move to Leadership Approved"**
7. Confirm again
8. Continue to **"Ready for Delivery"**

**What you'll see:**
- Status badge color changes with each transition
- Only valid next states are shown (can't skip steps)
- Confirmation dialog with requirements checklist
- At "Ready for Delivery":
  - 🔒 Record becomes LOCKED
  - Red "Locked" badge appears
  - All form fields become disabled/read-only
  - Teamwork project is auto-created (in background)

---

### Test 10: Manage Engineers (4 minutes)
**What to do:**
1. Click **"Engineers"** in the top navigation
2. You'll see the list of 5 sample engineers
3. Click **"Add Engineer"** button
4. Fill in:
   - Name: "Test Engineer"
   - Email: "test@eliteops.com"
   - Max Complexity Level: L2
   - Check skills: ☑ ZIA, ☑ ZPA
   - Timezone: Pacific Time
   - Keep "Available" checked
5. Click **"Create"**
6. New engineer appears in the table
7. Click **"Edit"** on any engineer to modify them

**What you'll see:**
- Table of all engineers with their skills and availability
- Skills shown as colored badges
- Availability shown as green/red badge
- Current workload (number of active projects)
- Form for adding/editing engineers with all fields

---

### Test 11: Filter Dashboard (2 minutes)
**What to do:**
1. Go back to **Dashboard** (click "Dashboard" in nav)
2. Use the "Filter by status" dropdown
3. Select "SA Complete"
4. Table filters to show only SA Complete records
5. Select "All" to see all records again

**What you'll see:**
- Dropdown with all status options
- Table dynamically filters
- Count updates based on filter

---

### Test 12: Test Record Locking (3 minutes)
**What to do:**
1. Create a new onboarding record or use existing
2. Fill out all sections and move it to "Ready for Delivery"
3. Try to edit any field in any tab
4. Notice all inputs are disabled

**What you'll see:**
- 🔒 Red "Locked" badge at top
- All input fields grayed out (disabled)
- Save buttons are disabled
- Status shows "Ready for Delivery" in green
- This enforces: no changes after deployment starts!

---

## 🧪 API Testing (Advanced)

### Test API Endpoints Directly

```bash
# Get all onboarding records
curl http://localhost:3001/api/onboarding | python3 -m json.tool

# Get specific record by ID (copy ID from dashboard)
curl http://localhost:3001/api/onboarding/YOUR-UUID-HERE | python3 -m json.tool

# Get all engineers
curl http://localhost:3001/api/engineers | python3 -m json.tool

# Get eligible engineers for a specific onboarding
curl http://localhost:3001/api/engineers/eligible/YOUR-ONBOARDING-UUID | python3 -m json.tool

# Create new onboarding (POST)
curl -X POST http://localhost:3001/api/onboarding \
  -H "Content-Type: application/json" \
  -d '{"customer_name": "API Test Company"}'

# Update complexity level
curl -X PUT http://localhost:3001/api/onboarding/YOUR-UUID/complexity \
  -H "Content-Type: application/json" \
  -d '{"complexity_level": "L3"}'
```

---

## ✅ What to Verify

### Functional Requirements:
- ✅ Can create new onboarding records
- ✅ All 6 form sections save independently
- ✅ Required fields are enforced (can't save without them)
- ✅ Status transitions follow the workflow
- ✅ Can't skip states (Draft → SA Complete → Leadership → Ready)
- ✅ Complexity level determines eligible engineers
- ✅ Engineer assignment filters by skill level
- ✅ Record locks at "Ready for Delivery"
- ✅ Locked records can't be edited
- ✅ Dashboard filters work
- ✅ Engineer management (add/edit) works

### Data Validation:
- ✅ Email fields require valid email format
- ✅ Date fields use date picker
- ✅ Dropdowns enforce valid options
- ✅ Percentages must add up (OS distribution)
- ✅ Required fields marked with *

### User Experience:
- ✅ Clean, professional design
- ✅ Responsive layout
- ✅ Clear status indicators with colors
- ✅ Helpful descriptions and labels
- ✅ Confirmation dialogs for status changes
- ✅ Success/error messages after actions

---

## 🐛 Known Limitations (MVP)

1. **No authentication** - This is internal tool, auth coming in Phase 2
2. **Teamwork integration** - Mock for now (needs API credentials)
3. **Salesforce sync** - Structure ready, not implemented yet
4. **No file uploads** - SOW documents linked via URL only
5. **Basic reporting** - Advanced analytics coming in Phase 2

---

## 🎯 Next Steps for You

### Immediate (Today):
1. **Test the full workflow** - Create a record, fill all tabs, move through states
2. **Add your real engineers** - Go to Engineers page, add your team
3. **Customize the products** - Edit the PRODUCT_OPTIONS list if needed
4. **Test with real data** - Create a few customer records

### Setup (This Week):
1. **Deploy to a server** - Move from localhost to a real server
2. **Set up PostgreSQL** - Production database configuration
3. **Configure Teamwork** - Add API keys in backend/.env
4. **Add your team members** - Create user accounts for your staff

### Configuration:
1. **Update .env file** - Add real Teamwork credentials
2. **Customize complexity criteria** - Adjust L1-L4 definitions if needed
3. **Add more engineers** - Build out your team roster
4. **Customize products** - Modify product list to match your offerings

### Phase 2 Planning:
1. **Auto-assignment logic** - Automatic engineer matching
2. **Salesforce bidirectional sync** - Pull deals, push status
3. **Reporting dashboard** - Metrics on cycle time, bottlenecks
4. **Email notifications** - Alert on status changes
5. **Mobile responsiveness** - Better mobile experience

---

## 🆘 Troubleshooting

### App won't load:
```bash
# Check if servers are running
ps aux | grep -E "(tsx|vite)"

# Restart servers
cd /home/user/EO-On-board
npm run dev
```

### Database errors:
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL
sudo service postgresql start
```

### Can't access on port 3000:
- Check firewall settings
- If remote environment, ensure port forwarding is set up
- Try accessing the local network IP instead of localhost

---

## 📞 Support

**Documentation:**
- Setup: `/home/user/EO-On-board/README.md`
- Database: `/home/user/EO-On-board/DATABASE_SCHEMA.md`
- This Guide: `/home/user/EO-On-board/TESTING_GUIDE.md`

**Quick Commands:**
```bash
# Start the app
npm run dev

# View logs
# Backend logs show in terminal with [0] prefix
# Frontend logs show with [1] prefix

# Stop the app
# Press Ctrl+C in the terminal where npm run dev is running
```

Enjoy testing your new customer onboarding system! 🚀
