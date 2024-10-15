import { Injectable } from '@nestjs/common';
import { UploadDto } from './dto/create-upload.dto';
import { MinioClientService } from '../minio/minio.service';
import { bucketNameEnum } from '../minio/minio.bucket-name';
import { DatabaseService } from 'src/database/database.service';
import { UploadsEntity } from 'src/database/entities';

const bucketName = bucketNameEnum.upload;
@Injectable()
export class UploadService {
  constructor(
    private readonly database: DatabaseService,
    private readonly minioClientService: MinioClientService,
  ) {}
  async upload(uploadDto: UploadDto) {
    const { fileChunk, index, chunkHash, fileHash, fileName, fileSize, fileType } = uploadDto;
    const chunkId = `${index}-${chunkHash}`;

    await this.database.entityManager.transaction(async (transactionalEntityManager) => {
      // 把分片存储到minio
      await this.minioClientService.uploadChunk(bucketName, chunkId, fileChunk);

      // 使用悲观锁定查询文件信息
      const fileInfo = await transactionalEntityManager.findOne(UploadsEntity, {
        where: { fileHash },
        select: ['chunkIds'],
        // 使用 pessimistic_write 锁定模式时，数据库会在读取记录的同时对其加写锁。这意味着在事务完成之前，其他事务无法对这条记录进行更新或删除操，只能等待。
        lock: { mode: 'pessimistic_write' },
      });

      if (!fileInfo) {
        await transactionalEntityManager.save(UploadsEntity, {
          bucketName,
          fileName,
          fileHash,
          fileSize,
          fileType,
          chunkIds: [chunkId],
        });
      } else {
        // 把分片信息存储到数据库
        await transactionalEntityManager.update(
          UploadsEntity,
          { fileHash },
          {
            chunkIds: [...fileInfo.chunkIds, chunkId],
          },
        );
      }
    });

    return true;
  }

  async checkChunk({ fileHash, chunkHash, index }: Omit<UploadDto, 'fileChunk'>) {
    const chunkId = `${index}-${chunkHash}`;
    const fileInfo = await this.database.uploadsRepo.findOne({
      where: {
        fileHash,
      },
    });
    if (!fileInfo?.chunkIds) {
      return false;
    }
    return fileInfo?.chunkIds.includes(chunkId);
  }

  async merge({ fileHash }: { fileHash: string }) {
    try {
      const { chunkIds, id, fileName } = await this.database.uploadsRepo.findOne({
        where: {
          fileHash,
        },
        select: ['chunkIds', 'id', 'fileName'],
      });
      chunkIds.sort((a, b) => parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]));
      await this.minioClientService.mergeFile(chunkIds, `${id}-${fileHash}-${fileName}`, bucketName);
      await this.minioClientService.removeFile(bucketName, chunkIds);
      return true;
    } catch (error) {
      console.log('error', error);
      return false;
    }
  }
}
