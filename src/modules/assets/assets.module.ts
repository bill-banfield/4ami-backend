import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { Asset } from '../../entities/asset.entity';
import { Project } from '../../entities/project.entity';
import { User } from '../../entities/user.entity';
import { Equipment } from '../../entities/equipment.entity';
import { AssetProcessor } from './processors/asset.processor';
import { IndustriesModule } from '../industries/industries.module';
import { AssetClassesModule } from '../asset-classes/asset-classes.module';
import { MakesModule } from '../makes/makes.module';
import { ModelsModule } from '../models/models.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, Project, User, Equipment]),
    BullModule.registerQueue({
      name: 'asset-import',
    }),
    IndustriesModule,
    AssetClassesModule,
    MakesModule,
    ModelsModule,
  ],
  providers: [AssetsService, AssetProcessor],
  controllers: [AssetsController],
  exports: [AssetsService],
})
export class AssetsModule {}
