import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Mission } from '../../missions/entities/mission.entity';

@Entity({ name: 'categories' })
export class Category {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => Mission, (mission) => mission.categoryRelation)
  missions?: Mission[];
}
