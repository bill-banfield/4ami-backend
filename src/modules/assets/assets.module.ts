import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { Asset } from '../../entities/asset.entity';
import { Project } from '../../entities/project.entity';
import { User } from '../../entities/user.entity';
import { AssetProcessor } from './processors/asset.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, Project, User]),
    BullModule.registerQueue({
      name: 'asset-import',
    }),
  ],
  providers: [AssetsService, AssetProcessor],
  controllers: [AssetsController],
  exports: [AssetsService],
})
export class AssetsModule {}
