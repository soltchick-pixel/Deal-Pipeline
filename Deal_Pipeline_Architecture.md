# Deal Pipeline Project — System Architecture
### Stuart Portfolio Consultants
**Prepared for:** Stuart Oltchick, Founder & CEO  
**Date:** April 17, 2026  
**Version:** 1.0

---

## 1. Project Overview

The Deal Pipeline is a CRM-style system purpose-built for Stuart Portfolio Consultants to track manager-investor relationships from first outreach through to a closed placement. It replaces manual tracking (spreadsheets, email, memory) with a structured, searchable, and automated workflow.

**Core goals:**
- Track every manager-investor relationship and its current pipeline stage
- Surface follow-up actions before they become overdue
- Draft and send follow-up emails directly from the system
- Provide a real-time dashboard of deal activity

---

## 2. User Roles

| Role | Description |
|------|-------------|
| Stuart (Admin) | Full access — add, edit, delete deals; send emails; view all reports |
| Future Staff | Read-only or limited edit access (to be defined) |

---

## 3. Pipeline Stages

Every deal moves through five sequential stages:

1. **Outreach** — Initial contact made; deck or teaser sent
2. **Meeting** — First or subsequent meeting scheduled or completed
3. **Due Diligence** — Investor reviewing materials; deeper engagement underway
4. **Negotiation** — Terms, fees, and structure being discussed
5. **Closed** — Placement complete; onboarding in progress

---

## 4. Data Model

### 4.1 Deal Record

Each deal represents a single manager-investor relationship and contains the following fields:

| Field | Type | Description |
|-------|------|-------------|
| Deal ID | Auto-generated | Unique identifier |
| Manager Name | Text | e.g. Apex Capital Management |
| Investor / Institution | Text | e.g. CalPERS |
| Contact Person | Text | Name of decision-maker at investor |
| Contact Email | Email | For automated follow-up drafts |
| Stage | Enum | Outreach / Meeting / Due Diligence / Negotiation / Closed |
| Strategy Type | Enum | Hedge Fund, Private Credit, Real Assets, etc. |
| Investor Type | Enum | Pension Fund, Endowment, Family Office, SWF, etc. |
| Geography | Text | e.g. California, USA |
| Mandate Size | Currency | Target allocation amount |
| Introduction Type | Enum | Referral, Conference, Cold Outreach, Existing Relationship |
| Fee Agreement Status | Boolean | Documented / Pending |
| Last Activity Date | Date | Date of most recent touchpoint |
| Follow-up Date | Date | Next scheduled follow-up |
| Notes | Long Text | Meeting notes, observations, next steps |
| Created Date | Auto | When the deal was entered |
| Modified Date | Auto | When the deal was last updated |

---

## 5. System Architecture

### 5.1 High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Web App)                   │
│  Dashboard · Table View · Stage View · Add/Edit Forms    │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS API calls
┌──────────────────────────▼──────────────────────────────┐
│                     BACKEND (API Server)                 │
│  Deal CRUD · Follow-up Engine · Email Drafting · Auth    │
└───────┬───────────────────────────────────────┬─────────┘
        │                                       │
