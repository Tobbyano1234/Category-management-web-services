import { Global, Module } from '@nestjs/common';
import { PaginationService } from './services';

@Global()
@Module({
  providers: [PaginationService],
  exports: [PaginationService],
})
export class SharedModule {}
