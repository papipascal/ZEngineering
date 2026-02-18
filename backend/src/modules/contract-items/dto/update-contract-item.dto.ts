import { PartialType } from '@nestjs/swagger';
import { CreateContractItemDto } from './create-contract-item.dto.js';

export class UpdateContractItemDto extends PartialType(CreateContractItemDto) {}
