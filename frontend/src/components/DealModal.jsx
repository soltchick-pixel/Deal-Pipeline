import { useState } from 'react'
import { STAGES, STRATEGIES, INV_TYPES, INTRO_TYPES, BLANK_DEAL } from '../constants'

export default function DealModal({ deal, onSave, onClose }) {
  const [f,   setF]   = useState(deal ? { ...BLANK_DEAL, ...deal } : { ...BLANK_DEAL })
  const [err, setErr] = useState('')

  const set = (e) => {
    const { name, value, type, checked } = e.target
    setF(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (name === 'manager_name' || name === 'investor') setErr('')
  }

  const handleSave = () => {
    if (!f.manager_name.trim() && !f.investor.trim()) {
      setErr('Please enter both a Manager Name and an Investor before saving.')
      return
    }
    if (!f.manager_name.trim()) { setErr('Manager Name is required.'); return }
    if (!f.investor.trim())     { setErr('Investor / Institution is required.'); return }
    try {
      onSave(f)
    } catch (e) {
      setErr('Something went wrong. Please try again.')
      console.error(e)
    }
  }

  const base = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
  const inp  = (name) => `${base} ${['manager_name','investor'].includes(name) && err && !f[name]?.trim() ? 'border-red-400' : 'border-gray-200'}`
  const lbl  = 'block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">
            {deal ? 'Edit Deal' : '+ Add New Deal'}
          </h2>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 text-xl leading-none">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Validation error banner */}
          {err && (
            <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3 font-medium">
              ⚠️ {err}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Manager Name *</label>
              <input className={inp('manager_name')} name="manager_name" value={f.manager_name} onChange={set} placeholder="e.g. Apex Capital Management" />
            </div>
            <div>
              <label className={lbl}>Investor / Institution *</label>
              <input className={inp('investor')} name="investor" value={f.investor} onChange={set} placeholder="e.g. CalPERS" />
            </div>
            <div>
              <label className={lbl}>Contact Person</label>
              <input className={`${base} border-gray-200`} name="contact_person" value={f.contact_person} onChange={set} placeholder="Decision-maker name" />
            </div>
            <div>
              <label className={lbl}>Contact Email</label>
              <input className={`${base} border-gray-200`} name="contact_email" value={f.contact_email} onChange={set} type="email" placeholder="email@example.com" />
            </div>
            <div>
              <label className={lbl}>Stage</label>
              <select className={`${base} border-gray-200`} name="stage" value={f.stage} onChange={set}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Strategy Type</label>
              <select className={`${base} border-gray-200`} name="strategy_type" value={f.strategy_type} onChange={set}>
                <option value="">Select…</option>
                {STRATEGIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Investor Type</label>
              <select className={`${base} border-gray-200`} name="investor_type" value={f.investor_type} onChange={set}>
                <option value="">Select…</option>
                {INV_TYPES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Introduction Type</label>
              <select className={`${base} border-gray-200`} name="introduction_type" value={f.introduction_type} onChange={set}>
                <option value="">Select…</option>
                {INTRO_TYPES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Geography</label>
              <input className={`${base} border-gray-200`} name="geography" value={f.geography} onChange={set} placeholder="e.g. California, USA" />
            </div>
            <div>
              <label className={lbl}>Mandate Size</label>
              <input className={`${base} border-gray-200`} name="mandate_size" value={f.mandate_size} onChange={set} placeholder="e.g. $50M" />
            </div>
            <div>
              <label className={lbl}>Last Activity Date</label>
              <input className={`${base} border-gray-200`} name="last_activity_date" value={f.last_activity_date} onChange={set} type="date" />
            </div>
            <div>
              <label className={lbl}>Follow-up Date</label>
              <input className={`${base} border-gray-200`} name="follow_up_date" value={f.follow_up_date} onChange={set} type="date" />
            </div>
          </div>

          <div>
            <label className={lbl}>Notes</label>
            <textarea className={`${base} border-gray-200`} name="notes" value={f.notes} onChange={set} rows={4} placeholder="Meeting notes, next steps, observations…" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" name="fee_agreement_status" checked={f.fee_agreement_status} onChange={set} className="w-4 h-4 accent-blue-600 rounded" />
            <span className="text-sm text-gray-700">Fee Agreement Documented</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="button" onClick={handleSave}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">
              Save Deal
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
