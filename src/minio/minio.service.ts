import { Injectable } from '@nestjs/common';
import { MinioClient, MinioService } from 'nestjs-minio-client';
import { bucketNameEnum } from './minio.bucket-name';
import * as Minio from 'minio';

@Injectable()
export class MinioClientService {
  private readonly bucketName = 'upload';
  constructor(private readonly minio: MinioService) {}
  get client(): MinioClient {
    return this.minio.client;
  }

  async createBucket(bucketName: string): Promise<void>;
  async createBucket(bucketName: object): Promise<void>;
  async createBucket(bucketName: string | object): Promise<void> {
    if (typeof bucketName === 'string') {
      !(await this.client.bucketExists(bucketName)) && (await this.client.makeBucket(bucketName));
    } else {
      await Promise.all(
        Object.keys(bucketName).map(async (key) => {
          !(await this.client.bucketExists(bucketNameEnum[key])) && (await this.client.makeBucket(bucketNameEnum[key]));
        }),
      );
    }
  }

  async uploadFile(file: Express.Multer.File, bucketName: string = this.bucketName): Promise<string> {
    const metaData = { 'Content-Type': file.mimetype };
    let res;
    try {
      res = await this.client.putObject(bucketName, file.originalname, file.buffer, metaData);
    } catch (error) {
      console.log(error);
    }
    return res;
  }

  async uploadFiles(files: Express.Multer.File[], bucketName: string = this.bucketName): Promise<string[]> {
    const promises = files.map(async (file) => {
      await this.client.putObject(bucketName, file.originalname, file.buffer, file.size, {
        'Content-Type': file.mimetype,
      });
    });
    await Promise.all(promises);
    return files.map((file) => file.originalname);
  }

  async getFileUrl(filename: string, bucketName: string = this.bucketName): Promise<string> {
    return await this.client.presignedGetObject(bucketName, filename, 60 * 60 * 12); // 12小时有效期
  }

  async getFileUrls(fileNames: string[], bucketName: string = this.bucketName): Promise<string[]> {
    const urls = await Promise.all(
      fileNames?.map(async (filename) => {
        return this.client.presignedGetObject(bucketName, filename, 12 * 60 * 60); // 12小时有效期
      }) ?? [],
    );
    return urls;
  }

  async deleteFile(fileName: string[], bucketName: string): Promise<boolean>;
  async deleteFile(fileName: string, bucketName: string): Promise<boolean>;
  async deleteFile(fileName: string | string[], bucketName: string = this.bucketName): Promise<boolean> {
    try {
      if (Array.isArray(fileName)) {
        await this.client.removeObjects(bucketName, fileName);
      }
      if (typeof fileName === 'string') {
        await this.client.removeObject(bucketName, fileName);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  async uploadChunk(bucketName: string = this.bucketName, fileName: string, fileChunk: Buffer): Promise<string> {
    let res;
    try {
      res = await this.client.putObject(bucketName, fileName, Buffer.from(fileChunk));
    } catch (error) {
      console.log(error);
    }
    return res;
  }

  async mergeFile(chunkIds: string[], fileName: string, bucketName: string) {
    // 创建源列表（每个CopySourceOptions对象指定了源分片所在的桶和对象名称）
    const sourceList = chunkIds.map(
      (name) =>
        new Minio.CopySourceOptions({
          Bucket: bucketName,
          Object: name,
        }),
    );
    // 创建目标选项（每个CopyDestinationOptions对象，指定合并后文件的目标桶和对象名称）
    const destOption = new Minio.CopyDestinationOptions({
      Bucket: bucketName,
      Object: fileName,
    });
    return this.client.composeObject(destOption, sourceList);
  }

  async removeFile(bucketName: string, fileNameList: string[]) {
    await this.client.removeObjects(bucketName, fileNameList);
  }
}
