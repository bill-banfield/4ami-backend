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
import { Make } from './make.entity';
import { Equipment } from './equipment.entity';

@Entity('models')
export class Model {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  industryId: number;

  @Column()
  assetClassId: number;

  @Column()
  makeId: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Industry, industry => industry.models)
  @JoinColumn({ name: 'industryId' })
  industry: Industry;

  @ManyToOne(() => AssetClass, assetClass => assetClass.models)
  @JoinColumn({ name: 'assetClassId' })
  assetClass: AssetClass;

  @ManyToOne(() => Make, make => make.models)
  @JoinColumn({ name: 'makeId' })
  make: Make;

  @OneToMany(() => Equipment, equipment => equipment.model)
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
