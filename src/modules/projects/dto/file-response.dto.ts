import { ApiProperty } from '@nestjs/swagger';

export class FileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  originalFileName: string;

  @ApiProperty()
  fileSize: number;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty({ required: false })
  category?: string;

  @ApiProperty()
  createdAt: Date;
}

export class FileUploadResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: [FileResponseDto] })
  attachments: FileResponseDto[];
}
