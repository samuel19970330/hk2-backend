import { AppDataSource } from './src/config/database';
import bcrypt from 'bcrypt';

async function resetDatabase() {
    try {
        console.log('🔌 Conectando a la base de datos...');
        await AppDataSource.initialize();
        console.log('✅ Conectado exitosamente');

        // Desactivar verificación de claves foráneas
        await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('🔓 Restricciones de claves foráneas desactivadas');

        // Limpiar todas las tablas
        console.log('🗑️  Limpiando tablas...');
        await AppDataSource.query('TRUNCATE TABLE payments');
        await AppDataSource.query('TRUNCATE TABLE installments');
        await AppDataSource.query('TRUNCATE TABLE credit_items');
        await AppDataSource.query('TRUNCATE TABLE credits');
        await AppDataSource.query('TRUNCATE TABLE products');
        await AppDataSource.query('TRUNCATE TABLE clients');
        await AppDataSource.query('TRUNCATE TABLE categories');
        await AppDataSource.query('TRUNCATE TABLE users');
        console.log('✅ Todas las tablas limpiadas');

        // Reactivar verificación de claves foráneas
        await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('🔒 Restricciones de claves foráneas reactivadas');

        // Crear usuario administrador
        const adminUsername = 'admin';
        const adminPassword = 'Admin123!';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await AppDataSource.query(
            `INSERT INTO users (username, password_hash, full_name, role, created_at, updated_at) 
             VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [adminUsername, hashedPassword, 'Administrador', 'ADMIN']
        );

        console.log('\n✅ Base de datos reiniciada exitosamente!');
        console.log('\n📋 Credenciales del administrador:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   Usuario:     ${adminUsername}`);
        console.log(`   Contraseña:  ${adminPassword}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await AppDataSource.destroy();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al reiniciar la base de datos:', error);
        process.exit(1);
    }
}

resetDatabase();
