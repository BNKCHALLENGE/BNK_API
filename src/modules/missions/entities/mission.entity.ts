import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { MissionParticipation } from './mission-participation.entity';
import { MissionLike } from './mission-like.entity';

@Entity({ name: 'missions' })
export class Mission {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'varchar', name: 'image_url' })
  imageUrl!: string;

  @Column({ type: 'varchar' })
  location!: string;

  @Column({ type: 'varchar', name: 'location_detail' })
  locationDetail!: string;

  @Column({ type: 'float' })
  distance!: number;

  @Column({ type: 'int', name: 'coin_reward' })
  coinReward!: number;

  @Column({ type: 'varchar' })
  category!: string;

  @ManyToOne(() => Category, (category) => category.missions, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category' })
  categoryRelation?: Category | null;

  @Column({ type: 'varchar', name: 'end_date' })
  endDate!: string;

  @Column({ type: 'text' })
  insight!: string;

  @Column({ type: 'text', array: true, name: 'verification_methods', default: () => 'ARRAY[]::text[]' })
  verificationMethods!: string[];

  @Column({ type: 'jsonb', nullable: true })
  coordinates?: {
    lat: number;
    lng: number;
  };

  @Column({ type: 'boolean', default: false, name: 'is_liked' })
  isLiked!: boolean;

  @OneToMany(() => MissionParticipation, (participation) => participation.mission)
  participations?: MissionParticipation[];

  @OneToMany(() => MissionLike, (like) => like.mission)
  likes?: MissionLike[];
}
