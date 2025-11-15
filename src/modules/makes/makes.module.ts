import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MakesService } from './makes.service';
import { MakesController } from './makes.controller';
import { Make } from '../../entities/make.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Make])],
  controllers: [MakesController],
  providers: [MakesService],
  exports: [MakesService],
})
export class MakesModule {}
