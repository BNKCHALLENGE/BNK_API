import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { MissionParticipation } from '../../missions/entities/mission-participation.entity';
import { MissionLike } from '../../missions/entities/mission-like.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', name: 'profile_image_url' })
  profileImageUrl!: string;

  @Column({ type: 'varchar', nullable: true })
  gender?: string;

  @Column({ type: 'int', nullable: true })
  age?: number;

  @Column({ type: 'int', name: 'coin_balance', default: 0 })
  coinBalance!: number;

  @Column({ type: 'jsonb', nullable: true })
  preferences?: Record<string, any>;

  @Column({ type: 'varchar', name: 'fcm_token', nullable: true })
  fcmToken?: string | null;

  @OneToMany(() => MissionParticipation, (participation) => participation.user)
  participations?: MissionParticipation[];

  @OneToMany(() => MissionLike, (like) => like.user)
  likes?: MissionLike[];
}
