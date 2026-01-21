import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Client } from '../entities/Client';
import { Product } from '../entities/Product';
import { Credit, CreditStatus } from '../entities/Credit';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const clientRepo = AppDataSource.getRepository(Client);
        const productRepo = AppDataSource.getRepository(Product);
        const creditRepo = AppDataSource.getRepository(Credit);

        const totalClients = await clientRepo.count();
        const totalProducts = await productRepo.count();
        const lowStockProducts = await productRepo.createQueryBuilder('product')
            .where('product.stock_quantity <= product.min_stock')
            .getCount();

        const activeCredits = await creditRepo.find({ where: { status: CreditStatus.ACTIVE } });
        const totalActiveCredits = activeCredits.length;
        const totalCreditAmount = activeCredits.reduce((sum, credit) => sum + Number(credit.current_balance), 0);

        res.json({
            totalClients,
            totalProducts,
            lowStockProducts,
            totalActiveCredits,
            totalCreditAmount
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
