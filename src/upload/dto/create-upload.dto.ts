export class UploadDto {
  fileChunk: Blob;
  fileName: string;
  chunkHash: string;
  index: number;
  chunksCount: number;
  fileHash: string;
}
