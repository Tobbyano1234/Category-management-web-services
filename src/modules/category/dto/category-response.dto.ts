import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the category',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The name of the category',
    example: 'Categoria 1',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'The ID of the parent category',
    example: 1,
  })
  parentId?: number;

  @ApiPropertyOptional({
    description: 'The child categories',
    type: [CategoryResponseDto],
  })
  children?: CategoryResponseDto[];
}
