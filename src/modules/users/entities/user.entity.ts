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

  @Column({ type: 'jsonb', nullable: true })
  preferences?: Record<string, any>;

  @OneToMany(() => MissionParticipation, (participation) => participation.user)
  participations?: MissionParticipation[];

  @OneToMany(() => MissionLike, (like) => like.user)
  likes?: MissionLike[];
}
