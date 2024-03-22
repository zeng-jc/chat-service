import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ConversationsEntity } from './conversations.entity';

@Entity({ name: 'chats' })
export class ChatsEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  userId: number;
  @Column()
  name: string;
  @CreateDateColumn({ type: 'timestamp' })
  createTime: Date;
  @OneToMany(() => ConversationsEntity, (ConversationsEntity) => ConversationsEntity.chat)
  conversations: ConversationsEntity[];
}
