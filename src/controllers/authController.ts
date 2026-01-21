import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const result = await authService.login(username, password);
        res.json(result);
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
};

export const register = async (req: Request, res: Response) => { // Internal use only
    try {
        const { username, password, fullName } = req.body;
        const user = await authService.registerAdmin(username, password, fullName);
        res.status(201).json({ message: 'User created', userId: user.id });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        // @ts-ignore - user is attached by middleware
        const userId = req.user.userId;
        const user = await authService.getUserById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            role: user.role
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { full_name, password } = req.body;
        const updatedUser = await authService.updateUser(userId, { full_name, password });
        res.json({
            id: updatedUser.id,
            username: updatedUser.username,
            full_name: updatedUser.full_name,
            role: updatedUser.role
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
