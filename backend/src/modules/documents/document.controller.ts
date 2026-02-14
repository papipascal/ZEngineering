import {
  Controller, Get, Post, Delete, Param, Query, Body,
  UseGuards, UseInterceptors, UploadedFile, Request, Res,
  ParseFilePipe, MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import * as express from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { DocumentService } from './document.service.js';
import { UploadDocumentDto } from './dto/upload-document.dto.js';
import { DocumentFilterDto } from './dto/document-filter.dto.js';
import { ShareDocumentDto } from './dto/share-document.dto.js';

@ApiTags('Documents')
@Controller('api/documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        projectId: { type: 'string' },
        category: { type: 'string' },
        description: { type: 'string' },
        equipmentId: { type: 'string' },
        vendorId: { type: 'string' },
        discussionId: { type: 'string' },
        commentId: { type: 'string' },
      },
      required: ['file', 'projectId'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.documentService.upload(file, dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List documents with optional filters' })
  findAll(@Query() filter: DocumentFilterDto) {
    return this.documentService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document metadata' })
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a document' })
  async download(@Param('id') id: string, @Res() res: express.Response) {
    const { stream, contentType, fileName } = await this.documentService.download(id);
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
    });
    stream.pipe(res);
  }

  @Get(':id/presigned-url')
  @ApiOperation({ summary: 'Get a pre-signed download URL (1 hour)' })
  getPresignedUrl(@Param('id') id: string) {
    return this.documentService.getPresignedUrl(id);
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Share a document via email' })
  share(
    @Param('id') id: string,
    @Body() dto: ShareDocumentDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.documentService.share(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  remove(@Param('id') id: string) {
    return this.documentService.remove(id);
  }
}
