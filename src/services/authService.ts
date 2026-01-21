import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);

    async login(username: string, password: string) {
        const user = await this.userRepository.findOneBy({ username });

        if (!user) {
            throw new Error('User not found');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '24h' }
        );

        return { token, user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role } };
    }

    async registerAdmin(username: string, password: string, fullName: string) {
        const existingUser = await this.userRepository.findOneBy({ username });
        if (existingUser) throw new Error('User already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepository.create({
            username,
            password_hash: hashedPassword,
            full_name: fullName,
            role: UserRole.ADMIN
        });

        await this.userRepository.save(user);
        return user;
    }

    async getUserById(id: number) {
        return await this.userRepository.findOneBy({ id });
    }

    async updateUser(id: number, data: { full_name?: string, password?: string }) {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) throw new Error('User not found');

        if (data.full_name) user.full_name = data.full_name;
        if (data.password) user.password_hash = await bcrypt.hash(data.password, 10);

        return await this.userRepository.save(user);
    }
}
