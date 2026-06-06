import type { TrainingContent } from '../types'

export const trainingContents: Record<string, TrainingContent> = {
  'SOP-WV-012': {
    id: 'SOP-WV-012',
    type: 'sop',
    title: 'Updated Loom Operation & Safety SOP 2026',
    body: `<h3 class="text-lg font-bold mb-3">LOOM OPERATION & SAFETY SOP</h3>
<p class="mb-2"><strong>Document ID:</strong> SOP-WV-012</p>
<p class="mb-2"><strong>Version:</strong> 3.2 (April 2026)</p>
<p class="mb-2"><strong>Scope:</strong> All Weaving Section Operators</p>
<hr class="my-3" />
<h4 class="font-bold mb-2">1. PRE-OPERATION CHECKS</h4>
<ul class="list-disc pl-5 mb-3 space-y-1">
  <li>Verify that all safety guards are in place and secured.</li>
  <li>Check emergency stop buttons (both sides) are functional.</li>
  <li>Inspect air pressure — must be between 6–8 bar.</li>
  <li>Ensure warp beam is properly aligned and tension is correct.</li>
</ul>
<h4 class="font-bold mb-2">2. STARTUP PROCEDURE</h4>
<ul class="list-disc pl-5 mb-3 space-y-1">
  <li>Press "Machine On" button and wait for system self-diagnostic.</li>
  <li>Verify display shows green "Ready" status.</li>
  <li>Set RPM to 120 (warmup speed) for first 60 seconds.</li>
  <li>Gradually increase to operating speed (320–360 RPM).</li>
  <li>Monitor fabric formation for first 5 picks — check for broken ends.</li>
</ul>
<h4 class="font-bold mb-2">3. DURING OPERATION</h4>
<ul class="list-disc pl-5 mb-3 space-y-1">
  <li>Conduct visual inspection every 30 minutes.</li>
  <li>Listen for abnormal sounds (bearing noise, reed chatter).</li>
  <li>Check oil level indicator — refill if below minimum mark.</li>
  <li>Record production count on shift log sheet.</li>
</ul>
<h4 class="font-bold mb-2">4. EMERGENCY STOP PROCEDURE</h4>
<ul class="list-disc pl-5 mb-3 space-y-1">
  <li>Press red E-stop immediately if any person is at risk.</li>
  <li>Call supervisor and safety officer.</li>
  <li>Do NOT restart until safety officer provides written clearance.</li>
</ul>
<hr class="my-3" />
<p class="text-sm text-neutral-500"><em>For questions, contact Weaving Supervisor or Safety Officer.</em></p>`,
  },
  'VID-QC-008': {
    id: 'VID-QC-008',
    type: 'video',
    title: 'Fabric Defect Identification Training Video',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    body: 'This training video covers identification of common fabric defects including broken ends, oil stains, reed marks, and weft bars. Follow along with sample cards.',
  },
  'GUIDE-MGR-001': {
    id: 'GUIDE-MGR-001',
    type: 'guide',
    title: 'Supervisor Leadership & Rescue Protocol Guide',
    body: `<h3 class="text-lg font-bold mb-3">SUPERVISOR LEADERSHIP GUIDE</h3>
<p class="mb-3">Welcome to the Supervisor Leadership & Rescue Protocol training. This guide covers your responsibilities as a team leader.</p>
<h4 class="font-bold mb-2">Section 1: Daily Responsibilities</h4>
<ul class="list-disc pl-5 mb-3 space-y-1">
  <li>Conduct 5-minute morning huddle with your team.</li>
  <li>Review worklist priorities and assign tasks.</li>
  <li>Verify attendance and address any absenteeism.</li>
</ul>
<h4 class="font-bold mb-2">Section 2: Rescue Protocol</h4>
<ul class="list-disc pl-5 mb-3 space-y-1">
  <li>Identify overdue tasks and assess severity.</li>
  <li>Escalate within 24 hours if task is critical.</li>
  <li>Assign buddy support for high-risk items.</li>
</ul>
<h4 class="font-bold mb-2">Section 3: Communication</h4>
<ul class="list-disc pl-5 mb-3 space-y-1">
  <li>Provide clear instructions with deadlines.</li>
  <li>Document all escalations in the system.</li>
  <li>Follow up within 48 hours on all open items.</li>
</ul>
<p class="mt-3 text-sm text-neutral-500"><em>Remember: Your team's success is your success.</em></p>`,
  },
  'SOP-FN-022': {
    id: 'SOP-FN-022',
    type: 'sop',
    title: 'Finishing Section Standard Operating Procedures',
    body: `<h3 class="text-lg font-bold mb-3">FINISHING SECTION SOP</h3>
<p class="mb-2"><strong>Document ID:</strong> SOP-FN-022</p>
<p class="mb-2"><strong>Covers:</strong> Brushing, Shearing, Singeing, and Inspection</p>
<hr class="my-3" />
<h4 class="font-bold mb-2">Brushing</h4>
<ul class="list-disc pl-5 mb-3 space-y-1">
  <li>Set brush roller speed to 800 RPM.</li>
  <li>Feed fabric at 40 m/min.</li>
  <li>Replace brushes after every 5000 m of fabric.</li>
</ul>
<h4 class="font-bold mb-2">Shearing</h4>
<ul class="list-disc pl-5 mb-3 space-y-1">
  <li>Adjust blade clearance to 0.15 mm.</li>
  <li>Set fabric speed to 30 m/min.</li>
  <li>Check blade sharpness before each shift.</li>
</ul>`,
  },
  'SOP-INV-005': {
    id: 'SOP-INV-005',
    type: 'guide',
    title: 'Inventory Management & FIFO Compliance Guide',
    body: `<h3 class="text-lg font-bold mb-3">INVENTORY MANAGEMENT GUIDE</h3>
<p class="mb-3">This guide explains the FIFO (First-In-First-Out) inventory system used in our warehouse.</p>
<h4 class="font-bold mb-2">FIFO Principles</h4>
<ul class="list-disc pl-5 mb-3 space-y-1">
  <li>Always issue older stock first.</li>
  <li>Label incoming material with date receiving.</li>
  <li>Arrange shelves so older stock is accessible.</li>
</ul>
<h4 class="font-bold mb-2">Daily Checks</h4>
<ul class="list-disc pl-5 mb-3 space-y-1">
  <li>Verify bin quantities match system records.</li>
  <li>Report any expired or damaged material.</li>
  <li>Update inventory log after each issue/return.</li>
</ul>`,
  },
}
