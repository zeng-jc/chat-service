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
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async update(@UploadedFile() fileChunk: Express.Multer.File, @Body() uploadDto: UploadDto) {
    uploadDto.fileChunk = fileChunk.buffer;
    return this.uploadService.upload(uploadDto);
  }

  @Post('check')
  async checkChunk(@Body() data: Omit<UploadDto, 'fileChunk'>) {
    return this.uploadService.checkChunk(data);
  }

  @Post('merge')
  async merge(@Body() data: { fileHash: string }) {
    return this.uploadService.merge(data);
  }
}
