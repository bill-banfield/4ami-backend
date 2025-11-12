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

@Entity('project_financials')
export class ProjectFinancial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  projectId: string;

  @OneToOne(() => Project, (project) => project.financial)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  subjectPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  concession: number;

  @Column({ nullable: true })
  extendedWarranty: string;

  @Column({ nullable: true })
  maintenancePMs: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
