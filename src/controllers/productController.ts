import { Request, Response } from 'express';
import { ProductService } from '../services/productService';

const productService = new ProductService();

export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = await productService.create(req.body);
        res.status(201).json(product);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const search = req.query.search as string;

        const result = await productService.getAll(page, limit, search);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const product = await productService.update(id, req.body);
        res.json(product);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await productService.delete(id);
        res.json(result);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const downloadTemplate = async (req: Request, res: Response) => {
    try {
        const buffer = await productService.generateTemplate();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=products_template.xlsx');
        res.send(buffer);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const uploadProducts = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const result = await productService.bulkUpload(req.file.buffer);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
