"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./src/config/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
function resetDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('🔌 Conectando a la base de datos...');
            yield database_1.AppDataSource.initialize();
            console.log('✅ Conectado exitosamente');
            // Desactivar verificación de claves foráneas
            yield database_1.AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0');
            console.log('🔓 Restricciones de claves foráneas desactivadas');
            // Limpiar todas las tablas
            console.log('🗑️  Limpiando tablas...');
            yield database_1.AppDataSource.query('TRUNCATE TABLE payments');
            yield database_1.AppDataSource.query('TRUNCATE TABLE installments');
            yield database_1.AppDataSource.query('TRUNCATE TABLE credit_items');
            yield database_1.AppDataSource.query('TRUNCATE TABLE credits');
            yield database_1.AppDataSource.query('TRUNCATE TABLE products');
            yield database_1.AppDataSource.query('TRUNCATE TABLE clients');
            yield database_1.AppDataSource.query('TRUNCATE TABLE categories');
            yield database_1.AppDataSource.query('TRUNCATE TABLE users');
            console.log('✅ Todas las tablas limpiadas');
            // Reactivar verificación de claves foráneas
            yield database_1.AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1');
            console.log('🔒 Restricciones de claves foráneas reactivadas');
            // Crear usuario administrador
            const adminUsername = 'admin';
            const adminPassword = 'Admin123!';
            const hashedPassword = yield bcrypt_1.default.hash(adminPassword, 10);
            yield database_1.AppDataSource.query(`INSERT INTO users (username, password_hash, full_name, role, created_at, updated_at) 
             VALUES (?, ?, ?, ?, NOW(), NOW())`, [adminUsername, hashedPassword, 'Administrador', 'ADMIN']);
            console.log('\n✅ Base de datos reiniciada exitosamente!');
            console.log('\n📋 Credenciales del administrador:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`   Usuario:     ${adminUsername}`);
            console.log(`   Contraseña:  ${adminPassword}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            yield database_1.AppDataSource.destroy();
            process.exit(0);
        }
        catch (error) {
            console.error('❌ Error al reiniciar la base de datos:', error);
            process.exit(1);
        }
    });
}
resetDatabase();
