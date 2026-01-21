import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Credit } from './Credit';
import { Product } from './Product';

@Entity('credit_items')
export class CreditItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    credit_id!: number;

    @ManyToOne(() => Credit, credit => credit.items)
    @JoinColumn({ name: 'credit_id' })
    credit!: Credit;

    @Column()
    product_id!: number;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product!: Product;

    @Column('int')
    quantity!: number;

    @Column('decimal', { precision: 12, scale: 2 })
    unit_price!: number;

    @Column('decimal', { precision: 15, scale: 2 })
    subtotal!: number;
}
