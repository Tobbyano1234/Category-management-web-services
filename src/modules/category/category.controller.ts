import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Get,
  Patch,
  ParseIntPipe,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  apiTags,
  apiVersions,
  ErrorMessages,
  HttpExceptionInterceptor,
} from '../../common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@ApiTags(apiTags.categories)
@Controller({ version: apiVersions.v1, path: apiTags.categories })
@UseInterceptors(HttpExceptionInterceptor)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('application/json')
  @ApiOperation({ summary: 'Create new category' })
  @ApiResponse({
    status: 201,
    description: 'It creates a new category and return it in the response',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Check the response body for more details',
  })
  @ApiUnprocessableEntityResponse({ description: 'Category already exist' })
  async addCategory(@Body() createCategory: CreateCategoryDto) {
    return await this.categoryService.addCategory(createCategory);
  }

  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({
    status: 200,
    description: 'It return no content in the response',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found. Check the response body for more details',
  })
  @ApiUnprocessableEntityResponse({
    description: ErrorMessages.CATEGORY_NOT_FOUND,
  })
  @Delete(':id')
  async removeCategory(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.categoryService.removeCategory(id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiOperation({ summary: 'Get a category' })
  @ApiResponse({
    status: 200,
    description: 'It returns a category in the response',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found. Check the response body for more details',
  })
  async fetchSubtree(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.fetchSubtree(id);
  }

  @Patch(':id/move')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiOperation({ summary: 'Change a category parent' })
  @ApiResponse({
    status: 200,
    description: 'It returns the updated category in the response',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found. Check the response body for more details',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Check the response body for more details',
  })
  @ApiUnprocessableEntityResponse({
    description: ErrorMessages.CATEGORY_NOT_FOUND,
  })
  async moveSubtree(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.moveSubtree(id, updateCategoryDto);
  }
}
