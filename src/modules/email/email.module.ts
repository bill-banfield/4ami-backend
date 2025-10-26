import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailProcessor } from './processors/email.processor';
import { EmailProviderFactory } from './providers/email-provider.factory';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [EmailService, EmailProcessor, EmailProviderFactory],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule implements OnModuleInit {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  onModuleInit() {
    console.log('📧 EmailModule initialized');

    // Add event listeners for Bull queue
    this.emailQueue.on('completed', (job, result) => {
      console.log(`✅ Email job ${job.id} completed:`, result);
    });

    this.emailQueue.on('failed', (job, err) => {
      console.error(`❌ Email job ${job.id} failed:`, err);
    });

    this.emailQueue.on('stalled', job => {
      console.warn(`⚠️ Email job ${job.id} stalled`);
    });

    this.emailQueue.on('active', job => {
      console.log(`🔄 Email job ${job.id} is now active`);
    });
  }
}
