import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Project } from './project.entity';
import { ProjectUtilizationScenario } from './project-utilization-scenario.entity';

@Entity('project_equipments')
export class ProjectEquipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, project => project.equipments)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  assetClass: string;

  @Column({ nullable: true })
  make: string;

  @Column({ nullable: true })
  model: string;

  @Column({ type: 'integer', nullable: true })
  year: number;

  @Column({ type: 'integer', nullable: true })
  currentMeterReading: number;

  @Column({ nullable: true })
  meterType: string;

  @Column({ type: 'integer', nullable: true })
  proposedUtilization: number;

  @Column({ nullable: true })
  environmentRanking: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @OneToMany(() => ProjectUtilizationScenario, scenario => scenario.equipment)
  utilizationScenarios: ProjectUtilizationScenario[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
