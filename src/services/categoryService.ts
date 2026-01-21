import { AppDataSource } from '../config/database';
import { Category } from '../entities/Category';

export class CategoryService {
    private categoryRepository = AppDataSource.getRepository(Category);

    async getAll() {
        return await this.categoryRepository.find({
            order: { name: 'ASC' }
        });
    }

    async getById(id: number) {
        return await this.categoryRepository.findOneBy({ id });
    }

    async create(data: Partial<Category>) {
        const category = this.categoryRepository.create(data);
        return await this.categoryRepository.save(category);
    }

    async update(id: number, data: Partial<Category>) {
        const category = await this.categoryRepository.findOneBy({ id });
        if (!category) {
            throw new Error('Category not found');
        }
        this.categoryRepository.merge(category, data);
        return await this.categoryRepository.save(category);
    }

    async delete(id: number) {
        const result = await this.categoryRepository.delete(id);
        if (result.affected === 0) {
            throw new Error('Category not found');
        }
        return { message: 'Category deleted successfully' };
    }
}

export const categoryService = new CategoryService();
