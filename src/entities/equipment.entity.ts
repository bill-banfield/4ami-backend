import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { AssetStatus } from '../common/enums/asset-status.enum';
import { User } from './user.entity';
import { Project } from './project.entity';
import { Industry } from './industry.entity';
import { AssetClass } from './asset-class.entity';
import { Make } from './make.entity';
import { Model } from './model.entity';

@Entity('equipments')
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number;

  // Hierarchical classification - IDs
  @Column()
  industryId: number;

  @Column()
  assetClassId: number;

  @Column()
  makeId: number;

  @Column()
  modelId: number;

  // Hierarchical classification - Denormalized names (lowercase)
  @Column()
  industryName: string;

  @Column()
  assetClassName: string;

  @Column()
  makeName: string;

  @Column()
  modelName: string;

  // Physical specifications
  @Column({ type: 'int', nullable: true })
  yearOfManufacture: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Length in meters' })
  length: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Width in meters' })
  width: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Height in meters' })
  height: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Weight in pounds' })
  weight: number;

  @Column({ type: 'text', nullable: true })
  specialTransportationConsideration: string;

  // Financial data
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
  metadata: Record<string, any>;

  @Column({ nullable: true })
  projectId: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  // Relations to hierarchical tables
  @ManyToOne(() => Industry, (industry) => industry.equipments)
  @JoinColumn({ name: 'industryId' })
  industry: Industry;

  @ManyToOne(() => AssetClass, (assetClass) => assetClass.equipments)
  @JoinColumn({ name: 'assetClassId' })
  assetClass: AssetClass;

  @ManyToOne(() => Make, (make) => make.equipments)
  @JoinColumn({ name: 'makeId' })
  make: Make;

  @ManyToOne(() => Model, (model) => model.equipments)
  @JoinColumn({ name: 'modelId' })
  model: Model;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Normalize names to lowercase before insert/update
  @BeforeInsert()
  @BeforeUpdate()
  normalizeNames() {
    if (this.industryName) {
      this.industryName = this.industryName.toLowerCase().trim();
    }
    if (this.assetClassName) {
      this.assetClassName = this.assetClassName.toLowerCase().trim();
    }
    if (this.makeName) {
      this.makeName = this.makeName.toLowerCase().trim();
    }
    if (this.modelName) {
      this.modelName = this.modelName.toLowerCase().trim();
    }
  }
}
