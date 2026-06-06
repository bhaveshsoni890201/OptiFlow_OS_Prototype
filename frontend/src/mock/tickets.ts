import type { HelpTicket } from '../types'

export const helpTickets: HelpTicket[] = [
  {
    id: 'TKT-0001',
    category: 'Software Bug',
    subject: 'Biometric scanner not syncing attendance',
    description:
      'The fingerprint scanner at the weaving section entrance is not registering punches since morning of 2nd June. Workers had to manually write attendance in register.',
    raised_by: 'EMP-0002',
    status: 'open',
    priority: 'high',
    comments: [
      {
        id: 'TKT-CM-0001',
        author: 'Priya Sharma',
        text: 'Scanner shows "Sync Failed" error every time. We have restarted it twice but no change.',
        created_on: '2026-06-02T09:30:00+05:30',
      },
      {
        id: 'TKT-CM-0002',
        author: 'Ramesh Kumar',
        text: 'I have raised this with the AMC vendor. They said they will send a technician by tomorrow morning.',
        created_on: '2026-06-02T15:00:00+05:30',
      },
    ],
    created_on: '2026-06-02T09:30:00+05:30',
    updated_on: '2026-06-02T15:00:00+05:30',
  },
  {
    id: 'TKT-0002',
    category: 'Network Issue',
    subject: 'Poor internet connectivity in dyeing section',
    description:
      'The internet connection near the dyeing plant has been very slow for the past week. Unable to upload daily production data sheets.',
    raised_by: 'EMP-0004',
    status: 'in_review',
    priority: 'medium',
    comments: [
      {
        id: 'TKT-CM-0003',
        author: 'Raj Mehta',
        text: 'Even the desktop in the dyeing control room can barely load the dashboard. Taking 5+ minutes per page.',
        created_on: '2026-06-01T11:00:00+05:30',
      },
    ],
    created_on: '2026-06-01T11:00:00+05:30',
    updated_on: '2026-06-02T10:00:00+05:30',
  },
  {
    id: 'TKT-0003',
    category: 'Equipment',
    subject: 'Air conditioning not working in QC lab',
    description:
      'The AC in the quality control laboratory has stopped working. Ambient temperature is 36°C which is affecting fabric inspection accuracy.',
    raised_by: 'EMP-0003',
    status: 'escalated',
    priority: 'critical',
    comments: [
      {
        id: 'TKT-CM-0004',
        author: 'Anjali Patel',
        text: 'The AC unit is making a rattling noise and then shuts down after 10 minutes. Technician checked and said compressor might be failing.',
        created_on: '2026-05-31T14:00:00+05:30',
      },
      {
        id: 'TKT-CM-0005',
        author: 'Ramesh Kumar',
        text: 'Approved for replacement. I have asked the admin to process the purchase order for a new 2-ton split AC. Expected installation by 5th June.',
        created_on: '2026-06-02T11:00:00+05:30',
      },
    ],
    created_on: '2026-05-31T14:00:00+05:30',
    updated_on: '2026-06-02T11:00:00+05:30',
  },
  {
    id: 'TKT-0004',
    category: 'Training',
    subject: 'Request for refresher SOP on fabric grading',
    description:
      'The new fabric grading SOP was updated last month but most workers in the finishing section haven gone through the updated version.',
    raised_by: 'EMP-0006',
    status: 'resolved',
    priority: 'low',
    comments: [
      {
        id: 'TKT-CM-0006',
        author: 'Deepika Singh',
        text: 'I have printed copies of the old SOP and workers are still following that. Need to organise a quick refresher session.',
        created_on: '2026-05-28T10:00:00+05:30',
      },
      {
        id: 'TKT-CM-0007',
        author: 'Anjali Patel',
        text: 'I will conduct the refresher training this Saturday (1st June). Please ensure all finishing section staff attend.',
        created_on: '2026-05-28T15:00:00+05:30',
      },
    ],
    resolution_notes:
      'Training conducted successfully on 1st June 2026. 12 workers attended. Signed attendance sheet submitted.',
    created_on: '2026-05-28T10:00:00+05:30',
    updated_on: '2026-06-01T16:00:00+05:30',
  },
  {
    id: 'TKT-0005',
    category: 'HR',
    subject: 'Missing PPE supplies for weaving section',
    description:
      'Earplugs and safety goggles stock has run out. New supply was supposed to arrive last week but has not been delivered.',
    raised_by: 'EMP-0002',
    status: 'open',
    priority: 'medium',
    comments: [
      {
        id: 'TKT-CM-0008',
        author: 'Priya Sharma',
        text: 'We have 4 workers in the weaving section working without proper ear protection since yesterday. This is a safety concern.',
        created_on: '2026-06-03T07:00:00+05:30',
      },
    ],
    created_on: '2026-06-03T07:00:00+05:30',
    updated_on: '2026-06-03T07:00:00+05:30',
  },
]
