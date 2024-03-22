import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from 'typeorm';

import { ConversationsEntity } from './conversations.entity';

@Entity({ name: 'users' })
export class UsersEntity {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ type: 'varchar', length: 255, unique: true })
  username!: string;
  @Column({ nullable: true })
  avatar?: string;
  // select: false不会返给前端
  @Column({ type: 'varchar', length: 500, select: false })
  password!: string;
  @Column({ type: 'varchar', length: 10 })
  nickname!: string;
  // 0: 女生，1：男生，2：未知
  @Column({ default: 2 })
  gender?: number;
  @Column({ type: 'varchar', length: 255, unique: true })
  email?: string;
  @Column({ default: 1 })
  status!: number;
  @Column({ type: 'tinyint', default: 1 })
  level?: number;
  @Column({ type: 'varchar', length: 30, nullable: true })
  phone?: string;
  @CreateDateColumn({ type: 'timestamp' })
  createTime: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updateTime: Date;
  @OneToMany(() => ConversationsEntity, (ConversationsEntity) => ConversationsEntity.user)
  conversations: ConversationsEntity[];
}
