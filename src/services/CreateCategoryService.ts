import { getRepository } from 'typeorm';

import Category from '../models/Category';

interface Request {
  category: string;
}

class CreateCategoryService {
  public async execute({ category }: Request): Promise<Category> {
    const categoryRepository = getRepository(Category);

    let categoryExists = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!categoryExists) {
      const newCategory = await categoryRepository.create({
        title: category,
      });

      categoryExists = await categoryRepository.save(newCategory);
    }

    return categoryExists;
  }
}

export default CreateCategoryService;
