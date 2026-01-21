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
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./src/config/database");
const authService_1 = require("./src/services/authService");
dotenv_1.default.config();
const seed = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.AppDataSource.initialize();
        console.log('Database connected');
        const authService = new authService_1.AuthService();
        try {
            yield authService.registerAdmin('admin', 'admin123', 'System Administrator');
            console.log('Admin user created');
        }
        catch (e) {
            console.log('Admin creation skipped:', e.message);
        }
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding:', error);
        process.exit(1);
    }
});
seed();
