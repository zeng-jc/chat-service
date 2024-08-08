import { PartialType } from '@nestjs/mapped-types';
import { UploadDto } from './create-upload.dto';

export class UpdateUploadDto extends PartialType(UploadDto) {}
