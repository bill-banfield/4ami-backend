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
import { AssetClass } from './asset-class.entity';
import { Model } from './model.entity';
import { Equipment } from './equipment.entity';

@Entity('makes')
export class Make {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  industryId: number;

  @Column()
  assetClassId: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Industry, (industry) => industry.makes)
  @JoinColumn({ name: 'industryId' })
  industry: Industry;

  @ManyToOne(() => AssetClass, (assetClass) => assetClass.makes)
  @JoinColumn({ name: 'assetClassId' })
  assetClass: AssetClass;

  @OneToMany(() => Model, (model) => model.make)
  models: Model[];

  @OneToMany(() => Equipment, (equipment) => equipment.make)
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
