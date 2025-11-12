import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiProcessor } from './processors/ai.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ai-processing',
    }),
  ],
  providers: [AiService, AiProcessor],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
