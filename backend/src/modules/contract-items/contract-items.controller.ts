import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ContractItemsService } from './contract-items.service.js';
import { CreateContractItemDto } from './dto/create-contract-item.dto.js';
import { UpdateContractItemDto } from './dto/update-contract-item.dto.js';
import { FilterContractItemsDto } from './dto/filter-contract-items.dto.js';
import { ContractItemType } from '@prisma/client';

@ApiTags('Contract Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/contract-items')
export class ContractItemsController {
  constructor(private readonly service: ContractItemsService) {}

  @Get()
  @ApiOperation({ summary: 'List contract items (requirements or changes)' })
  findAll(@Query() filter: FilterContractItemsDto) {
    return this.service.findAll(filter);
  }

  @Post()
  @ApiOperation({ summary: 'Create a contract item' })
  create(@Body() dto: CreateContractItemDto) {
    return this.service.create(dto);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import contract items from Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        projectId: { type: 'string' },
        type: { type: 'string', enum: ['REQUIREMENT', 'CHANGE'] },
      },
      required: ['file', 'projectId', 'type'],
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  importExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body('projectId') projectId: string,
    @Body('type') type: ContractItemType,
  ) {
    return this.service.importFromExcel(file, projectId, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contract item by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contract item' })
  update(@Param('id') id: string, @Body() dto: UpdateContractItemDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contract item' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
