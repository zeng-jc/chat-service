import { Global, Module, OnModuleInit } from '@nestjs/common';
import { MinioClientService } from './minio.service';
import { MinioModule } from 'nestjs-minio-client';
import { minioConfig } from './minio.config';
import { bucketNameEnum } from './minio.bucket-name';

@Global()
@Module({
  imports: [MinioModule.register(minioConfig)],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule implements OnModuleInit {
  constructor(private readonly minioClientService: MinioClientService) {}
  async onModuleInit() {
    await this.minioClientService.createBucket(bucketNameEnum);
  }
}
