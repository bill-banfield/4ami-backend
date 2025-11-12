import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Industry } from './industry.entity';
import { Make } from './make.entity';
import { Model } from './model.entity';
import { Equipment } from './equipment.entity';

@Entity('asset_classes')
export class AssetClass {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  industryId: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Industry, (industry) => industry.assetClasses)
  @JoinColumn({ name: 'industryId' })
  industry: Industry;

  @OneToMany(() => Make, (make) => make.assetClass)
  makes: Make[];

  @OneToMany(() => Model, (model) => model.assetClass)
  models: Model[];

  @OneToMany(() => Equipment, (equipment) => equipment.assetClass)
  equipments: Equipment[];

  // Normalize name to lowercase before insert/update
  @BeforeInsert()
  @BeforeUpdate()
  normalizeName() {
    if (this.name) {
      this.name = this.name.toLowerCase().trim();
    }
  }
}
