export class ErrorMessages {
  static CATEGORY_EXIST = 'Category already exist';
  static CATEGORY_NOT_FOUND = 'Category not found';

  static categoryNotFound(id: string) {
    return `Category with id ${id} not found`;
  }
}
