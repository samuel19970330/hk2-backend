import { AppDataSource } from '../config/database';
import { Client } from '../entities/Client';

export class ClientService {
    private clientRepository = AppDataSource.getRepository(Client);

    async create(data: Partial<Client>) {
        const existing = await this.clientRepository.findOneBy({ document_id: data.document_id });
        if (existing) {
            throw new Error('Client with this Document ID already exists');
        }

        const client = this.clientRepository.create(data);
        return await this.clientRepository.save(client);
    }

    async getAll(page: number = 1, limit: number = 10, search?: string) {
        const query = this.clientRepository.createQueryBuilder('client');

        if (search) {
            query.where('client.full_name LIKE :search OR client.document_id LIKE :search', { search: `%${search}%` });
        }

        query.skip((page - 1) * limit).take(limit).orderBy('client.created_at', 'DESC');

        const [clients, total] = await query.getManyAndCount();

        return {
            data: clients,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getById(id: number) {
        const client = await this.clientRepository.findOne({
            where: { id },
            relations: ['credits']
        });

        if (!client) {
            throw new Error('Client not found');
        }

        return client;
    }

    async update(id: number, data: Partial<Client>) {
        const client = await this.clientRepository.findOneBy({ id });
        if (!client) {
            throw new Error('Client not found');
        }

        this.clientRepository.merge(client, data);
        return await this.clientRepository.save(client);
    }

    async delete(id: number) {
        const result = await this.clientRepository.delete(id);
        if (result.affected === 0) {
            throw new Error('Client not found');
        }
        return { message: 'Client deleted successfully' };
    }
}
