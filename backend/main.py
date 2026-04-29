"""
Deal Pipeline — FastAPI Backend
Stuart Portfolio Consultants
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
from datetime import date
import sqlite3
import pathlib
import os

BASE_DIR = pathlib.Path(__file__).parent
# Use DATA_DIR env var (e.g. Railway Volume mount) for persistent storage; fall back to local dir
DATA_DIR = pathlib.Path(os.environ.get("DATA_DIR", BASE_DIR))
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH  = DATA_DIR / "deals.db"
STAGES   = ["Outreach", "Meeting", "Due Diligence", "Negotiation", "Closed"]

app = FastAPI(title="Deal Pipeline API", version="1.0.0")

# Allow the React dev server (port 5173) and production to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Database ─────────────────────────────────────────────────────────────────

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


# ── Models ────────────────────────────────────────────────────────────────────

class DealCreate(BaseModel):
    manager_name:         str
    investor:             str
    contact_person:       Optional[str]  = None
    contact_email:        Optional[str]  = None
    stage:                str            = "Outreach"
    strategy_type:        Optional[str]  = None
    investor_type:        Optional[str]  = None
    geography:            Optional[str]  = None
    mandate_size:         Optional[str]  = None
    introduction_type:    Optional[str]  = None
    fee_agreement_status: bool           = False
    last_activity_date:   Optional[str]  = None
    follow_up_date:       Optional[str]  = None
    notes:                Optional[str]  = None


# ── Deals API ─────────────────────────────────────────────────────────────────

@app.get("/deals")
def list_deals(stage: Optional[str] = None, search: Optional[str] = None):
    conn   = get_db()
    query  = "SELECT * FROM deals WHERE 1=1"
    params = []
    if stage:
        query += " AND stage = ?"
        params.append(stage)
    if search:
        query += " AND (manager_name LIKE ? OR investor LIKE ? OR contact_person LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
    query += " ORDER BY modified_date DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.post("/deals", status_code=201)
def create_deal(deal: DealCreate):
    conn   = get_db()
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
        deal.last_activity_date, deal.follow_up_date, deal.notes,
    ))
    conn.commit()
    new = conn.execute("SELECT * FROM deals WHERE id = ?", (cursor.lastrowid,)).fetchone()
    conn.close()
    return dict(new)


@app.get("/deals/{deal_id}")
def get_deal(deal_id: int):
    conn = get_db()
    row  = conn.execute("SELECT * FROM deals WHERE id = ?", (deal_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Deal not found")
    return dict(row)


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
        deal.last_activity_date, deal.follow_up_date, deal.notes, deal_id,
    ))
    conn.commit()
    row = conn.execute("SELECT * FROM deals WHERE id = ?", (deal_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Deal not found")
    return dict(row)


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
    row  = conn.execute("SELECT * FROM deals WHERE id = ?", (deal_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Deal not found")
    current = row["stage"]
    if current in STAGES and STAGES.index(current) < len(STAGES) - 1:
        new_stage = STAGES[STAGES.index(current) + 1]
        conn.execute(
            "UPDATE deals SET stage=?, modified_date=CURRENT_TIMESTAMP WHERE id=?",
            (new_stage, deal_id),
        )
        conn.commit()
    result = conn.execute("SELECT * FROM deals WHERE id = ?", (deal_id,)).fetchone()
    conn.close()
    return dict(result)


# ── Follow-ups & Stats ────────────────────────────────────────────────────────

@app.get("/followups/due-today")
def followups_due_today():
    today = date.today().isoformat()
    conn  = get_db()
    rows  = conn.execute(
        "SELECT * FROM deals WHERE follow_up_date <= ? AND stage != 'Closed'", (today,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.get("/stats")
def get_stats():
    conn      = get_db()
    total     = conn.execute("SELECT COUNT(*) as c FROM deals").fetchone()["c"]
    closed    = conn.execute("SELECT COUNT(*) as c FROM deals WHERE stage='Closed'").fetchone()["c"]
    today     = date.today().isoformat()
    overdue   = conn.execute(
        "SELECT COUNT(*) as c FROM deals WHERE follow_up_date < ? AND stage != 'Closed'", (today,)
    ).fetchone()["c"]
    due_today = conn.execute(
        "SELECT COUNT(*) as c FROM deals WHERE follow_up_date = ? AND stage != 'Closed'", (today,)
    ).fetchone()["c"]
    by_stage  = {s: conn.execute("SELECT COUNT(*) as c FROM deals WHERE stage=?", (s,)).fetchone()["c"] for s in STAGES}
    conn.close()
    return {
        "total":     total,
        "active":    total - closed,
        "closed":    closed,
        "overdue":   overdue,
        "due_today": due_today,
        "by_stage":  by_stage,
    }


# ── Serve built React frontend (production) ───────────────────────────────────

STATIC_DIR = BASE_DIR / "static"
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/")
    def serve_index():
        return FileResponse(STATIC_DIR / "index.html")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        # For any non-API route, serve the React app
        file_path = STATIC_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print("\n" + "="*50)
    print("  Deal Pipeline — Stuart Portfolio Consultants")
    print("="*50)
    print(f"  Running at: http://localhost:{port}")
    print("  Press Ctrl+C to stop.\n")
    uvicorn.run(app, host="0.0.0.0", port=port)
