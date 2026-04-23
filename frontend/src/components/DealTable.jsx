import { useState } from 'react'
import { STAGES, todayStr } from '../constants'
import StageBadge from './StageBadge'
import { exportCSV } from '../api'

export default function DealTable({ deals, onEdit, onDelete, onAdvance, onEmail }) {
  const [stageF, setStageF] = useState('')
  const [q,      setQ]      = useState('')
  const t = todayStr()

  const filtered = deals.filter(d => {
    const ms = !stageF || d.stage === stageF
    const mq = !q || [d.manager_name, d.investor, d.contact_person ?? '']
      .some(v => v.toLowerCase().includes(q.toLowerCase()))
    return ms && mq
  })

  const confirmDelete = (deal) => {
    if (window.confirm(`Delete "${deal.manager_name} × ${deal.investor}"?\n\nThis cannot be undone.`)) {
      onDelete(deal.id)
    }
  }

  return (
    <div className="space-y-4">

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <input
          type="text"
          placeholder="🔍  Search manager, investor, contact…"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm flex-1 min-w-52 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <select
          value={stageF}
          onChange={e => setStageF(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Stages</option>
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
        <button
          onClick={() => exportCSV(deals)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 whitespace-nowrap"
        >
          ⬇ Export CSV
        </button>
      </div>

      <p className="text-xs text-gray-400">{filtered.length} deal{filtered.length !== 1 ? 's' : ''}</p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">No deals match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Manager','Investor','Contact','Stage','Strategy','Inv. Type','Geography','Mandate','Follow-up','Fee ✓','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(deal => (
                  <tr key={deal.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">{deal.manager_name}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{deal.investor}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{deal.contact_person || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><StageBadge stage={deal.stage} /></td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{deal.strategy_type || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{deal.investor_type || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{deal.geography || '—'}</td>
                    <td className="px-4 py-3 text-blue-700 font-semibold whitespace-nowrap">{deal.mandate_size || '—'}</td>
                    <td className={`px-4 py-3 text-xs font-semibold whitespace-nowrap ${
                      deal.follow_up_date && deal.follow_up_date < t ? 'text-red-600'
                      : deal.follow_up_date === t ? 'text-amber-600'
                      : 'text-gray-500'
                    }`}>
                      {deal.follow_up_date || '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{deal.fee_agreement_status ? '✅' : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 whitespace-nowrap">
                        <button title="Draft email"   onClick={() => onEmail(deal)}   className="px-2 py-1 text-xs bg-blue-50  text-blue-700  rounded hover:bg-blue-100">📧</button>
                        <button title="Edit deal"     onClick={() => onEdit(deal)}    className="px-2 py-1 text-xs bg-gray-100 text-gray-700  rounded hover:bg-gray-200">✏️</button>
                        {deal.stage !== 'Closed' && (
                          <button title="Advance stage" onClick={() => onAdvance(deal.id)} className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100">→</button>
                        )}
                        <button title="Delete"        onClick={() => confirmDelete(deal)} className="px-2 py-1 text-xs bg-red-50  text-red-600   rounded hover:bg-red-100">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
