import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ProjectStatus } from '../common/enums/project-status.enum';
import { User } from './user.entity';
import { Company } from './company.entity';
import { ProjectType } from './project-type.entity';
import { ProjectClient } from './project-client.entity';
import { ProjectSource } from './project-source.entity';
import { ProjectEquipment } from './project-equipment.entity';
import { ProjectFinancial } from './project-financial.entity';
import { ProjectTransaction } from './project-transaction.entity';
import { ProjectUtilizationScenario } from './project-utilization-scenario.entity';
import { Asset } from './asset.entity';
import { Report } from './report.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  projectNumber: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.DRAFT,
  })
  status: ProjectStatus;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ nullable: true })
  projectTypeId: string;

  @ManyToOne(() => ProjectType, (type) => type.projects)
  @JoinColumn({ name: 'projectTypeId' })
  projectType: ProjectType;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => User, (user) => user.projects)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // New Relations for Residual Analysis
  @OneToOne(() => ProjectClient, (client) => client.project, { cascade: true })
  client: ProjectClient;

  @OneToOne(() => ProjectSource, (source) => source.project, { cascade: true })
  source: ProjectSource;

  @OneToOne(() => ProjectFinancial, (financial) => financial.project, { cascade: true })
  financial: ProjectFinancial;

  @OneToOne(() => ProjectTransaction, (transaction) => transaction.project, { cascade: true })
  transaction: ProjectTransaction;

  @OneToMany(() => ProjectEquipment, (equipment) => equipment.project, { cascade: true })
  equipments: ProjectEquipment[];

  @OneToMany(() => ProjectUtilizationScenario, (scenario) => scenario.project, { cascade: true })
  utilizationScenarios: ProjectUtilizationScenario[];

  // Old Relations
  @OneToMany(() => Asset, (asset) => asset.project)
  assets: Asset[];

  @OneToMany(() => Report, (report) => report.project)
  reports: Report[];
}
