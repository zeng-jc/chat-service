export class UploadDto {
  fileChunk: Buffer; // 文件片段
  index: number; // 切片索引
  chunkHash: string; // 切片hash
  fileHash: string; // 整个文件hash
  fileName: string; // 文件名
  chunksCount: number; //切片数量
  fileSize: number; //文件大小
  fileType: string; //文件类型
}
