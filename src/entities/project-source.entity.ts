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

@Entity('project_sources')
export class ProjectSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  projectId: string;

  @OneToOne(() => Project, project => project.source)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ nullable: true })
  sourceNo: string;

  @Column({ nullable: true })
  sourceName: string;

  @Column({ nullable: true })
  sourceType: string;

  @Column({ nullable: true })
  contact: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  communication: boolean;

  @Column({ nullable: true })
  phoneNumber1: string;

  @Column({ nullable: true })
  phoneNumber2: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  website: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
