import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ErrorMessages } from '../../common';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $queryRaw: jest.fn().mockResolvedValue([]),
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  })),
}));

describe('CategoryService', () => {
  let service: CategoryService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: {
            category: {
              create: jest.fn(),
              delete: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Category service should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Prisma service should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  describe('addCategory', () => {
    it('should create a new category', async () => {
      const categoryData = { name: 'Test Category', parentId: null };
      const expectedResult = {
        id: 1,
        name: 'Test Category',
        parentId: null,
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prismaService.category, 'create')
        .mockResolvedValue(expectedResult);

      const result = await service.addCategory(categoryData);

      expect(result.message).toEqual('Category created successfully');
      expect(prismaService.category.create).toHaveBeenCalledTimes(1);
      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: categoryData,
        include: { children: true },
      });
      expect(result.category).toEqual(expectedResult);
    });

    it('should add a category with a valid name and parentId', async () => {
      const categoryData = { name: 'Electronics', parentId: 2 };
      const expectedResult = {
        id: 1,
        name: 'Electronics',
        parentId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prismaService.category, 'create')
        .mockResolvedValue(expectedResult);

      const result = await service.addCategory(categoryData);

      expect(result.message).toEqual('Category created successfully');
      expect(result.category).toEqual(expectedResult);
      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: categoryData,
        include: { children: true },
      });
      expect(prismaService.category.create).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if parent category does not exist', async () => {
      const categoryData = { name: 'Electronics', parentId: 2 };

      jest
        .spyOn(prismaService.category, 'create')
        .mockRejectedValue(new NotFoundException('Category not found'));

      await expect(service.addCategory(categoryData)).rejects.toThrow(
        'Category not found',
      );
    });

    it('should throw ConflictException when category name already exists', async () => {
      const categoryData = { name: 'Electronics', parentId: 2 };

      jest
        .spyOn(prismaService.category, 'create')
        .mockRejectedValue(new ConflictException(ErrorMessages.CATEGORY_EXIST));

      await expect(service.addCategory(categoryData)).rejects.toThrow(
        ErrorMessages.CATEGORY_EXIST,
      );
    });
  });

  describe('removeCategory', () => {
    it('should remove a category when it exists', async () => {
      const categoryId = 1;
      const mockCategory = {
        id: categoryId,
        name: 'Test Category',
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prismaService.category, 'findUnique')
        .mockResolvedValue(mockCategory);
      jest
        .spyOn(prismaService.category, 'delete')
        .mockResolvedValue(mockCategory);

      const result = await service.removeCategory(categoryId);

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(prismaService.category.delete).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(result).toEqual({ message: 'Category deleted successfully' });
    });

    it('should throw NotFoundException when category does not exist', async () => {
      const categoryId = 999; // Non-existent ID

      jest.spyOn(prismaService.category, 'findUnique').mockResolvedValue(null);

      await expect(service.removeCategory(categoryId)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(prismaService.category.delete).not.toHaveBeenCalled();
    });
  });

  describe('fetchSubtree', () => {
    it('should return the category with its children when it exists', async () => {
      const categoryId = 1;
      const mockQueryResult = [
        {
          id: 1,
          name: 'Root Category',
          parentId: null,
          createdAt: new Date('2024-10-05T15:18:36.185Z'),
          updatedAt: new Date('2024-10-05T15:18:36.185Z'),
        },
        {
          id: 2,
          name: 'Child 1',
          parentId: 1,
          createdAt: new Date('2024-10-05T15:18:36.185Z'),
          updatedAt: new Date('2024-10-05T15:18:36.185Z'),
        },
        {
          id: 3,
          name: 'Child 2',
          parentId: 1,
          createdAt: new Date('2024-10-05T15:18:36.185Z'),
          updatedAt: new Date('2024-10-05T15:18:36.185Z'),
        },
      ];

      const mockQueryRaw = jest.fn().mockResolvedValue(mockQueryResult);
      (service as any).prisma.$queryRaw = mockQueryRaw;

      const result = await service.fetchSubtree(categoryId);

      expect(result).toEqual({
        message: 'Category fetched successfully',
        category: {
          id: 1,
          name: 'Root Category',
          parentId: null,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          children: [
            {
              id: 2,
              name: 'Child 1',
              parentId: 1,
              createdAt: expect.any(Date),
              updatedAt: expect.any(Date),
              children: [],
            },
            {
              id: 3,
              name: 'Child 2',
              parentId: 1,
              createdAt: expect.any(Date),
              updatedAt: expect.any(Date),
              children: [],
            },
          ],
        },
      });

      expect(mockQueryRaw).toHaveBeenCalled();
    });

    it('should throw NotFoundException if category does not exist', async () => {
      const categoryId = 999; // Non-existent ID

      const mockQueryRaw = jest.fn().mockResolvedValue([]);
      (service as any).prisma.$queryRaw = mockQueryRaw;

      await expect(service.fetchSubtree(categoryId)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockQueryRaw).toHaveBeenCalled();
    });
  });

  describe('moveSubtree', () => {
    it('should move a category to a new parent', async () => {
      const categoryId = 1;
      const newParentId = 2;
      const expectedResult = {
        id: categoryId,
        name: 'Moved Category',
        parentId: newParentId,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
      };

      jest
        .spyOn(prismaService.category, 'findUnique')
        .mockResolvedValueOnce({
          id: categoryId,
          name: 'Moved Category',
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }) // For the category to be moved
        .mockResolvedValueOnce({
          id: newParentId,
          name: 'New Parent',
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }); // For the new parent

      jest
        .spyOn(prismaService.category, 'update')
        .mockResolvedValue(expectedResult);

      const result = await service.moveSubtree(categoryId, { newParentId });

      expect(result).toEqual({
        message: 'Category moved successfully',
        category: expectedResult,
      });
      expect(prismaService.category.update).toHaveBeenCalledWith({
        where: { id: categoryId },
        data: { parentId: newParentId },
        include: { children: true },
      });
    });

    it('should throw NotFoundException if category to be moved does not exist', async () => {
      const categoryId = 1;
      const newParentId = 2;

      jest.spyOn(prismaService.category, 'findUnique').mockResolvedValue(null);

      await expect(
        service.moveSubtree(categoryId, { newParentId }),
      ).rejects.toThrow(
        new NotFoundException(ErrorMessages.CATEGORY_NOT_FOUND),
      );
    });

    it('should throw NotFoundException if new parent category does not exist', async () => {
      const categoryId = 1;
      const newParentId = 2;

      jest
        .spyOn(prismaService.category, 'findUnique')
        .mockResolvedValueOnce({
          id: categoryId,
          name: 'Category to Move',
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .mockResolvedValueOnce(null);

      await expect(
        service.moveSubtree(categoryId, { newParentId }),
      ).rejects.toThrow(
        new NotFoundException(ErrorMessages.CATEGORY_NOT_FOUND),
      );
    });

    it('should allow moving a category to root level', async () => {
      const categoryId = 1;
      const newParentId = null;
      const expectedResult = {
        id: categoryId,
        name: 'Moved Category',
        parentId: newParentId,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
      };

      jest.spyOn(prismaService.category, 'findUnique').mockResolvedValueOnce({
        id: categoryId,
        name: 'Moved Category',
        parentId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jest
        .spyOn(prismaService.category, 'update')
        .mockResolvedValue(expectedResult);

      const result = await service.moveSubtree(categoryId, { newParentId });

      expect(result).toEqual({
        message: 'Category moved successfully',
        category: expectedResult,
      });
      expect(prismaService.category.update).toHaveBeenCalledWith({
        where: { id: categoryId },
        data: { parentId: newParentId },
        include: { children: true },
      });
    });
  });
});
