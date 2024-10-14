import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'uploads' })
export class UploadsEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: 255 })
  bucketName: string;
  @Column({ type: 'varchar', length: 255 })
  fileName: string;
  @Column({ type: 'varchar', length: 255 })
  fileHash: string;
  @Column({ type: 'bigint' })
  fileSize: number;
  @Column({ type: 'varchar', length: 255 })
  fileType: string;
  @Column({ type: 'json' })
  chunkIds: string[]; // 切片索引+'-'+切片hash
  @CreateDateColumn({ type: 'timestamp' })
  createTime: Date;
}
