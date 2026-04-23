from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import date
import sqlite3
import pathlib

BASE_DIR = pathlib.Path(__file__).parent
DB_PATH = BASE_DIR / "deals.db"
STAGES = ["Outreach", "Meeting", "Due Diligence", "Negotiation", "Closed"]

app = FastAPI(title="Deal Pipeline API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Database setup ──────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS deals (
            id                   INTEGER PRIMARY KEY AUTOINCREMENT,
            manager_name         TEXT    NOT NULL,
            investor             TEXT    NOT NULL,
            contact_person       TEXT,
            contact_email        TEXT,
            stage                TEXT    DEFAULT 'Outreach',
            strategy_type        TEXT,
            investor_type        TEXT,
            geography            TEXT,
            mandate_size         TEXT,
            introduction_type    TEXT,
            fee_agreement_status INTEGER DEFAULT 0,
            last_activity_date   TEXT,
            follow_up_date       TEXT,
            notes                TEXT,
            created_date         TEXT    DEFAULT CURRENT_TIMESTAMP,
            modified_date        TEXT    DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


init_db()


# ── Pydantic models ─────────────────────────────────────────────────────────

class DealCreate(BaseModel):
    manager_name: str
    investor: str
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    stage: str = "Outreach"
    strategy_type: Optional[str] = None
    investor_type: Optional[str] = None
    geography: Optional[str] = None
    mandate_size: Optional[str] = None
    introduction_type: Optional[str] = None
    fee_agreement_status: bool = False
    last_activity_date: Optional[str] = None
    follow_up_date: Optional[str] = None
    notes: Optional[str] = None


# ── Frontend ────────────────────────────────────────────────────────────────

@app.get("/")
def serve_frontend():
    return FileResponse(BASE_DIR / "index.html")


# ── Deals API ───────────────────────────────────────────────────────────────

@app.get("/deals")
def get_deals(stage: Optional[str] = None, search: Optional[str] = None):
    conn = get_db()
    query = "SELECT * FROM deals WHERE 1=1"
    params = []
    if stage:
        query += " AND stage = ?"
        params.append(stage)
    if search:
        query += " AND (manager_name LIKE ? OR investor LIKE ? OR contact_person LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
    query += " ORDER BY modified_date DESC"
    deals = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(d) for d in deals]


@app.post("/deals")
def create_deal(deal: DealCreate):
    conn = get_db()
    cursor = conn.execute("""
        INSERT INTO deals (
            manager_name, investor, contact_person, contact_email, stage,
            strategy_type, investor_type, geography, mandate_size, introduction_type,
            fee_agreement_status, last_activity_date, follow_up_date, notes
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
        deal.manager_name, deal.investor, deal.contact_person, deal.contact_email,
        deal.stage, deal.strategy_type, deal.investor_type, deal.geography,
        deal.mandate_size, deal.introduction_type, int(deal.fee_agreement_status),
        deal.last_activity_date, deal.follow_up_date, deal.notes
    ))
    conn.commit()
    new_id = cursor.lastrowid
    result = conn.execute("SELECT * FROM deals WHERE id = ?", (new_id,)).fetchone()
    conn.close()
    return dict(result)


@app.get("/deals/{deal_id}")
def get_deal(deal_id: int):
    conn = get_db()
    deal = conn.execute("SELECT * FROM deals WHERE id = ?", (deal_id,)).fetchone()
    conn.close()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return dict(deal)


@app.put("/deals/{deal_id}")
def update_deal(deal_id: int, deal: DealCreate):
    conn = get_db()
    conn.execute("""
        UPDATE deals SET
            manager_name=?, investor=?, contact_person=?, contact_email=?,
            stage=?, strategy_type=?, investor_type=?, geography=?, mandate_size=?,
            introduction_type=?, fee_agreement_status=?, last_activity_date=?,
            follow_up_date=?, notes=?, modified_date=CURRENT_TIMESTAMP
        WHERE id=?
    """, (
        deal.manager_name, deal.investor, deal.contact_person, deal.contact_email,
        deal.stage, deal.strategy_type, deal.investor_type, deal.geography,
        deal.mandate_size, deal.introduction_type, int(deal.fee_agreement_status),
        deal.last_activity_date, deal.follow_up_date, deal.notes, deal_id
    ))
    conn.commit()
    result = conn.execute("SELECT * FROM deals WHERE id = ?", (deal_id,)).fetchone()
    conn.close()
    if not result:
        raise HTTPException(status_code=404, detail="Deal not found")
    return dict(result)


@app.delete("/deals/{deal_id}")
def delete_deal(deal_id: int):
    conn = get_db()
    conn.execute("DELETE FROM deals WHERE id = ?", (deal_id,))
    conn.commit()
    conn.close()
    return {"message": "Deleted"}


@app.post("/deals/{deal_id}/advance")
def advance_deal(deal_id: int):
    conn = get_db()
    deal = conn.execute("SELECT * FROM deals WHERE id = ?", (deal_id,)).fetchone()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    current = deal["stage"]
    if current in STAGES and STAGES.index(current) < len(STAGES) - 1:
        new_stage = STAGES[STAGES.index(current) + 1]
        conn.execute(
            "UPDATE deals SET stage=?, modified_date=CURRENT_TIMESTAMP WHERE id=?",
            (new_stage, deal_id)
        )
        conn.commit()
    result = conn.execute("SELECT * FROM deals WHERE id = ?", (deal_id,)).fetchone()
    conn.close()
    return dict(result)


# ── Follow-ups & Stats ──────────────────────────────────────────────────────

@app.get("/followups/due-today")
def followups_due():
    today = date.today().isoformat()
    conn = get_db()
    deals = conn.execute(
        "SELECT * FROM deals WHERE follow_up_date <= ? AND stage != 'Closed'",
        (today,)
    ).fetchall()
    conn.close()
    return [dict(d) for d in deals]


@app.get("/stats")
def get_stats():
    conn = get_db()
    total  = conn.execute("SELECT COUNT(*) as c FROM deals").fetchone()["c"]
    closed = conn.execute("SELECT COUNT(*) as c FROM deals WHERE stage='Closed'").fetchone()["c"]
    today  = date.today().isoformat()
    overdue = conn.execute(
        "SELECT COUNT(*) as c FROM deals WHERE follow_up_date < ? AND stage != 'Closed'",
        (today,)
    ).fetchone()["c"]
    due_today = conn.execute(
        "SELECT COUNT(*) as c FROM deals WHERE follow_up_date = ? AND stage != 'Closed'",
        (today,)
    ).fetchone()["c"]
    by_stage = {}
    for s in STAGES:
        by_stage[s] = conn.execute(
            "SELECT COUNT(*) as c FROM deals WHERE stage=?", (s,)
        ).fetchone()["c"]
    conn.close()
    return {
        "total":     total,
        "active":    total - closed,
        "closed":    closed,
        "overdue":   overdue,
        "due_today": due_today,
        "by_stage":  by_stage,
    }


# ── Entrypoint ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*50)
    print("  Deal Pipeline — Stuart Portfolio Consultants")
    print("="*50)
    print("\n  App is running!")
    print("  Open your browser and go to:")
    print("  ➜  http://localhost:8000\n")
    print("  Press Ctrl+C to stop.\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
