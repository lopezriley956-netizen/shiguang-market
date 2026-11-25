import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conversation_id' })
  conversationId: number;

  @Column({ name: 'sender_id' })
  senderId: number;

  @Column({ type: 'enum', enum: ['want', 'bargain', 'system', 'text'], default: 'text' })
  type: 'want' | 'bargain' | 'system' | 'text';

  @Column({ length: 500 })
  content: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
