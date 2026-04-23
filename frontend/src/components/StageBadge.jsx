import { STAGE_META } from '../constants'

export default function StageBadge({ stage }) {
  const m = STAGE_META[stage] || { badge: 'bg-gray-100 text-gray-700' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${m.badge}`}>
      {stage}
    </span>
  )
}
