import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import * as XLSX from 'xlsx';
import { Category } from '../entities/Category';

export class ProductService {
    private productRepository = AppDataSource.getRepository(Product);
    private categoryRepository = AppDataSource.getRepository(Category);

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
    async generateTemplate(): Promise<Buffer> {
        const headers = ['sku', 'name', 'category_name', 'price', 'stock_quantity', 'description', 'min_stock'];
        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }

    async bulkUpload(buffer: Buffer): Promise<{ success: number; errors: string[] }> {
        const wb = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        let successCount = 0;
        const errors: string[] = [];

        for (const [index, row] of data.entries()) {
            const rowIndex = index + 2; // +2 because index is 0-based and header is row 1

            try {
                // Validation
                if (!row.sku || !row.name || !row.price) {
                    errors.push(`Row ${rowIndex}: Missing required fields (sku, name, price)`);
                    continue;
                }

                // Check Category - Optional: Create if not exists or require strict matching
                // For this implementation, we'll store the category string directly as per Entity, 
                // effectively 'category' field in Product is string.
                // If the entity used a relation, we'd need to lookup the Category entity.
                // The current entity definition shows: @Column({ nullable: true }) category!: string;

                const productData: Partial<Product> = {
                    sku: String(row.sku),
                    name: String(row.name),
                    category: row.category_name ? String(row.category_name) : undefined,
                    price: Number(row.price),
                    stock_quantity: Number(row.stock_quantity) || 0,
                    min_stock: Number(row.min_stock) || 5,
                    description: row.description ? String(row.description) : undefined,
                };

                const existingProduct = await this.productRepository.findOneBy({ sku: productData.sku });

                if (existingProduct) {
                    // Update
                    Object.assign(existingProduct, productData);
                    await this.productRepository.save(existingProduct);
                } else {
                    // Create
                    const newProduct = this.productRepository.create(productData);
                    await this.productRepository.save(newProduct);
                }

                successCount++;
            } catch (err: any) {
                errors.push(`Row ${rowIndex}: ${err.message}`);
            }
        }

        return { success: successCount, errors };
    }
}
