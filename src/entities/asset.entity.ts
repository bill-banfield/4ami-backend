import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AssetStatus } from '../common/enums/asset-status.enum';
import { User } from './user.entity';
import { Project } from './project.entity';
import { ResidualForm } from './residual-form.entity';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  type: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  value: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  residualValue: number;

  @Column({
    type: 'enum',
    enum: AssetStatus,
    default: AssetStatus.ACTIVE,
  })
  status: AssetStatus;

  @Column({ type: 'jsonb', nullable: true })
  properties: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.assets)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => User, (user) => user.assets)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => ResidualForm, (form) => form.asset)
  residualForms: ResidualForm[];
}
