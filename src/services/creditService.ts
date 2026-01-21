import { AppDataSource } from '../config/database';
import { Credit, CreditStatus } from '../entities/Credit';
import { Client } from '../entities/Client';
import { Installment, InstallmentStatus } from '../entities/Installment';
import { Payment, PaymentType } from '../entities/Payment';
import { CreditItem } from '../entities/CreditItem';
import { Product } from '../entities/Product';
import { InventoryTransaction, TransactionType } from '../entities/InventoryTransaction';
import { addMonths, format } from 'date-fns';

export class CreditService {
    private creditRepository = AppDataSource.getRepository(Credit);
    private clientRepository = AppDataSource.getRepository(Client);
    private installmentRepository = AppDataSource.getRepository(Installment);
    private paymentRepository = AppDataSource.getRepository(Payment);
    private productRepository = AppDataSource.getRepository(Product);
    private inventoryTransactionRepository = AppDataSource.getRepository(InventoryTransaction);
    private creditItemRepository = AppDataSource.getRepository(CreditItem);

    async createCredit(clientId: number, amount: number, interestRate: number, installmentsCount: number, startDate: Date, items?: { productId: number, quantity: number, unitPrice: number }[]) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const client = await this.clientRepository.findOneBy({ id: clientId });
            if (!client) throw new Error('Client not found');

            // Use the amount provided by frontend (already includes interest calculation)
            const finalAmount = amount;

            // If items are provided, validate stock only (don't recalculate amount)
            if (items && items.length > 0) {
                for (const item of items) {
                    const product = await this.productRepository.findOneBy({ id: item.productId });
                    if (!product) throw new Error(`Product ${item.productId} not found`);

                    if (product.stock_quantity < item.quantity) {
                        throw new Error(`Insufficient stock for product: ${product.name}`);
                    }
                }
            }

            const credit = this.creditRepository.create({
                client_id: clientId,
                total_amount: finalAmount,
                interest_rate: interestRate,
                number_of_installments: installmentsCount,
                current_balance: finalAmount,
                status: CreditStatus.ACTIVE,
                start_date: format(startDate, 'yyyy-MM-dd')
            });

            const savedCredit = await queryRunner.manager.save(credit);

            // Handle Items and Inventory
            if (items && items.length > 0) {
                for (const item of items) {
                    const product = await this.productRepository.findOneBy({ id: item.productId });
                    if (!product) continue; // Should have been caught above

                    // Create Credit Item
                    const creditItem = this.creditItemRepository.create({
                        credit_id: savedCredit.id,
                        product_id: item.productId,
                        quantity: item.quantity,
                        unit_price: item.unitPrice,
                        subtotal: Number(item.quantity) * Number(item.unitPrice)
                    });
                    await queryRunner.manager.save(creditItem);

                    // Update Inventory
                    const previousStock = product.stock_quantity;
                    product.stock_quantity -= item.quantity;
                    await queryRunner.manager.save(product);

                    // Log Transaction
                    const transaction = this.inventoryTransactionRepository.create({
                        product_id: item.productId,
                        type: TransactionType.OUT,
                        quantity: item.quantity,
                        previous_stock: previousStock,
                        new_stock: product.stock_quantity,
                        reference: `CREDIT-#${savedCredit.id}`,
                        description: `Sale on Credit #${savedCredit.id}`
                    });
                    await queryRunner.manager.save(transaction);
                }
            }

            // Generate Installments
            const r = interestRate / 100;
            let monthlyPayment = 0;
            if (r > 0) {
                monthlyPayment = finalAmount * r * Math.pow(1 + r, installmentsCount) / (Math.pow(1 + r, installmentsCount) - 1);
            } else {
                monthlyPayment = finalAmount / installmentsCount;
            }

            const installments: Installment[] = [];
            let remainingBalance = finalAmount;
            let currentDate = new Date(startDate);

