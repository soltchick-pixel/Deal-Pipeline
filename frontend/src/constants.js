export const STAGES = ['Outreach', 'Meeting', 'Due Diligence', 'Negotiation', 'Closed']

export const STAGE_META = {
  Outreach:        { badge: 'bg-blue-100 text-blue-800',    bar: 'bg-blue-600',    card: '#2563eb', col: 'bg-blue-600'    },
  Meeting:         { badge: 'bg-purple-100 text-purple-800', bar: 'bg-purple-600',  card: '#9333ea', col: 'bg-purple-600'  },
  'Due Diligence': { badge: 'bg-amber-100 text-amber-800',   bar: 'bg-amber-500',   card: '#f59e0b', col: 'bg-amber-500'   },
  Negotiation:     { badge: 'bg-orange-100 text-orange-800', bar: 'bg-orange-500',  card: '#f97316', col: 'bg-orange-500'  },
  Closed:          { badge: 'bg-green-100 text-green-800',   bar: 'bg-green-600',   card: '#16a34a', col: 'bg-green-600'   },
}

export const STRATEGIES  = ['Hedge Fund','Private Credit','Real Estate Credit','Real Assets','Private Equity','Infrastructure','Venture Capital','Other']
export const INV_TYPES   = ['Pension Fund','Endowment','Family Office','Sovereign Wealth Fund','Insurance Company','Foundation','Other']
export const INTRO_TYPES = ['Referral','Conference','Cold Outreach','Existing Relationship']

export const BLANK_DEAL = {
  manager_name: '', investor: '', contact_person: '', contact_email: '',
  stage: 'Outreach', strategy_type: '', investor_type: '', geography: '',
  mandate_size: '', introduction_type: '', fee_agreement_status: false,
  last_activity_date: '', follow_up_date: '', notes: '',
}

export const todayStr = () => new Date().toISOString().split('T')[0]
