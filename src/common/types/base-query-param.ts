import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class BaseQueryParam {
  @ApiProperty({
    description: 'The page number to retrieve',
    example: 1,
  })
  @Type(() => Number)
  @IsPositive()
  @IsNotEmpty()
  page: number;

  @ApiProperty({
    description: 'The number of items per page',
    example: 10,
  })
  @Type(() => Number)
  @IsPositive()
  @IsNotEmpty()
  pageSize: number;
}
