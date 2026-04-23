import { useState, useEffect, useCallback, useMemo } from 'react'
import { api } from './api'
import Dashboard   from './components/Dashboard'
import DealTable   from './components/DealTable'
import KanbanBoard from './components/KanbanBoard'
import DealModal   from './components/DealModal'
import EmailModal  from './components/EmailModal'

const TABS = [
  { id: 'dashboard', label: '📊  Dashboard' },
  { id: 'table',     label: '📋  All Deals'  },
  { id: 'kanban',    label: '🗂  Kanban'      },
]

export default function App() {
  const [tab,         setTab]         = useState('dashboard')
  const [deals,       setDeals]       = useState([])
  const [stats,       setStats]       = useState({})
  const [loading,     setLoading]     = useState(true)
  const [showModal,   setShowModal]   = useState(false)
  const [editingDeal, setEditingDeal] = useState(null)
  const [showEmail,   setShowEmail]   = useState(false)
  const [emailDeal,   setEmailDeal]   = useState(null)

  // ── Data loading ──────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const [d, s] = await Promise.all([api.getDeals(), api.getStats()])
      setDeals(d)
      setStats(s)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Actions ───────────────────────────────────────────────────────────────
  const openAdd   = ()  => { setEditingDeal(null); setShowModal(true) }
  const openEdit  = (d) => { setEditingDeal(d);    setShowModal(true) }
  const openEmail = (d) => { setEmailDeal(d);      setShowEmail(true) }
  const closeModal = () => { setShowModal(false);  setEditingDeal(null) }
  const closeEmail = () => { setShowEmail(false);  setEmailDeal(null) }

  const saveDeal = async (form) => {
    if (editingDeal) {
      await api.updateDeal(editingDeal.id, form)
    } else {
      await api.createDeal(form)
    }
    closeModal()
    load()
  }

  const deleteDeal  = async (id) => { await api.deleteDeal(id);  load() }
  const advanceDeal = async (id) => { await api.advanceDeal(id); load() }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-none">Deal Pipeline</h1>
            <p className="text-xs text-gray-400 mt-0.5">Stuart Portfolio Consultants</p>
          </div>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm active:scale-95 transition-transform"
          >
            + Add Deal
          </button>
        </div>

        {/* Tab bar */}
        <div className="max-w-screen-xl mx-auto px-6 flex gap-0.5">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                tab === id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-screen-xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading your pipeline…</p>
          </div>
        ) : (
          <>
            {tab === 'dashboard' && (
              <Dashboard deals={deals} stats={stats} onAdd={openAdd} onEdit={openEdit} onEmail={openEmail} />
            )}
            {tab === 'table' && (
              <DealTable deals={deals} onEdit={openEdit} onDelete={deleteDeal} onAdvance={advanceDeal} onEmail={openEmail} />
            )}
            {tab === 'kanban' && (
              <KanbanBoard deals={deals} onEdit={openEdit} onAdvance={advanceDeal} onEmail={openEmail} />
            )}
          </>
        )}
      </main>

      {/* ── Modals ── */}
      {showModal && (
        <DealModal deal={editingDeal} onSave={saveDeal} onClose={closeModal} />
      )}
      {showEmail && emailDeal && (
        <EmailModal deal={emailDeal} onClose={closeEmail} />
      )}

    </div>
  )
}
