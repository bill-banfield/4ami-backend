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

@Entity('project_clients')
export class ProjectClient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  projectId: string;

  @OneToOne(() => Project, (project) => project.client)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ nullable: true })
  clientName: string;

  @Column({ nullable: true })
  clientEmail: string;

  @Column({ nullable: true })
  lesseePhone: string;

  @Column({ nullable: true })
  countryCode: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  communicationPreference: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
