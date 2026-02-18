import {
  Controller, Get, Post, Delete, Patch, Query, Param, Body,
  UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SearchService } from './search.service.js';
import { GlobalSearchDto } from './dto/global-search.dto.js';
import { SaveSearchDto } from './dto/save-search.dto.js';

@ApiTags('Search')
@Controller('api/search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across all entities' })
  search(@Query() dto: GlobalSearchDto, @Request() req: any) {
    return this.searchService.search(dto, req.user.id);
  }

  @Post('save')
  @ApiOperation({ summary: 'Save a search bookmark' })
  save(@Body() dto: SaveSearchDto, @Request() req: any) {
    return this.searchService.saveSearch(dto, req.user.id);
  }

  @Get('saved')
  @ApiOperation({ summary: 'List saved and pinned searches' })
  listSaved(@Query('projectId') projectId: string, @Request() req: any) {
    return this.searchService.listSavedSearches(projectId, req.user.id);
  }

  @Get('recent')
  @ApiOperation({ summary: 'List recent team searches' })
  listRecent(@Query('projectId') projectId: string) {
    return this.searchService.listRecentSearches(projectId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a saved search' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.searchService.deleteSearch(id, req.user.id, req.user.role);
  }

  @Patch(':id/pin')
  @ApiOperation({ summary: 'Toggle pin on a saved search' })
  togglePin(@Param('id') id: string, @Request() req: any) {
    return this.searchService.togglePin(id, req.user.id);
  }
}
