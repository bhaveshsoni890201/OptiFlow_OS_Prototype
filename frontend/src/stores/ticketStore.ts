
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { HelpTicket } from '../types'
import { getHelpTickets, addTicketComment, closeTicket, reopenTicket, assignTicket, escalateTicket } from '../services/ticketService'
import { useNotificationStore } from './notificationStore'
import { useAdminStore } from './adminStore'
import { logger } from '../utils/logger'
const categoryCaptainMap: Record<string, string> = {
'Software Bug': 'EMP-0001',  'Network Issue': 'EMP-0001',  'Equipment': 'EMP-0003',  'Training': 'EMP-0003',  'HR': 'EMP-0001',  'Safety': 'EMP-0002',
}
export const useTicketStore = defineStore('tickets', () => {
const tickets = ref<HelpTicket[]>([])
const loading = ref(false)
const error = ref('')
function setTickets(list: HelpTicket[]): void {
tickets.value = list
}
async function fetchTickets(): Promise<void> {
loading.value = true
error.value = ''
try {
tickets.value = await getHelpTickets()
} catch (e) {
error.value = 'Failed to load tickets'
logger.error('TicketStore', 'Failed to fetch tickets', e)
} finally {
loading.value = false
}
}
function detectMentions(text: string): string[] {
const mentions = text.match(/@(\w+\s?\w+)/g)
if (!mentions) return []
return mentions.map((m) => m.replace('@', '').trim())
}
function notifyMentioned(mentionedNames: string[], ticketId: string, author: string): void {
if (mentionedNames.length === 0) return
const adminStore = useAdminStore()
const notifyStore = useNotificationStore()
for (const name of mentionedNames) {
    const emp = adminStore.employees.find(
      (e) => e.name.toLowerCase().includes(name.toLowerCase()))

if (emp) {
      notifyStore.notifications.unshift({
        id: `n-mention-${Date.now()}-${emp.employee_id}`,
        type: 'ticket',
        title: `You were mentioned by ${author}`,
        context: `In ticket ${ticketId}`,
        timestamp: new Date().toISOString(),
        read: false,
        link: `/captain/tickets`,
      })
}
}
}
  async function addComment(ticketId: string, author: string, text: string): Promise<void> {
    const ticket = tickets.value.find((t) => t.id === ticketId)
    if (!ticket) return
    const prevLen = ticket.comments.length
    const prevUpdated = ticket.updated_on
    ticket.comments.push({
      id: `TKT-CM-NEW-${Date.now()}`,
      author,
      text,
      created_on: new Date().toISOString()
    })
    ticket.updated_on = new Date().toISOString()
    const mentions = detectMentions(text)
    notifyMentioned(mentions, ticketId, author)
    try {
      await addTicketComment(ticketId, text, author)
    } catch (e) {
      ticket.updated_on = prevUpdated
      while (ticket.comments.length > prevLen) ticket.comments.pop()
      logger.error('TicketStore', 'Failed to sync comment', e)
    }
  }
async function autoAssignByCategory(ticket: HelpTicket): Promise<void> {
const captainId = categoryCaptainMap[ticket.category]
if (captainId) {
ticket.assigned_to = captainId
ticket.status = 'in_review'
ticket.updated_on = new Date().toISOString()
try {
await assignTicket(ticket.id, captainId)
} catch (e) {
logger.error('TicketStore', 'Failed to auto-assign ticket', e)
}
}
}
  async function resolveTicket(ticketId: string, resolutionNotes: string): Promise<void> {
    const ticket = tickets.value.find((t) => t.id === ticketId)
    if (!ticket) return
    const prevStatus = ticket.status
    const prevUpdated = ticket.updated_on
    const prevResolvedOn = ticket.resolved_on
    ticket.status = 'resolved'
    ticket.resolution_notes = resolutionNotes
    ticket.resolved_on = new Date().toISOString()
    ticket.updated_on = new Date().toISOString()
    try {
      await closeTicket(ticketId, resolutionNotes)
    } catch (e) {
      ticket.status = prevStatus
      ticket.updated_on = prevUpdated
      ticket.resolved_on = prevResolvedOn
      logger.error('TicketStore', 'Failed to resolve ticket', e)
    }
  }
  async function closeTicketAction(ticketId: string, resolutionNotes: string): Promise<void> {
    const ticket = tickets.value.find((t) => t.id === ticketId)
    if (!ticket) return
    const prevStatus = ticket.status
    const prevUpdated = ticket.updated_on
    ticket.status = 'closed'
    ticket.resolution_notes = resolutionNotes
    ticket.updated_on = new Date().toISOString()
    try {
      await closeTicket(ticketId, resolutionNotes)
    } catch (e) {
      ticket.status = prevStatus
      ticket.updated_on = prevUpdated
      logger.error('TicketStore', 'Failed to close ticket', e)
    }
  }
  async function reopenTicketAction(ticketId: string): Promise<void> {
    const ticket = tickets.value.find((t) => t.id === ticketId)
    if (!ticket) return
    if (ticket.status === 'closed') {
      const closedAge = Date.now() - new Date(ticket.updated_on).getTime()
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      if (closedAge > sevenDays) return
      const prevStatus = ticket.status
      const prevUpdated = ticket.updated_on
      ticket.status = 'open'
      ticket.updated_on = new Date().toISOString()
      try {
        await reopenTicket(ticketId)
      } catch (e) {
        ticket.status = prevStatus
        ticket.updated_on = prevUpdated
        logger.error('TicketStore', 'Failed to reopen ticket', e)
      }
    }
  }
  async function assignTicketAction(ticketId: string, assignedTo: string): Promise<void> {
    const ticket = tickets.value.find((t) => t.id === ticketId)
    if (!ticket) return
    const prevAssignedTo = ticket.assigned_to
    const prevStatus = ticket.status
    const prevUpdated = ticket.updated_on
    ticket.assigned_to = assignedTo
    ticket.status = 'in_review'
    ticket.updated_on = new Date().toISOString()
    try {
      await assignTicket(ticketId, assignedTo)
    } catch (e) {
      ticket.assigned_to = prevAssignedTo
      ticket.status = prevStatus
      ticket.updated_on = prevUpdated
      logger.error('TicketStore', 'Failed to assign ticket', e)
    }
  }
  async function escalateTicketAction(ticketId: string, reason: string): Promise<void> {
    const ticket = tickets.value.find((t) => t.id === ticketId)
    if (!ticket) return
    const prevStatus = ticket.status
    const prevUpdated = ticket.updated_on
    const prevCommentLen = ticket.comments.length
    ticket.status = 'escalated'
    ticket.updated_on = new Date().toISOString()
    ticket.comments.push({
      id: `TKT-CM-ESC-${Date.now()}`,
      author: 'System',
      text: `Escalated: ${reason}`,
      created_on: new Date().toISOString()
    })
    try {
      await escalateTicket(ticketId, reason)
    } catch (e) {
      ticket.status = prevStatus
      ticket.updated_on = prevUpdated
      while (ticket.comments.length > prevCommentLen) ticket.comments.pop()
      logger.error('TicketStore', 'Failed to escalate ticket', e)
    }
  }
async function submitSatisfaction(ticketId: string, score: number): Promise<void> {
const ticket = tickets.value.find((t) => t.id === ticketId)
if (!ticket) return
ticket.satisfaction_score = score
}
return {
tickets,
loading,
error,
setTickets,
fetchTickets,
addComment,
closeTicket: closeTicketAction,
reopenTicket: reopenTicketAction,
assignTicket: assignTicketAction,
escalateTicket: escalateTicketAction,
resolveTicket,
autoAssignByCategory,
submitSatisfaction,
}
})
