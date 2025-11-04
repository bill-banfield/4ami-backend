import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from '../../entities/project.entity';
import { User } from '../../entities/user.entity';
import { Company } from '../../entities/company.entity';
import { ProjectType } from '../../entities/project-type.entity';
import { ProjectClient } from '../../entities/project-client.entity';
import { ProjectSource } from '../../entities/project-source.entity';
import { ProjectEquipment } from '../../entities/project-equipment.entity';
import { ProjectFinancial } from '../../entities/project-financial.entity';
import { ProjectTransaction } from '../../entities/project-transaction.entity';
import { ProjectUtilizationScenario } from '../../entities/project-utilization-scenario.entity';
import { ProjectAttachment } from '../../entities/project-attachment.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      User,
      Company,
      ProjectType,
      ProjectClient,
      ProjectSource,
      ProjectEquipment,
      ProjectFinancial,
      ProjectTransaction,
      ProjectUtilizationScenario,
      ProjectAttachment,
    ]),
    EmailModule,
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
