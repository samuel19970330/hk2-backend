import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';

export class ProductService {
    private productRepository = AppDataSource.getRepository(Product);

    async create(data: Partial<Product>) {
        const existing = await this.productRepository.findOneBy({ sku: data.sku });
        if (existing) {
            throw new Error('Product with this SKU already exists');
        }

        const product = this.productRepository.create(data);
        return await this.productRepository.save(product);
    }

    async getAll(page: number = 1, limit: number = 20, search?: string) {
        const query = this.productRepository.createQueryBuilder('product');

        if (search) {
            query.where('product.name LIKE :search OR product.sku LIKE :search', { search: `%${search}%` });
        }

        query.skip((page - 1) * limit).take(limit).orderBy('product.name', 'ASC');

        const [products, total] = await query.getManyAndCount();

        return {
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    async updateStock(id: number, quantityChange: number) {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) throw new Error('Product not found');

        product.stock_quantity += quantityChange;
        return await this.productRepository.save(product);
    }

    async update(id: number, data: Partial<Product>) {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) {
            throw new Error('Product not found');
        }

        // Check if SKU is being changed and if it conflicts with another product
        if (data.sku && data.sku !== product.sku) {
            const existing = await this.productRepository.findOneBy({ sku: data.sku });
            if (existing) {
                throw new Error('Product with this SKU already exists');
            }
        }

        Object.assign(product, data);
        return await this.productRepository.save(product);
    }

    async delete(id: number) {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) {
            throw new Error('Product not found');
        }
        await this.productRepository.remove(product);
        return { message: 'Product deleted successfully' };
    }
}
