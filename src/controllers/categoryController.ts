import { Request, Response } from 'express';
import { categoryService } from '../services/categoryService';

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await categoryService.getAll();
        res.json(categories);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCategory = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const category = await categoryService.getById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const category = await categoryService.create(req.body);
        res.status(201).json(category);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const category = await categoryService.update(id, req.body);
        res.json(category);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await categoryService.delete(id);
        res.json({ message: 'Category deleted successfully' });
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};
