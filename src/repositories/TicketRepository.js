import { BaseRepository } from './BaseRepository.js';
import { ticketModel } from '../dao/models/ticketModel.js';

export class TicketRepository extends BaseRepository {
    constructor() {
        super(ticketModel);
    }

    async findByCode(code) {
        return await this.model.findOne({ code });
    }

    async findByPurchaser(email) {
        return await this.model.find({ purchaser: email }).sort({ purchase_datetime: -1 });
    }

    async generateUniqueCode() {
        let code;
        let isUnique = false;
        
        while (!isUnique) {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 8).toUpperCase();
            code = `TICKET-${timestamp}-${random}`;
            
            const existingTicket = await this.findByCode(code);
            if (!existingTicket) {
                isUnique = true;
            }
        }
        
        return code;
    }
}