┌───────▼────────┐                   ┌──────────▼─────────┐
│   DATABASE     │                   │   EMAIL SERVICE     │
│  (Deal Records)│                   │  Gmail / SMTP       │
└────────────────┘                   └────────────────────┘
```

### 5.2 Frontend

The user interface Stuart interacts with every day.

**Technology recommendation:** React.js (web app, works on desktop, tablet, and phone)

**Key screens:**

- **Dashboard** — Summary metrics (total, active, closed, action needed), red alert banner for overdue follow-ups, yellow action-needed panel
- **Deal Table** — Full list of all deals with filters by stage, investor type, and free-text search
- **Stage Board (Kanban)** — Visual columns for each pipeline stage
- **Add / Edit Deal Form** — All fields with dropdowns and date pickers
- **Email Drafting Panel** — AI-generated follow-up email, editable before sending

### 5.3 Backend

The server that stores data and handles business logic.

**Technology recommendation:** Node.js with Express, or Python with FastAPI

**Core API endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| /deals | GET | List all deals (with filters) |
| /deals | POST | Create a new deal |
| /deals/:id | GET | Get a single deal |
| /deals/:id | PUT | Update a deal |
| /deals/:id | DELETE | Delete a deal |
| /deals/:id/advance | POST | Move deal to next stage |
| /deals/:id/draft-email | POST | Generate follow-up email draft |
| /followups/due-today | GET | Return all deals with follow-ups due |

### 5.4 Database

Stores all deal records permanently.

**Technology recommendation:** PostgreSQL (reliable, free, industry standard)

**Hosting recommendation:** Supabase (free tier, easy setup, no IT needed)

### 5.5 Email Integration

Connected to Soltchick@stuartportfolio.com via Gmail API.

**Capabilities:**
- Draft follow-up emails using Claude AI based on deal context
- Save drafts to Gmail for Stuart to review and send
- Log sent emails back to the deal record

**Authentication:** Google OAuth 2.0 (Stuart logs in once, system remembers)

### 5.6 Follow-up Alert Engine

A scheduled background job that runs daily and checks for:

- Follow-up dates that are today or overdue → Red alert
- Deals with no activity in 7+ days → Yellow warning
- Deals stuck in a stage for more than 30 days → Stalled flag

Alerts appear on the dashboard and can optionally be emailed to Stuart each morning.

---

## 6. Integrations

| Integration | Purpose | Priority |
|-------------|---------|----------|
| Gmail (Soltchick@stuartportfolio.com) | Draft and send follow-up emails | Phase 1 |
| Claude AI API | Generate intelligent email drafts based on deal context | Phase 1 |
| Google Drive | Store PPMs, teasers, and manager documents linked to deals | Phase 2 |
| Calendar (Google Calendar) | Create follow-up reminders and meeting events | Phase 2 |
| Mobile App (iOS/Android) | Access pipeline from phone | Phase 3 |

---

## 7. Security & Access

- Login protected with username and password (or Google Sign-In)
- All data transmitted over HTTPS (encrypted)
- Database hosted in a secure cloud environment
- Gmail access via OAuth — no passwords stored in the system
- Daily automated backups of all deal data

---

## 8. Development Phases

### Phase 1 — Core System (4–6 weeks, 1 developer)
- Database setup
- Backend API
- Frontend: dashboard, table, add/edit forms
- Gmail integration for email drafting
- Claude AI email generation

### Phase 2 — Enhanced Features (3–4 weeks)
- Google Drive document linking
- Calendar integration for follow-up reminders
- Daily email digest of action-needed items
- Export deals to Excel / CSV

### Phase 3 — Mobile & Advanced (4–6 weeks)
- Mobile-optimized web app
- Push notifications for overdue follow-ups
- Reporting and analytics (deals by stage, average time to close, etc.)

---

## 9. Cost Estimate

| Item | Estimated Monthly Cost |
|------|----------------------|
| Cloud hosting (backend + database) | $20–$50/month |
| Domain name (if needed) | $1–2/month |
| Claude AI API (email drafting) | $5–20/month (usage-based) |
| Gmail API | Free |
| **Total** | **~$30–75/month** |

**Development cost (one-time):** Approximately 2–4 weeks of developer time for Phase 1.

---

## 10. Recommended Next Steps

1. Share this document with a developer (freelancer or agency)
2. Confirm Phase 1 scope and get a development quote
3. Set up a Supabase account (free) to begin database hosting
4. Connect Gmail API credentials for Soltchick@stuartportfolio.com
5. Begin Phase 1 development

---

*Document prepared with Claude AI — Stuart Portfolio Consultants, April 2026*
