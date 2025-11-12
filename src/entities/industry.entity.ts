import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { AssetClass } from './asset-class.entity';
import { Make } from './make.entity';
import { Model } from './model.entity';
import { Equipment } from './equipment.entity';

@Entity('industries')
export class Industry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => AssetClass, (assetClass) => assetClass.industry)
  assetClasses: AssetClass[];

  @OneToMany(() => Make, (make) => make.industry)
  makes: Make[];

  @OneToMany(() => Model, (model) => model.industry)
  models: Model[];

  @OneToMany(() => Equipment, (equipment) => equipment.industry)
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
