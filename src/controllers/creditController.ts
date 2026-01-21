import { Request, Response } from 'express';
import { CreditService } from '../services/creditService';

const creditService = new CreditService();

export const createCredit = async (req: Request, res: Response) => {
    try {
        const { clientId, amount, interestRate, installmentsCount, startDate, items } = req.body;
        const credit = await creditService.createCredit(clientId, amount, interestRate, installmentsCount, new Date(startDate), items);
        res.status(201).json(credit);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getCredits = async (req: Request, res: Response) => {
    try {
        const credits = await creditService.getCredits();
        res.json(credits);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCredit = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const credit = await creditService.getCreditDetails(id);
        if (!credit) return res.status(404).json({ message: 'Credit not found' });
        res.json(credit);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const registerPayment = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { amount, paymentType, notes } = req.body;
        const result = await creditService.registerPayment(id, amount, paymentType, notes);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
