import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import * as express from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ExportService } from './export.service.js';

@ApiTags('Export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('project/:projectId/equipment')
  @ApiOperation({ summary: 'Export equipment list as CSV' })
  async exportEquipment(@Param('projectId') projectId: string, @Res() res: express.Response) {
    const csv = await this.exportService.exportEquipmentList(projectId);
    this.sendCsv(res, csv, 'equipment-list.csv');
  }

  @Get('project/:projectId/document-register')
  @ApiOperation({ summary: 'Export document register as CSV' })
  async exportDocRegister(@Param('projectId') projectId: string, @Res() res: express.Response) {
    const csv = await this.exportService.exportDocumentRegister(projectId);
    this.sendCsv(res, csv, 'document-register.csv');
  }

  @Get('project/:projectId/vendors')
  @ApiOperation({ summary: 'Export vendor list as CSV' })
  async exportVendors(@Param('projectId') projectId: string, @Res() res: express.Response) {
    const csv = await this.exportService.exportVendorList(projectId);
    this.sendCsv(res, csv, 'vendor-list.csv');
  }

  @Get('project/:projectId/contract-items')
  @ApiOperation({ summary: 'Export contract items as CSV' })
  async exportContractItems(@Param('projectId') projectId: string, @Res() res: express.Response) {
    const csv = await this.exportService.exportContractItems(projectId);
    this.sendCsv(res, csv, 'contract-items.csv');
  }

  @Get('project/:projectId/transmittals')
  @ApiOperation({ summary: 'Export transmittals as CSV' })
  async exportTransmittals(@Param('projectId') projectId: string, @Res() res: express.Response) {
    const csv = await this.exportService.exportTransmittals(projectId);
    this.sendCsv(res, csv, 'transmittals.csv');
  }

  @Get('project/:projectId/audit')
  @ApiOperation({ summary: 'Export audit log as CSV' })
  async exportAudit(@Param('projectId') projectId: string, @Res() res: express.Response) {
    const csv = await this.exportService.exportAuditLog(projectId);
    this.sendCsv(res, csv, 'audit-log.csv');
  }

  private sendCsv(res: express.Response, csv: string, filename: string) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8 compat
  }
}
