import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    description: 'The new parent ID for the category',
    example: 2,
  })
  @IsInt()
  newParentId: number;
}
