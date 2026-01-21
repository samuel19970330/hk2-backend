import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import bcrypt from 'bcrypt';

async function resetAdmin() {
    try {
        await AppDataSource.initialize();
        console.log("Database connected.");

        const userRepository = AppDataSource.getRepository(User);
        let user = await userRepository.findOneBy({ username: 'admin' });

        const hashedPassword = await bcrypt.hash('password123', 10);

        if (user) {
            console.log("User 'admin' found. Updating password...");
            user.password_hash = hashedPassword;
            await userRepository.save(user);
            console.log("Password updated successfully.");
        } else {
            console.log("User 'admin' not found. Creating new admin user...");
            user = userRepository.create({
                username: 'admin',
                password_hash: hashedPassword,
                full_name: 'Admin User',
                role: UserRole.ADMIN
            });
            await userRepository.save(user);
            console.log("New admin user created successfully.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error resetting admin:", error);
        process.exit(1);
    }
}

resetAdmin();