            for (let i = 1; i <= installmentsCount; i++) {
                const dueDate = addMonths(currentDate, i);
                const interest = remainingBalance * r;
                const capital = monthlyPayment - interest;

                const installment = this.installmentRepository.create({
                    credit_id: savedCredit.id,
                    installment_number: i,
                    due_date: format(dueDate, 'yyyy-MM-dd'),
                    capital_amount: parseFloat(capital.toFixed(2)),
                    interest_amount: parseFloat(interest.toFixed(2)),
                    total_amount: parseFloat(monthlyPayment.toFixed(2)),
                    status: InstallmentStatus.PENDING
                });

                installments.push(installment);
                remainingBalance -= capital;
            }

            await queryRunner.manager.save(installments);

            // Recalculate global debt (using normal repository is fine as it's separate check usually, but better in transaction)
            // Ideally we sum up all active credits + this new one. 
            // For simplicity, let's just add this amount to existing global_debt or fetch fresh.
            // Using existing method logic but inline for transaction safety:
            client.global_debt = Number(client.global_debt) + Number(finalAmount);
            await queryRunner.manager.save(client);

            await queryRunner.commitTransaction();
            return savedCredit;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getCredits() {
        return await this.creditRepository.find({
            relations: ['client'],
            order: { created_at: 'DESC' }
        });
    }

    async getCreditDetails(creditId: number) {
        return await this.creditRepository.findOne({
            where: { id: creditId },
            relations: ['installments', 'payments', 'client', 'items', 'items.product']
        });
    }

    async recalculateGlobalDebt(clientId: number) {
        const credits = await this.creditRepository.find({ where: { client_id: clientId, status: CreditStatus.ACTIVE } });
        let totalDebt = 0;
        for (const c of credits) {
            totalDebt += Number(c.current_balance);
        }
        await this.clientRepository.update(clientId, { global_debt: totalDebt });
    }

    async registerPayment(creditId: number, amount: number, paymentType: PaymentType, notes?: string) {
        const credit = await this.creditRepository.findOne({
            where: { id: creditId },
            relations: ['installments', 'client']
        });

        if (!credit) throw new Error('Credit not found');
        if (credit.status === CreditStatus.PAID) throw new Error('Credit is already paid');

        const payment = this.paymentRepository.create({
            credit_id: creditId,
            amount,
            payment_type: paymentType,
            notes
        });
        await this.paymentRepository.save(payment);

        let remainingAmount = amount;

        if (paymentType === PaymentType.FULL_PAYMENT) {
            credit.current_balance = 0;
            credit.status = CreditStatus.PAID;
            for (const inst of credit.installments) {
                if (inst.status !== InstallmentStatus.PAID) {
                    inst.status = InstallmentStatus.PAID;
                    inst.amount_paid = inst.total_amount;
                    inst.paid_date = new Date();
                    await this.installmentRepository.save(inst);
                }
            }
        } else if (paymentType === PaymentType.INSTALLMENT) {
            const pendingInstallments = credit.installments
                .filter(i => i.status !== InstallmentStatus.PAID)
                .sort((a, b) => a.installment_number - b.installment_number);

            for (const inst of pendingInstallments) {
                if (remainingAmount <= 0.01) break;
                const pendingForThis = Number(inst.total_amount) - Number(inst.amount_paid);

                if (remainingAmount >= pendingForThis) {
                    inst.amount_paid = Number(inst.total_amount);
                    inst.status = InstallmentStatus.PAID;
                    inst.paid_date = new Date();
                    remainingAmount -= pendingForThis;
                } else {
                    inst.amount_paid = Number(inst.amount_paid) + remainingAmount;
                    if (Math.abs(inst.amount_paid - inst.total_amount) < 0.1) {
                        inst.amount_paid = inst.total_amount;
                        inst.status = InstallmentStatus.PAID;
                        inst.paid_date = new Date();
                    } else {
                        inst.status = InstallmentStatus.PARTIAL;
                    }
                    remainingAmount = 0;
                }
                await this.installmentRepository.save(inst);
            }
            credit.current_balance = Math.max(0, Number(credit.current_balance) - amount);
            if (credit.current_balance <= 0) credit.status = CreditStatus.PAID;
        } else {
            credit.current_balance = Math.max(0, Number(credit.current_balance) - amount);
        }

        await this.creditRepository.save(credit);
        await this.recalculateGlobalDebt(credit.client_id);
        return credit;
    }
}
