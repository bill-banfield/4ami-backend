import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetClassesService } from './asset-classes.service';
import { AssetClassesController } from './asset-classes.controller';
import { AssetClass } from '../../entities/asset-class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetClass])],
  controllers: [AssetClassesController],
  providers: [AssetClassesService],
  exports: [AssetClassesService],
})
export class AssetClassesModule {}
