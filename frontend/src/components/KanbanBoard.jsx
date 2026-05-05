import { useState } from 'react'
import { STAGES, STAGE_META, todayStr } from '../constants'

export default function KanbanBoard({ deals, onEdit, onAdvance, onEmail, onStageChange }) {
  const t = todayStr()
  const [dragId, setDragId]       = useState(null)
  const [hoverStage, setHoverStage] = useState(null)

  const handleDragStart = (e, deal) => {
    setDragId(deal.id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(deal.id))
  }

  const handleDragOver = (e, stage) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (hoverStage !== stage) setHoverStage(stage)
  }

  const handleDrop = (e, stage) => {
    e.preventDefault()
    const id = Number(e.dataTransfer.getData('text/plain') || dragId)
    setDragId(null)
    setHoverStage(null)
    const deal = deals.find(d => d.id === id)
    if (deal && deal.stage !== stage && onStageChange) onStageChange(deal, stage)
  }

  const handleDragEnd = () => {
    setDragId(null)
    setHoverStage(null)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 items-start">
      {STAGES.map(stage => {
        const col  = deals.filter(d => d.stage === stage)
        const meta = STAGE_META[stage]
        const isHover = hoverStage === stage
        return (
          <div key={stage} className="flex-shrink-0 w-60">
            {/* Column header */}
            <div className={`${meta.col} rounded-t-xl px-4 py-3 flex items-center justify-between`}>
              <span className="text-white text-sm font-bold">{stage}</span>
              <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">{col.length}</span>
            </div>

            {/* Drop target */}
            <div
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={() => setHoverStage(null)}
              onDrop={(e) => handleDrop(e, stage)}
              className={`rounded-b-xl min-h-40 p-2 space-y-2 transition-colors ${
                isHover ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-gray-100'
              }`}
            >
              {col.length === 0 && (
                <p className="text-center text-gray-400 text-xs py-6">
                  {isHover ? 'Drop here' : 'No deals'}
                </p>
              )}
              {col.map(deal => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-move ${
                    dragId === deal.id ? 'opacity-50' : ''
                  }`}
                  style={{ borderLeft: `4px solid ${meta.card}` }}
                >
                  <p className="font-bold text-gray-900 text-sm leading-snug truncate" title={deal.manager_name}>
                    {deal.manager_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{deal.investor}</p>
                  {deal.contact_person && <p className="text-xs text-gray-400 mt-0.5">👤 {deal.contact_person}</p>}
                  {deal.strategy_type  && <p className="text-xs text-gray-400 mt-0.5">📊 {deal.strategy_type}</p>}
                  {deal.mandate_size   && <p className="text-xs font-bold text-blue-600 mt-1">💰 {deal.mandate_size}</p>}
                  {deal.follow_up_date && (
                    <p className={`text-xs mt-1 font-semibold ${
                      deal.follow_up_date < t ? 'text-red-500'
                      : deal.follow_up_date === t ? 'text-amber-500'
                      : 'text-gray-400'
                    }`}>
                      📅 {deal.follow_up_date}
                    </p>
                  )}
                  {deal.notes && (
                    <p className="text-xs text-gray-400 mt-1 italic line-clamp-2">
                      "{deal.notes.slice(0, 80)}{deal.notes.length > 80 ? '…' : ''}"
                    </p>
                  )}
                  <div className="flex gap-1 mt-2.5">
                    <button onClick={() => onEmail(deal)} className="flex-1 text-xs py-1 bg-blue-50  text-blue-700  rounded hover:bg-blue-100  font-medium">Email</button>
                    <button onClick={() => onEdit(deal)}  className="flex-1 text-xs py-1 bg-gray-100 text-gray-600  rounded hover:bg-gray-200 font-medium">Edit</button>
                    {stage !== 'Closed' && (
                      <button onClick={() => onAdvance(deal.id)} className="flex-1 text-xs py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 font-medium">→</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
