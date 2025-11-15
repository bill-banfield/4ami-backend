import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('project_transactions')
export class ProjectTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  projectId: string;

  @OneToOne(() => Project, project => project.transaction)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'integer', nullable: true })
  currentMeter: number;

  @Column({ type: 'integer', nullable: true })
  proposedAnnualUtilization: number;

  @Column({ nullable: true })
  meterUnit: string;

  @Column({ nullable: true })
  maintenanceRecords: string;

  @Column({ nullable: true })
  inspectionReport: string;

  @Column({ type: 'integer', nullable: true })
  terms: number;

  @Column({ nullable: true })
  structure: string;

  @Column({ nullable: true })
  application: string;

  @Column({ nullable: true })
  environment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
