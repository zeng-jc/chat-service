import { Injectable } from '@nestjs/common';
import { UploadDto } from './dto/create-upload.dto';
import { MinioClientService } from '../minio/minio.service';
import { bucketNameEnum } from '../minio/minio.bucket-name';

const bucketName = bucketNameEnum.upload;
@Injectable()
export class UploadService {
  upload(uploadDto: UploadDto) {
    return 'This action adds a new upload';
  }
}
