import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';

import { IndustriesService } from '../../industries/industries.service';
import { AssetClassesService } from '../../asset-classes/asset-classes.service';
import { MakesService } from '../../makes/makes.service';
import { ModelsService } from '../../models/models.service';

@Processor('asset-import')
@Injectable()
export class AssetProcessor {
  constructor(
    private readonly industriesService: IndustriesService,
    private readonly assetClassesService: AssetClassesService,
    private readonly makesService: MakesService,
    private readonly modelsService: ModelsService,
  ) {}

  @Process('bulk-import')
  async handleBulkImport(job: Job<{
    fileBuffer: string;
    fileName: string;
    projectId?: string;
    userId: string;
    skipDuplicates?: boolean;
    updateExisting?: boolean;
  }>) {
    const { fileBuffer, fileName, skipDuplicates = true } = job.data;
    
    console.log(`Starting bulk import job ${job.id} for file: ${fileName}`);
    
    try {
      // Decode base64 buffer back to string
      const csvContent = Buffer.from(fileBuffer, 'base64').toString('utf-8');
      
      const rows: any[] = [];
      const errors: string[] = [];
      
      // Parse CSV from buffer
      await new Promise<void>((resolve, reject) => {
        const stream = Readable.from(csvContent);
        stream
          .pipe(csvParser())
          .on('data', (row) => rows.push(row))
          .on('end', () => resolve())
          .on('error', (error) => reject(error));
      });

      if (rows.length === 0) {
        throw new Error('CSV file is empty or invalid');
      }

      console.log(`Parsed ${rows.length} rows from CSV`);

      let processed = 0;
      let skipped = 0;
      let errorCount = 0;

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 because row 1 is header and we start from 0

        try {
          // Validate required fields
          if (!row.industry || !row.assetName || !row.makeName || !row.modelName) {
            errors.push(
              `Row ${rowNumber}: Missing required fields (industry, assetName, makeName, or modelName)`,
            );
            errorCount++;
            continue;
          }

          // Trim values
          const industryName = row.industry.trim();
          const assetName = row.assetName.trim();
          const makeName = row.makeName.trim();
          const modelName = row.modelName.trim();

          // Create or find industry
          const industry = await this.industriesService.findOrCreate(industryName);

          // Create or find asset class (using assetName)
          const assetClass = await this.assetClassesService.findOrCreate(
            industry.id,
            assetName,
          );

          // Create or find make
          const make = await this.makesService.findOrCreate(
            industry.id,
            assetClass.id,
            makeName,
          );

          // Create or find model (findOrCreate handles duplicates internally)
          await this.modelsService.findOrCreate(
            industry.id,
            assetClass.id,
            make.id,
            modelName,
          );

          processed++;
          
          // Log progress every 100 rows
          if (processed % 100 === 0) {
            console.log(`Processed ${processed} rows...`);
          }
        } catch (error) {
          errorCount++;
          const errorMessage = error instanceof Error ? error.message : 'Failed to process row';
          errors.push(`Row ${rowNumber}: ${errorMessage}`);
          console.error(`Error processing row ${rowNumber}:`, errorMessage);
        }
      }

      const result = {
        processed,
        skipped,
        errors: errorCount,
        total: rows.length,
        errorDetails: errors.length > 0 ? errors : undefined,
      };

      console.log(`Bulk import job ${job.id} completed:`, result);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Bulk import job ${job.id} failed:`, errorMessage);
      throw error;
    }
  }
}

