import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './Product';

export enum TransactionType {
    IN = 'IN',
    OUT = 'OUT'
}

@Entity('inventory_transactions')
export class InventoryTransaction {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    product_id!: number;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product!: Product;

    @Column({ type: 'enum', enum: TransactionType })
    type!: TransactionType;

    @Column()
    quantity!: number;

    @Column()
    previous_stock!: number;

    @Column()
    new_stock!: number;

    @Column({ nullable: true })
    reference!: string;

    @Column('text', { nullable: true })
    description!: string;

    @CreateDateColumn()
    created_at!: Date;
}
