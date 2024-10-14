import { Injectable } from '@nestjs/common';
import { UploadDto } from './dto/create-upload.dto';
import { MinioClientService } from '../minio/minio.service';
import { bucketNameEnum } from '../minio/minio.bucket-name';
import { DatabaseService } from 'src/database/database.service';

const bucketName = bucketNameEnum.upload;
@Injectable()
export class UploadService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly minioClientService: MinioClientService,
  ) {}
  async upload(uploadDto: UploadDto) {
    const { fileChunk, index, chunkHash, fileHash, fileName, fileSize, fileType } = uploadDto;
    const chunkId = `${index}-${chunkHash}`;
    // 把分片存储到minio
    await this.minioClientService.uploadChunk(bucketName, chunkId, fileChunk);
    // 查询文件信息
    const fileInfo = await this.databaseService.uploadsRepo.findOne({
      where: {
        fileHash,
      },
      select: ['chunkIds'],
    });
    if (!fileInfo?.chunkIds) {
      await this.databaseService.uploadsRepo.save({
        bucketName,
        fileName,
        fileHash,
        fileSize,
        fileType,
        chunkIds: [chunkId],
      });
      return true;
    }
    // 把分片信息存储到数据库
    await this.databaseService.uploadsRepo.update(
      { fileHash },
      {
        chunkIds: [...fileInfo?.chunkIds, chunkId],
      },
    );
    return true;
  }

  async checkChunk({ fileHash, chunkHash, index }: Omit<UploadDto, 'fileChunk'>) {
    const chunkId = `${index}-${chunkHash}`;
    const fileInfo = await this.databaseService.uploadsRepo.findOne({
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
      const { chunkIds, id, fileName } = await this.databaseService.uploadsRepo.findOne({
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
