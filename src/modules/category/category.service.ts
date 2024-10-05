import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorMessages } from '../../common/constants';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async addCategory(createCategoryDto: CreateCategoryDto) {
    const { name, parentId } = createCategoryDto;
    const categoryExist = await this.prisma.category.findUnique({
      where: { name },
    });
    if (categoryExist) {
      throw new ConflictException(ErrorMessages.CATEGORY_EXIST);
    }
    const category = await this.prisma.category.create({
      data: { name, parentId },
      include: { children: true },
    });
    return { message: 'Category created successfully', category };
  }

  async removeCategory(id: number) {
    // This will cascade delete all children
    const categoryExist = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!categoryExist) {
      throw new NotFoundException(ErrorMessages.CATEGORY_NOT_FOUND);
    }
    await this.prisma.category.delete({
      where: { id },
    });
    return { message: 'Category deleted successfully' };
  }

  // async fetchSubtree(id: number) {
  //   const fetchChildren = async (parentId: number): Promise<Category[]> => {
  //     const children = await this.prisma.category.findMany({
  //       where: { parentId },
  //       include: { children: true },
  //     });

  //     return Promise.all(
  //       children.map(async (child) => ({
  //         ...child,
  //         children: await fetchChildren(child.id),
  //       })),
  //     );
  //   };

  //   const rootCategory = await this.prisma.category.findUnique({
  //     where: { id },
  //   });

  //   if (!rootCategory) {
  //     throw new NotFoundException(ErrorMessages.CATEGORY_NOT_FOUND);
  //   }

  //   const children = await fetchChildren(id);
  //   const category = {
  //     ...rootCategory,
  //     children,
  //   } as CategoryWithChildren;

  //   return { message: 'Category fetched successfully', category };
  // }

  // async fetchSubtree(id: number) {
  //   const rootCategory = await this.prisma.category.findUnique({
  //     where: { id },
  //   });

  //   if (!rootCategory) {
  //     throw new NotFoundException(ErrorMessages.CATEGORY_NOT_FOUND);
  //   }

  //   const stack = [id];
  //   const categoryMap = new Map();
  //   categoryMap.set(id, { ...rootCategory, children: [] });

  //   while (stack.length > 0) {
  //     const parentId = stack.pop();
  //     const children = await this.prisma.category.findMany({
  //       where: { parentId },
  //     });

  //     for (const child of children) {
  //       categoryMap.set(child.id, { ...child, children: [] });
  //       categoryMap.get(parentId).children.push(categoryMap.get(child.id));
  //       stack.push(child.id);
  //     }
  //   }

  //   return {
  //     message: 'Category fetched successfully',
  //     category: categoryMap.get(id),
  //   };
  // }

  async fetchSubtree(id: number) {
    const result = await this.prisma.$queryRaw`
    WITH RECURSIVE Subtree AS (
      SELECT id, name, "parentId", "createdAt", "updatedAt" FROM categories WHERE id = ${id}
      UNION ALL
      SELECT c.id, c.name, c."parentId", c."createdAt", c."updatedAt"
      FROM categories c
      INNER JOIN Subtree s ON c."parentId" = s.id
    )
    SELECT * FROM Subtree;
  `;

    if (Array.isArray(result) && result.length === 0) {
      throw new NotFoundException(ErrorMessages.CATEGORY_NOT_FOUND);
    }

    const categoryMap = new Map<number, any>();
    (result as any[]).forEach((row: any) => {
      categoryMap.set(row.id, { ...row, children: [] });
    });

    (result as any[]).forEach((row: any) => {
      if (row.parentId !== null && categoryMap.has(row.parentId)) {
        categoryMap.get(row.parentId).children.push(categoryMap.get(row.id));
      }
    });

    const rootCategory = categoryMap.get(id);

    return { message: 'Category fetched successfully', category: rootCategory };
  }

  async moveSubtree(id: number, updateCategoryDto: UpdateCategoryDto) {
    const { newParentId } = updateCategoryDto;

    const categoryExist = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!categoryExist) {
      throw new NotFoundException(ErrorMessages.CATEGORY_NOT_FOUND);
    }

    if (newParentId !== null) {
      const newParentExists = await this.prisma.category.findUnique({
        where: { id: newParentId },
      });
      if (!newParentExists) {
        throw new NotFoundException(ErrorMessages.CATEGORY_NOT_FOUND);
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: { parentId: newParentId },
      include: { children: true },
    });

    return {
      message: 'Category moved successfully',
      category: updatedCategory,
    };
  }
}
