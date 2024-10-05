import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { NotFoundException } from '@nestjs/common';

describe('CategoryController', () => {
  let controller: CategoryController;
  let categoryService: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            addCategory: jest.fn(),
            removeCategory: jest.fn(),
            fetchSubtree: jest.fn(),
            moveSubtree: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addCategory', () => {
    it('should create a new category', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'New Category',
        parentId: null,
      };
      const expectedResult = {
        message: 'Category created successfully',
        category: {
          id: 1,
          name: 'New Category',
          parentId: null,
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      jest
        .spyOn(categoryService, 'addCategory')
        .mockResolvedValue(expectedResult);

      const result = await controller.addCategory(createCategoryDto);

      expect(result).toEqual(expectedResult);
      expect(categoryService.addCategory).toHaveBeenCalledWith(
        createCategoryDto,
      );
    });
  });

  describe('removeCategory', () => {
    it('should remove a category', async () => {
      const categoryId = 1;

      jest
        .spyOn(categoryService, 'removeCategory')
        .mockResolvedValue(undefined);

      await controller.removeCategory(categoryId);

      expect(categoryService.removeCategory).toHaveBeenCalledWith(categoryId);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      const categoryId = 999;

      jest
        .spyOn(categoryService, 'removeCategory')
        .mockRejectedValue(new NotFoundException());

      await expect(controller.removeCategory(categoryId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('fetchSubtree', () => {
    it('should fetch a category subtree', async () => {
      const categoryId = 1;
      const expectedResult = {
        message: 'Category fetched successfully',
        category: { id: 1, name: 'Root', children: [] },
      };

      jest
        .spyOn(categoryService, 'fetchSubtree')
        .mockResolvedValue(expectedResult);

      const result = await controller.fetchSubtree(categoryId);

      expect(result).toEqual(expectedResult);
      expect(categoryService.fetchSubtree).toHaveBeenCalledWith(categoryId);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      const categoryId = 999;

      jest
        .spyOn(categoryService, 'fetchSubtree')
        .mockRejectedValue(new NotFoundException());

      await expect(controller.fetchSubtree(categoryId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('moveSubtree', () => {
    it('should move a category to a new parent', async () => {
      const categoryId = 1;
      const updateCategoryDto: UpdateCategoryDto = { newParentId: 2 };
      const expectedResult = {
        message: 'Category moved successfully',
        category: {
          id: 1,
          name: 'Moved',
          parentId: 2,
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      jest
        .spyOn(categoryService, 'moveSubtree')
        .mockResolvedValue(expectedResult);

      const result = await controller.moveSubtree(
        categoryId,
        updateCategoryDto,
      );

      expect(result).toEqual(expectedResult);
      expect(categoryService.moveSubtree).toHaveBeenCalledWith(
        categoryId,
        updateCategoryDto,
      );
    });

    it('should throw NotFoundException if category does not exist', async () => {
      const categoryId = 999;
      const updateCategoryDto: UpdateCategoryDto = { newParentId: 2 };

      jest
        .spyOn(categoryService, 'moveSubtree')
        .mockRejectedValue(new NotFoundException());

      await expect(
        controller.moveSubtree(categoryId, updateCategoryDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
