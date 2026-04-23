import { STAGES, STAGE_META, todayStr } from '../constants'
import StageBadge from './StageBadge'

export default function Dashboard({ deals, stats, onAdd, onEdit, onEmail }) {
  const t        = todayStr()
  const overdue  = deals.filter(d => d.follow_up_date && d.follow_up_date < t && d.stage !== 'Closed')
  const dueToday = deals.filter(d => d.follow_up_date === t && d.stage !== 'Closed')

  return (
    <div className="space-y-5">

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl mt-0.5">🔴</span>
          <div>
            <p className="font-bold text-red-800 text-sm">
              {overdue.length} overdue follow-up{overdue.length > 1 ? 's' : ''} — action required
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              {overdue.map(d => `${d.manager_name} × ${d.investor}`).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Due today warning */}
      {dueToday.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl mt-0.5">🟡</span>
          <div>
            <p className="font-bold text-amber-800 text-sm">
              {dueToday.length} follow-up{dueToday.length > 1 ? 's' : ''} due today
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {dueToday.map(d => `${d.manager_name} × ${d.investor}`).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Deals',   value: stats.total,    color: 'text-gray-900',  bg: 'bg-white',    icon: '📋' },
          { label: 'Active',        value: stats.active,   color: 'text-blue-700',  bg: 'bg-blue-50',  icon: '⚡' },
          { label: 'Closed',        value: stats.closed,   color: 'text-green-700', bg: 'bg-green-50', icon: '✅' },
          { label: 'Action Needed', value: (stats.overdue || 0) + (stats.due_today || 0), color: 'text-red-700', bg: 'bg-red-50', icon: '🔔' },
        ].map(({ label, value, color, bg, icon }) => (
          <div key={label} className={`${bg} rounded-xl p-5 border border-gray-100 shadow-sm`}>
            <div className="flex justify-between items-start">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
              <span className="text-xl">{icon}</span>
            </div>
            <p className={`text-4xl font-bold mt-2 ${color}`}>{value ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Pipeline bar chart */}
      {stats.by_stage && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">Pipeline by Stage</h3>
          <div className="space-y-3">
            {STAGES.map(stage => {
              const count = stats.by_stage[stage] || 0
              const max   = Math.max(...Object.values(stats.by_stage), 1)
              const pct   = count > 0 ? Math.max((count / max) * 100, 4) : 0
              const m     = STAGE_META[stage]
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-28 shrink-0">{stage}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div className={`${m.bar} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-5 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent deals */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-4 text-sm">Recent Deals</h3>
        {deals.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-400 text-sm">No deals yet.</p>
            <button onClick={onAdd}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm">
              Add Your First Deal
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {deals.slice(0, 7).map(deal => (
              <div key={deal.id} className="flex items-center justify-between py-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <StageBadge stage={deal.stage} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {deal.manager_name} <span className="text-gray-400 font-normal">×</span> {deal.investor}
                    </p>
                    {deal.follow_up_date && (
                      <p className={`text-xs ${deal.follow_up_date < t ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                        Follow-up: {deal.follow_up_date}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-3">
                  <button onClick={() => onEmail(deal)}
                    className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium">
                    Email
                  </button>
                  <button onClick={() => onEdit(deal)}
                    className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
