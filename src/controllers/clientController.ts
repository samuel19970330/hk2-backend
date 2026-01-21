import { Request, Response } from 'express';
import { ClientService } from '../services/clientService';

const clientService = new ClientService();

export const createClient = async (req: Request, res: Response) => {
    try {
        const client = await clientService.create(req.body);
        res.status(201).json(client);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getClients = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search as string;

        const result = await clientService.getAll(page, limit, search);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getClient = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const client = await clientService.getById(id);
        res.json(client);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const updateClient = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const client = await clientService.update(id, req.body);
        res.json(client);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteClient = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await clientService.delete(id);
        res.json({ message: 'Client deleted successfully' });
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};
