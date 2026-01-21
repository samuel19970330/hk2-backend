-- Script para limpiar completamente la base de datos HK2
-- ADVERTENCIA: Este script eliminará TODOS los datos de forma PERMANENTE

-- Desactivar verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todos los datos de las tablas (en orden de dependencias)
TRUNCATE TABLE payments;
TRUNCATE TABLE installments;
TRUNCATE TABLE credit_items;
TRUNCATE TABLE credits;
TRUNCATE TABLE products;
TRUNCATE TABLE clients;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Mensaje de confirmación
SELECT 'Base de datos limpiada exitosamente' AS status;
