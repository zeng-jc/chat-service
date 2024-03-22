import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from './users.entity';
import { ChatsEntity } from './chats.entity';

@Entity({ name: 'conversations' })
export class ConversationsEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'text' })
  userMessage: string;
  @Column({ nullable: true, type: 'text' })
  aiMessage: string;
  @Column()
  userId: number;
  @Column()
  chatId: number;
  @CreateDateColumn({ type: 'timestamp' })
  createTime: Date;
  @ManyToOne(() => UsersEntity, (UsersEntity) => UsersEntity.conversations, {
    onDelete: 'CASCADE',
  })
  user: UsersEntity;
  @ManyToOne(() => ChatsEntity, (ChatsEntity) => ChatsEntity.conversations, {
    onDelete: 'CASCADE',
  })
  chat: ChatsEntity;
}
