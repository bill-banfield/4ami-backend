import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Report } from '../../entities/report.entity';
import { Project } from '../../entities/project.entity';
import { Asset } from '../../entities/asset.entity';
import { User } from '../../entities/user.entity';
import { ReportProcessor } from './processors/report.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, Project, Asset, User]),
    BullModule.registerQueue({
      name: 'report-generation',
    }),
  ],
  providers: [ReportsService, ReportProcessor],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
