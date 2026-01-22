-- Database Creation
CREATE DATABASE IF NOT EXISTS `hk2_credit_system`;
USE `hk2_credit_system`;

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NULL,
  `profile_image_url` VARCHAR(255) NULL,
  `role` ENUM('ADMIN') DEFAULT 'ADMIN',
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

-- Clients Table
CREATE TABLE IF NOT EXISTS `clients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `document_id` VARCHAR(255) NOT NULL UNIQUE,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NULL,
  `phone` VARCHAR(255) NULL,
  `address` TEXT NULL,
  `global_debt` DECIMAL(15, 2) DEFAULT 0.00,
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

-- Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

-- Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sku` VARCHAR(255) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  `stock_quantity` INT DEFAULT 0,
  `min_stock` INT DEFAULT 5,
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

-- Credits Table
CREATE TABLE IF NOT EXISTS `credits` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `client_id` INT NOT NULL,
  `total_amount` DECIMAL(15, 2) NOT NULL,
  `interest_rate` DECIMAL(5, 2) NOT NULL,
  `number_of_installments` INT NOT NULL,
  `current_balance` DECIMAL(15, 2) NOT NULL,
  `status` ENUM('ACTIVE', 'PAID', 'DEFAULT') DEFAULT 'ACTIVE',
  `start_date` DATE NOT NULL,
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT `FK_credits_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
);

-- Credit Items Table
CREATE TABLE IF NOT EXISTS `credit_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `credit_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(12, 2) NOT NULL,
  `subtotal` DECIMAL(15, 2) NOT NULL,
  CONSTRAINT `FK_credit_items_credit` FOREIGN KEY (`credit_id`) REFERENCES `credits` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_credit_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
);

-- Installments Table
CREATE TABLE IF NOT EXISTS `installments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `credit_id` INT NOT NULL,
  `installment_number` INT NOT NULL,
  `due_date` DATE NOT NULL,
  `capital_amount` DECIMAL(15, 2) NOT NULL,
  `interest_amount` DECIMAL(15, 2) NOT NULL,
  `total_amount` DECIMAL(15, 2) NOT NULL,
  `status` ENUM('PENDING', 'PARTIAL', 'PAID') DEFAULT 'PENDING',
  `amount_paid` DECIMAL(15, 2) DEFAULT 0.00,
  `paid_date` DATETIME NULL,
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT `FK_installments_credit` FOREIGN KEY (`credit_id`) REFERENCES `credits` (`id`) ON DELETE CASCADE
);

-- Payments Table
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `credit_id` INT NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `payment_date` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `payment_type` ENUM('INSTALLMENT', 'CAPITAL_REDUCTION', 'FULL_PAYMENT') NOT NULL,
  `notes` TEXT NULL,
  `receipt_url` VARCHAR(255) NULL,
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT `FK_payments_credit` FOREIGN KEY (`credit_id`) REFERENCES `credits` (`id`) ON DELETE CASCADE
);

-- Inventory Transactions Table
CREATE TABLE IF NOT EXISTS `inventory_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `type` ENUM('IN', 'OUT') NOT NULL,
  `quantity` INT NOT NULL,
  `previous_stock` INT NOT NULL,
  `new_stock` INT NOT NULL,
  `reference` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT `FK_inventory_transactions_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
);
