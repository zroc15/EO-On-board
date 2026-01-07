# EliteOps Customer Onboarding System

**Internal handoff and readiness gate system for seamless customer onboarding.**

## What This System Does

This application sits between **Salesforce** (sales CRM) and **Teamwork** (project management) to:

- Aggregate required onboarding data
- Force accountability with readiness gates
- Score deployment complexity (L1-L4)
- Assign delivery ownership to engineers
- Push finalized data into Teamwork

**Key Principle:** Sales cannot mark a deal "ready" unless onboarding is complete, SOW is approved, and an engineer is assigned.

## Architecture

```
Lead Closed-Won (Salesforce)
        ↓
Onboarding Intake App (This System)
        ↓
Readiness Gate + Complexity Scoring
        ↓
Engineer Assignment
        ↓
Project Created in Teamwork
```

## Readiness Gate States

1. **Draft** - Sales/SA filling data
2. **SA Complete** - SA signs off technically
3. **Leadership Approved** - Scope & resourcing approved
4. **Ready for Delivery** - Locked record, Teamwork project auto-created
5. **In Deployment** - Active deployment
6. **Completed** - Deployment finished

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL database
- REST API

### Frontend
- React + TypeScript
- Tailwind CSS
- React Router

### Integrations
- Salesforce (pull accounts, opportunities, products)
- Teamwork (auto-create projects, sync status)

## Project Structure

```
├── backend/          # Node.js API server
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── models/   # Data models
│   │   ├── services/ # Business logic
│   │   └── db/       # Database setup & migrations
│   └── package.json
├── frontend/         # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── DATABASE_SCHEMA.md
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# Run database migrations
npm run db:migrate

# Start development servers (backend + frontend)
npm run dev
```

The backend API runs on http://localhost:3001
The frontend app runs on http://localhost:3000

## MVP Features (Phase 1)

- ✅ Intake form with all required sections
- ✅ Readiness gate state machine
- ✅ L1-L4 complexity scoring (manual selection)
- ✅ Manual engineer assignment
- ✅ Teamwork project creation
- ✅ Field locking after "Ready for Delivery"

## Future Enhancements (Phase 2)

- Auto-assignment based on skills and availability
- Salesforce bidirectional sync
- Reporting (cycle time, delays, sales gaps)
- Email notifications
- Mobile-responsive design improvements

## Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for complete schema documentation.

## Contributing

This is an internal EliteOps tool. For questions or issues, contact the Engineering team.
