import type { HelpTicket } from '../types'
import { endpoints } from '../api/endpoints'
import { BaseService } from './BaseService'

class TicketService extends BaseService {
  protected entityName = 'Ticket'

  async getHelpTickets(): Promise<HelpTicket[]> {
    return this.fetchList<HelpTicket>(
      endpoints.tickets.list,
      async () => {
        const { helpTickets } = await import('../mock/tickets')
        return helpTickets
      },
      'ticket:list',
    )
  }

  async getHelpTicket(id: string): Promise<HelpTicket | undefined> {
    return this.fetchOne<HelpTicket>(
      endpoints.tickets.detail(id),
      async () => {
        const { helpTickets } = await import('../mock/tickets')
        return helpTickets.find((t) => t.id === id)
      },
      `ticket:${id}`,
      60_000,
    )
  }

  async createHelpTicket(ticket: Partial<HelpTicket>): Promise<void> {
    await this.mutate('post', endpoints.tickets.create, ticket, ['ticket:'])
  }

  async updateHelpTicket(id: string, data: Partial<HelpTicket>): Promise<void> {
    await this.mutate('put', endpoints.tickets.update(id), data, ['ticket:'])
  }

  async addTicketComment(ticketId: string, text: string, author: string): Promise<void> {
    await this.mutate('post', endpoints.tickets.addComment(ticketId), { text, author }, [`ticket:${ticketId}`])
  }

  async closeTicket(ticketId: string, resolutionNotes: string): Promise<void> {
    await this.mutate('post', endpoints.tickets.close(ticketId), { resolution_notes: resolutionNotes }, [`ticket:${ticketId}`])
  }

  async reopenTicket(ticketId: string): Promise<void> {
    await this.mutate('post', endpoints.tickets.reopen(ticketId), undefined, [`ticket:${ticketId}`])
  }

  async assignTicket(ticketId: string, assignedTo: string): Promise<void> {
    await this.mutate('post', endpoints.tickets.assign(ticketId), { assigned_to: assignedTo }, [`ticket:${ticketId}`])
  }

  async escalateTicket(ticketId: string, reason: string): Promise<void> {
    await this.mutate('post', endpoints.tickets.escalate(ticketId), { reason }, [`ticket:${ticketId}`])
  }
}

const ticketService = new TicketService()

export const getHelpTickets = () => ticketService.getHelpTickets()
export const getHelpTicket = (id: string) => ticketService.getHelpTicket(id)
export const createHelpTicket = (ticket: Partial<HelpTicket>) => ticketService.createHelpTicket(ticket)
export const updateHelpTicket = (id: string, data: Partial<HelpTicket>) => ticketService.updateHelpTicket(id, data)
export const addTicketComment = (ticketId: string, text: string, author: string) =>
  ticketService.addTicketComment(ticketId, text, author)
export const closeTicket = (ticketId: string, resolutionNotes: string) => ticketService.closeTicket(ticketId, resolutionNotes)
export const reopenTicket = (ticketId: string) => ticketService.reopenTicket(ticketId)
export const assignTicket = (ticketId: string, assignedTo: string) => ticketService.assignTicket(ticketId, assignedTo)
export const escalateTicket = (ticketId: string, reason: string) => ticketService.escalateTicket(ticketId, reason)
