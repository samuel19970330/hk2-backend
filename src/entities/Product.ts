import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    sku!: string;

    @Column()
    name!: string;

    @Column({ nullable: true })
    category!: string;

    @Column('text', { nullable: true })
    description!: string;

    @Column('decimal', { precision: 12, scale: 2 })
    price!: number;

    @Column({ default: 0 })
    stock_quantity!: number;

    @Column({ default: 5 })
    min_stock!: number;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
