import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Asset } from './asset.entity';
import { User } from './user.entity';

@Entity('residual_forms')
export class ResidualForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  formData: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  aiAnalysis: Record<string, any>;

  @Column({ default: false })
  isProcessed: boolean;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  assetId: string;

  @ManyToOne(() => Asset, (asset) => asset.residualForms)
  @JoinColumn({ name: 'assetId' })
  asset: Asset;

  @Column({ nullable: true })
  submittedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'submittedById' })
  submittedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
