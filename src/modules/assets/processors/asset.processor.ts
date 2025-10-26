import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as csv from 'csv-parser';
import * as fs from 'fs';

import { Asset } from '../../../entities/asset.entity';
import { AssetStatus } from '../../../common/enums/asset-status.enum';

@Processor('asset-import')
@Injectable()
export class AssetProcessor {
  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
  ) {}

  @Process('bulk-import')
  async handleBulkImport(job: Job<{
    filePath: string;
    projectId?: string;
    userId: string;
    skipDuplicates?: boolean;
    updateExisting?: boolean;
  }>) {
    const { filePath, projectId, userId, skipDuplicates = true, updateExisting = false } = job.data;
    
    try {
      const assets: any[] = [];
      
      // Read and parse CSV file
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => assets.push(row))
          .on('end', resolve)
          .on('error', reject);
      });

      let processed = 0;
      let skipped = 0;
      let errors = 0;

      for (const assetData of assets) {
        try {
          // Check if asset already exists (by name and type)
          const existingAsset = await this.assetRepository.findOne({
            where: {
              name: assetData.name,
              type: assetData.type,
            },
          });

          if (existingAsset) {
            if (skipDuplicates) {
              skipped++;
              continue;
            } else if (updateExisting) {
              // Update existing asset
              Object.assign(existingAsset, {
                description: assetData.description,
                value: parseFloat(assetData.value) || existingAsset.value,
                residualValue: parseFloat(assetData.residualValue) || existingAsset.residualValue,
                properties: assetData.properties ? JSON.parse(assetData.properties) : existingAsset.properties,
                metadata: assetData.metadata ? JSON.parse(assetData.metadata) : existingAsset.metadata,
              });
              await this.assetRepository.save(existingAsset);
              processed++;
              continue;
            }
          }

          // Create new asset
          const asset = this.assetRepository.create({
            name: assetData.name,
            description: assetData.description,
            type: assetData.type,
            value: parseFloat(assetData.value) || 0,
            residualValue: parseFloat(assetData.residualValue) || 0,
            status: AssetStatus.ACTIVE,
            properties: assetData.properties ? JSON.parse(assetData.properties) : {},
            metadata: assetData.metadata ? JSON.parse(assetData.metadata) : {},
            projectId,
            createdById: userId,
          });

          await this.assetRepository.save(asset);
          processed++;
        } catch (error) {
          console.error(`Error processing asset ${assetData.name}:`, error);
          errors++;
        }
      }

      // Clean up file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return {
        processed,
        skipped,
        errors,
        total: assets.length,
      };
    } catch (error) {
      console.error('Bulk import error:', error);
      throw error;
    }
  }
}
