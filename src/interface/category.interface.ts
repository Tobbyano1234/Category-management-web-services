import { Category } from '@prisma/client';

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}
