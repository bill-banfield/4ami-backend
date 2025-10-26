import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { ProjectEquipment } from './project-equipment.entity';

@Entity('project_utilization_scenarios')
export class ProjectUtilizationScenario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, project => project.utilizationScenarios)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ nullable: true })
  equipmentId: string;

  @ManyToOne(
    () => ProjectEquipment,
    equipment => equipment.utilizationScenarios,
  )
  @JoinColumn({ name: 'equipmentId' })
  equipment: ProjectEquipment;

  @Column({ type: 'integer', nullable: true })
  scenarioNo: number;

  @Column({ type: 'integer', nullable: true })
  terms: number;

  @Column({ type: 'integer', nullable: true })
  proposedUtilization: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
