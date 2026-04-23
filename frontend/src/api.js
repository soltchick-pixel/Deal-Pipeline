const BASE = ''  // same origin — Vite proxy handles /deals, /stats, /followups

const json = (res) => {
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

const h = { 'Content-Type': 'application/json' }

export const api = {
  getDeals:    (params = {}) => fetch(`${BASE}/deals?${new URLSearchParams(params)}`).then(json),
  createDeal:  (body)       => fetch(`${BASE}/deals`,         { method: 'POST',   headers: h, body: JSON.stringify(body) }).then(json),
  updateDeal:  (id, body)   => fetch(`${BASE}/deals/${id}`,   { method: 'PUT',    headers: h, body: JSON.stringify(body) }).then(json),
  deleteDeal:  (id)         => fetch(`${BASE}/deals/${id}`,   { method: 'DELETE' }).then(json),
  advanceDeal: (id)         => fetch(`${BASE}/deals/${id}/advance`, { method: 'POST' }).then(json),
  getStats:    ()           => fetch(`${BASE}/stats`).then(json),
}

export const exportCSV = (deals) => {
  const hdrs = ['Manager Name','Investor','Contact Person','Contact Email','Stage','Strategy Type','Investor Type','Geography','Mandate Size','Introduction Type','Fee Agreement','Last Activity','Follow-up Date','Notes','Created']
  const esc  = v => `"${(v ?? '').toString().replace(/"/g, '""')}"`
  const rows = deals.map(d => [
    d.manager_name, d.investor, d.contact_person, d.contact_email, d.stage,
    d.strategy_type, d.investor_type, d.geography, d.mandate_size,
    d.introduction_type, d.fee_agreement_status ? 'Yes' : 'No',
    d.last_activity_date, d.follow_up_date, d.notes, d.created_date,
  ].map(esc).join(','))
  const csv = [hdrs.map(esc).join(','), ...rows].join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  Object.assign(document.createElement('a'), {
    href: url,
    download: `Deal_Pipeline_${new Date().toISOString().split('T')[0]}.csv`,
  }).click()
  URL.revokeObjectURL(url)
}
