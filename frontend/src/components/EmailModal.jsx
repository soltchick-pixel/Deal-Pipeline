import { useState } from 'react'
import StageBadge from './StageBadge'

const templates = {
  Outreach: (d) =>
`Subject: Introduction — ${d.manager_name} × ${d.investor}

Dear ${d.contact_person || 'Team'},

I hope this message finds you well. I'm reaching out on behalf of ${d.manager_name} to introduce an investment opportunity I believe aligns with ${d.investor}'s mandate.

${d.manager_name} is a ${d.strategy_type || 'investment'} manager with a compelling track record${d.geography ? ` focused on ${d.geography}` : ''}. Given your team's focus, I thought this would be a valuable conversation to initiate.

Would you be available for a brief introductory call in the coming weeks? I'd be happy to share a one-page overview in advance.

Warm regards,
Stuart Oltchick
Stuart Portfolio Consultants
Soltchick@stuartportfolio.com`,

  Meeting: (d) =>
`Subject: Follow-up — ${d.manager_name} × ${d.investor} Meeting

Dear ${d.contact_person || 'Team'},

Thank you for taking the time to meet and discuss ${d.manager_name}. Your engagement and questions were much appreciated.

As a follow-up, I wanted to:
1. Confirm any additional materials you may have requested
2. Share the next steps we discussed
3. Suggest a follow-on conversation at your convenience

Please don't hesitate to reach out with any questions.

Best regards,
Stuart Oltchick
Stuart Portfolio Consultants
Soltchick@stuartportfolio.com`,

  'Due Diligence': (d) =>
`Subject: Due Diligence Support — ${d.manager_name}

Dear ${d.contact_person || 'Team'},

I wanted to check in on the due diligence process for ${d.manager_name} and ensure your team has everything needed to move forward.

I'm available to:
- Facilitate additional data requests or reference calls
- Arrange direct introductions to ${d.manager_name}'s investment team
- Provide clarification on any outstanding questions

Please let me know how I can be most helpful.

Best regards,
Stuart Oltchick
Stuart Portfolio Consultants
Soltchick@stuartportfolio.com`,

  Negotiation: (d) =>
`Subject: Next Steps — ${d.manager_name} × ${d.investor}

Dear ${d.contact_person || 'Team'},

Thank you for the productive discussions around the potential placement with ${d.manager_name}. I'm pleased with the progress we've made.

I'd like to schedule a call to work through the remaining details and confirm the path forward. Please let me know your availability this week.

Best regards,
Stuart Oltchick
Stuart Portfolio Consultants
Soltchick@stuartportfolio.com`,

  Closed: (d) =>
`Subject: Placement Confirmed — ${d.manager_name} × ${d.investor}

Dear ${d.contact_person || 'Team'},

It's a pleasure to confirm the successful placement between ${d.manager_name} and ${d.investor}. We are thrilled to have facilitated this relationship.

Please don't hesitate to reach out during the onboarding process.

Warm regards,
Stuart Oltchick
Stuart Portfolio Consultants
Soltchick@stuartportfolio.com`,
}

export default function EmailModal({ deal, onClose }) {
  const tpl          = templates[deal.stage] || templates.Outreach
  const [body, setBody] = useState(tpl(deal))
  const [msg,  setMsg]  = useState('')

  const copy = () => {
    const fallback = () => {
      const ta = Object.assign(document.createElement('textarea'), { value: body, style: 'position:fixed;opacity:0' })
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(body).catch(fallback)
    } else {
      fallback()
    }
    setMsg('✓ Copied!')
    setTimeout(() => setMsg(''), 2500)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Email Draft</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {deal.manager_name} × {deal.investor} — <StageBadge stage={deal.stage} />
            </p>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 text-xl">
            ×
          </button>
        </div>

        <div className="px-6 py-4 flex-1 overflow-y-auto">
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            ✏️ Stage-matched template — edit before sending. Add an Anthropic API key later for fully AI-personalised drafts.
          </div>
          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={20}
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button type="button" onClick={onClose}
            className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            Close
          </button>
          <button type="button" onClick={copy}
            className={`px-5 py-2 rounded-lg text-sm font-bold text-white transition-colors ${msg ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {msg || 'Copy to Clipboard'}
          </button>
        </div>

      </div>
    </div>
  )
}
