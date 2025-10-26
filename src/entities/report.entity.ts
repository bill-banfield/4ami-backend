import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReportStatus } from '../common/enums/report-status.enum';
import { Project } from './project.entity';
import { User } from './user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.GENERATING,
  })
  status: ReportStatus;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  filePath: string;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  generatedAt: Date;

  @Column({ nullable: true })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.reports)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ nullable: true })
  generatedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'generatedById' })
  generatedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
