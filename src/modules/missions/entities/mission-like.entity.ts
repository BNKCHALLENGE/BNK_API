import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Mission } from './mission.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'mission_likes' })
export class MissionLike {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', name: 'mission_id' })
  missionId!: string;

  @Column({ type: 'varchar', name: 'user_id' })
  userId!: string;

  @Column({ type: 'boolean', default: false, name: 'is_liked' })
  isLiked!: boolean;

  @ManyToOne(() => Mission, (mission) => mission.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mission_id' })
  mission!: Mission;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
