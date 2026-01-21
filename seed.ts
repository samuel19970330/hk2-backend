import 'reflect-metadata';
import dotenv from 'dotenv';
import { AppDataSource } from './src/config/database';
import { AuthService } from './src/services/authService';

dotenv.config();

const seed = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');

        const authService = new AuthService();
        try {
            await authService.registerAdmin('admin', 'admin123', 'System Administrator');
            console.log('Admin user created');
        } catch (e: any) {
            console.log('Admin creation skipped:', e.message);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding:', error);
        process.exit(1);
    }
};

seed();
