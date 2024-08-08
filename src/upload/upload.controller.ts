import { Controller, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadDto } from './dto/create-upload.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('fileChunk', {
      limits: {
        fileSize: 6 * 1024 * 1024,
      },
    }),
  )
  async updateUser(@UploadedFile() fileChunk: Blob, @Body() uploadDto: UploadDto) {
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve(1);
      }, 200),
    );
    return this.uploadService.upload(uploadDto);
  }
}
