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
    const {
      fileChunk,
      index,
      chunkHash,
      fileHash,
      fileName,
      fileSize,
      fileType,
    } = uploadDto;
    const chunkId = `${index}-${chunkHash}`;

    await this.database.entityManager.transaction(
      async (transactionalEntityManager) => {
        // 把分片存储到minio
        await this.minioClientService.uploadChunk(
          bucketName,
          chunkId,
          fileChunk,
        );

        // 使用悲观锁定查询文件信息
        const fileInfo = await transactionalEntityManager.findOne(
          UploadsEntity,
          {
            where: { fileHash },
            select: ['chunkIds'],
            // 使用 pessimistic_write 锁定模式时，数据库会在读取记录的同时对其加写锁。这意味着在事务完成之前，其他事务无法对这条记录进行更新或删除操，只能等待。
            lock: { mode: 'pessimistic_write' },
          },
        );

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
      },
    );

    return true;
  }

  async checkChunk({
    fileHash,
    chunkHash,
    index,
  }: Omit<UploadDto, 'fileChunk'>) {
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
      const { chunkIds, id, fileName } =
        await this.database.uploadsRepo.findOne({
          where: {
            fileHash,
          },
          select: ['chunkIds', 'id', 'fileName'],
        });
      chunkIds.sort(
        (a, b) => parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]),
      );
      await this.minioClientService.mergeFile(
        chunkIds,
        `${id}-${fileHash}-${fileName}`,
        bucketName,
      );
      await this.minioClientService.removeFile(bucketName, chunkIds);
      return true;
    } catch (error) {
      console.log('error', error);
      return false;
    }
  }

  /**
   * 清空所有文件：删除数据库记录和 MinIO 中的文件
   */
  async clearAll() {
    try {
      // 查询所有上传记录
      const allUploads = await this.database.uploadsRepo.find({
        select: ['id', 'fileHash', 'fileName', 'chunkIds'],
      });

      // 收集所有需要删除的文件名
      const fileNamesToDelete: string[] = [];

      for (const upload of allUploads) {
        // 如果文件已合并，合并后的文件格式为：${id}-${fileHash}-${fileName}
        const mergedFileName = `${upload.id}-${upload.fileHash}-${upload.fileName}`;
        fileNamesToDelete.push(mergedFileName);

        // 如果还有分片文件（未合并的文件），也需要删除
        if (upload.chunkIds && upload.chunkIds.length > 0) {
          fileNamesToDelete.push(...upload.chunkIds);
        }
      }

      // 从 MinIO 删除所有文件
      if (fileNamesToDelete.length > 0) {
        await this.minioClientService.removeFile(bucketName, fileNamesToDelete);
      }

      // 删除数据库中的所有记录
      await this.database.uploadsRepo.delete({});

      return {
        success: true,
        deletedRecords: allUploads.length,
        deletedFiles: fileNamesToDelete.length,
      };
    } catch (error) {
      console.error('清空文件失败:', error);
      throw error;
    }
  }
}
