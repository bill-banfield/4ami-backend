import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';

import { IndustriesService } from '../../industries/industries.service';
import { AssetClassesService } from '../../asset-classes/asset-classes.service';
import { MakesService } from '../../makes/makes.service';
import { ModelsService } from '../../models/models.service';
import { Equipment } from '../../../entities/equipment.entity';
import { AssetStatus } from '../../../common/enums/asset-status.enum';

@Processor('asset-import')
@Injectable()
export class AssetProcessor {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
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
          // Support both old and new CSV header formats
          const industryField = row['Industry'] || row.industry;
          const assetClassField = row['Asset Class'] || row.assetName;
          const makeField = row['Make'] || row.makeName;
          const modelField = row['Model'] || row.modelName;

          // Validate required fields
          if (!industryField || !assetClassField || !makeField || !modelField) {
            errors.push(
              `Row ${rowNumber}: Missing required fields (Industry, Asset Class, Make, or Model)`,
            );
            errorCount++;
            continue;
          }

          // Trim values
          const industryName = industryField.trim();
          const assetClassName = assetClassField.trim();
          const makeName = makeField.trim();
          const modelName = modelField.trim();

          // Create or find industry
          const industry = await this.industriesService.findOrCreate(industryName);

          // Create or find asset class
          const assetClass = await this.assetClassesService.findOrCreate(
            industry.id,
            assetClassName,
          );

          // Create or find make
          const make = await this.makesService.findOrCreate(
            industry.id,
            assetClass.id,
            makeName,
          );

          // Create or find model
          const model = await this.modelsService.findOrCreate(
            industry.id,
            assetClass.id,
            make.id,
            modelName,
          );

          // Check if equipment already exists (prevent duplicates)
          if (skipDuplicates) {
            const existingEquipment = await this.equipmentRepository.findOne({
              where: {
                industryId: industry.id,
                assetClassId: assetClass.id,
                makeId: make.id,
                modelId: model.id,
              },
            });

            if (existingEquipment) {
              skipped++;
              continue;
            }
          }

          // Create equipment record
          const equipment = this.equipmentRepository.create({
            industryId: industry.id,
            assetClassId: assetClass.id,
            makeId: make.id,
            modelId: model.id,
            industryName: industry.name,
            assetClassName: assetClass.name,
            makeName: make.name,
            modelName: model.name,
            status: AssetStatus.ACTIVE,
            projectId: job.data.projectId || null,
            createdById: job.data.userId,
          });

          await this.equipmentRepository.save(equipment);

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

