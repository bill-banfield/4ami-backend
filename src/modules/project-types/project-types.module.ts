import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectTypesService } from './project-types.service';
import { ProjectTypesController } from './project-types.controller';
import { ProjectType } from '../../entities/project-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectType]),
  ],
  providers: [ProjectTypesService],
  controllers: [ProjectTypesController],
  exports: [ProjectTypesService],
})
export class ProjectTypesModule {}
