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

  @Column({ type: 'varchar', name: 'image_url', nullable: true })
  imageUrl?: string | null;

  @Column({ type: 'varchar', nullable: true })
  location?: string | null;

  @Column({ type: 'varchar', name: 'location_detail', nullable: true })
  locationDetail?: string | null;

  @Column({ type: 'float' })
  distance!: number;

  @Column({ type: 'int', name: 'coin_reward' })
  coinReward!: number;

  @Column({ type: 'float', name: 'priority_weight', default: 0 })
  priorityWeight!: number;

  @Column({ type: 'float', name: 'final_weight', default: 0 })
  finalWeight!: number;

  @Column({ type: 'int', name: 'req_time_min', default: 0 })
  reqTimeMin!: number;

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
