import { PartialType } from '@nestjs/swagger';
import { CreateMakeDto } from './create-make.dto';

export class UpdateMakeDto extends PartialType(CreateMakeDto) {}
