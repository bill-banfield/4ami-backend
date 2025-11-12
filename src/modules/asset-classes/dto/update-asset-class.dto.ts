import { PartialType } from '@nestjs/swagger';
import { CreateAssetClassDto } from './create-asset-class.dto';

export class UpdateAssetClassDto extends PartialType(CreateAssetClassDto) {}
