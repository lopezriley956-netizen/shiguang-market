import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('verifications')
export class Verification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ length: 100 })
  school: string;

  @Column({ name: 'real_name', length: 50 })
  realName: string;

  @Column({ name: 'student_no_hash', length: 64 })
  studentNoHash: string;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';

  @Column({ name: 'reviewer_id', nullable: true })
  reviewerId: number;

  @Column({ name: 'reviewed_at', nullable: true, type: 'datetime' })
  reviewedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
