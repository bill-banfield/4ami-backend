import * as ExcelJS from 'exceljs';

export class ProjectExcelGenerator {
  static async generateProjectExcel(
    project: any,
    creator: any,
    company: any,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Set workbook properties
    workbook.creator = '4AMI Platform';
    workbook.created = new Date();

    // Create single worksheet with all sections
    this.createCombinedSheet(workbook, project, creator, company);

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private static createCombinedSheet(
    workbook: ExcelJS.Workbook,
    project: any,
    creator: any,
    company: any,
  ) {
    const sheet = workbook.addWorksheet('Project Details');

    // Set column widths
    sheet.columns = [{ width: 30 }, { width: 50 }];

    let currentRow = 1;

    // Section 1: Project Information
    this.addSectionHeader(sheet, currentRow++, 'PROJECT INFORMATION');
    sheet.addRow([]);
    currentRow++;

    this.addRow(sheet, 'Project Number', project.projectNumber);
    this.addRow(sheet, 'Project Name', project.name);
    this.addRow(sheet, 'Project Type', project.projectType?.name || 'N/A');
    this.addRow(sheet, 'Status', project.status?.toUpperCase());
    this.addRow(
      sheet,
      'Submit Date',
      project.submitDate
        ? new Date(project.submitDate).toLocaleString()
        : 'N/A',
    );
    this.addRow(sheet, 'Description', project.description || 'N/A');
    this.addRow(
      sheet,
      'Start Date',
      project.startDate
        ? new Date(project.startDate).toLocaleDateString()
        : 'N/A',
    );
    this.addRow(
      sheet,
      'End Date',
      project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A',
    );

    sheet.addRow([]);
    sheet.addRow(['Company Information']).font = { bold: true, size: 12 };
    this.addRow(sheet, 'Company Name', company.companyName);
    this.addRow(sheet, 'Company Email', company.companyEmail);

    sheet.addRow([]);
    sheet.addRow(['Created By']).font = { bold: true, size: 12 };
    this.addRow(sheet, 'Name', `${creator.firstName} ${creator.lastName}`);
    this.addRow(sheet, 'Email', creator.email);
    this.addRow(sheet, 'Role', creator.role);
    this.addRow(
      sheet,
      'Created At',
      new Date(project.createdAt).toLocaleString(),
    );

    // Add spacing between sections
    sheet.addRow([]);
    sheet.addRow([]);

    // Section 2: Client Information
    if (project.client) {
      this.addSectionHeader(
        sheet,
        sheet.lastRow.number + 1,
        'CLIENT INFORMATION',
      );
      sheet.addRow([]);

      this.addRow(sheet, 'Client Name', project.client.clientName || 'N/A');
      this.addRow(sheet, 'Client Email', project.client.clientEmail || 'N/A');
      this.addRow(sheet, 'Phone', project.client.lesseePhone || 'N/A');
      this.addRow(sheet, 'Country Code', project.client.countryCode || 'N/A');
      this.addRow(sheet, 'Website', project.client.website || 'N/A');
      this.addRow(
        sheet,
        'Communication Preference',
        project.client.communicationPreference ? 'Yes' : 'No',
      );

      sheet.addRow([]);
      sheet.addRow([]);
    }

    // Section 3: Source Information
    if (project.source) {
      this.addSectionHeader(
        sheet,
        sheet.lastRow.number + 1,
        'SOURCE INFORMATION',
      );
      sheet.addRow([]);

      this.addRow(sheet, 'Source Number', project.source.sourceNo || 'N/A');
      this.addRow(sheet, 'Source Name', project.source.sourceName || 'N/A');
      this.addRow(sheet, 'Source Type', project.source.sourceType || 'N/A');
      this.addRow(sheet, 'Contact', project.source.contact || 'N/A');
      this.addRow(sheet, 'Title', project.source.title || 'N/A');
      this.addRow(
        sheet,
        'Communication',
        project.source.communication ? 'Yes' : 'No',
      );
      this.addRow(sheet, 'Phone 1', project.source.phoneNumber1 || 'N/A');
      this.addRow(sheet, 'Phone 2', project.source.phoneNumber2 || 'N/A');
      this.addRow(sheet, 'Email', project.source.email || 'N/A');
      this.addRow(sheet, 'Website', project.source.website || 'N/A');

      sheet.addRow([]);
      sheet.addRow([]);
    }

    // Section 4: Equipment
    if (project.equipments && project.equipments.length > 0) {
      this.addSectionHeader(sheet, sheet.lastRow.number + 1, 'EQUIPMENT');
      sheet.addRow([]);

      this.addEquipmentTable(sheet, project.equipments);

      sheet.addRow([]);
      sheet.addRow([]);
    }

    // Section 5: Financial Information
    if (project.financial) {
      this.addSectionHeader(
        sheet,
        sheet.lastRow.number + 1,
        'FINANCIAL INFORMATION',
      );
      sheet.addRow([]);

      this.addRow(
        sheet,
        'Subject Price',
        project.financial.subjectPrice || 'N/A',
      );
      this.addRow(sheet, 'Concession', project.financial.concession || 'N/A');
      this.addRow(
        sheet,
        'Extended Warranty',
        project.financial.extendedWarranty || 'N/A',
      );
      this.addRow(
        sheet,
        'Maintenance PMs',
        project.financial.maintenancePMs || 'N/A',
      );

      sheet.addRow([]);
      sheet.addRow([]);
    }

    // Section 6: Transaction Information
    if (project.transaction) {
      this.addSectionHeader(
        sheet,
        sheet.lastRow.number + 1,
        'TRANSACTION INFORMATION',
      );
      sheet.addRow([]);

      this.addRow(
        sheet,
        'Current Meter',
        project.transaction.currentMeter || 'N/A',
      );
      this.addRow(sheet, 'Meter Unit', project.transaction.meterUnit || 'N/A');
      this.addRow(
        sheet,
        'Maintenance Records',
        project.transaction.maintenanceRecords || 'N/A',
      );
      this.addRow(
        sheet,
        'Inspection Report',
        project.transaction.inspectionReport || 'N/A',
      );
      this.addRow(sheet, 'Structure', project.transaction.structure || 'N/A');
      this.addRow(
        sheet,
        'Application',
        project.transaction.application || 'N/A',
      );
      this.addRow(
        sheet,
        'Environment',
        project.transaction.environment || 'N/A',
      );

      sheet.addRow([]);
      sheet.addRow([]);
    }

    // Section 7: Utilization Scenarios
    if (
      project.utilizationScenarios &&
      project.utilizationScenarios.length > 0
    ) {
      this.addSectionHeader(
        sheet,
        sheet.lastRow.number + 1,
        'UTILIZATION SCENARIOS',
      );
      sheet.addRow([]);

      this.addUtilizationScenariosTable(sheet, project.utilizationScenarios);
    }

    // Style the first column (labels)
    sheet.getColumn(1).font = { bold: true };
  }

  private static addSectionHeader(
    sheet: ExcelJS.Worksheet,
    rowNumber: number,
    title: string,
  ) {
    const row = sheet.getRow(rowNumber);
    row.getCell(1).value = title;
    row.getCell(1).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    row.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
    row.height = 25;

    // Merge cells for section header
    sheet.mergeCells(rowNumber, 1, rowNumber, 2);
  }

  private static addEquipmentTable(
    sheet: ExcelJS.Worksheet,
    equipments: any[],
  ) {
    // Add header row
    const headerRow = sheet.addRow([
      'Industry',
      'Asset Class',
      'Make',
      'Model',
      'Year',
      'Current Meter Reading',
      'Meter Type',
      'Proposed Utilization',
      'Environment Ranking',
      'Note',
    ]);

    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add equipment rows
    equipments.forEach(eq => {
      sheet.addRow([
        eq.industry || 'N/A',
        eq.assetClass || 'N/A',
        eq.make || 'N/A',
        eq.model || 'N/A',
        eq.year || 'N/A',
        eq.currentMeterReading || 'N/A',
        eq.meterType || 'N/A',
        eq.proposedUtilization || 'N/A',
        eq.environmentRanking || 'N/A',
        eq.note || 'N/A',
      ]);
    });

    // Auto-fit columns for equipment table
    for (let i = 1; i <= 10; i++) {
      sheet.getColumn(i).width = 20;
    }
  }

  private static addUtilizationScenariosTable(
    sheet: ExcelJS.Worksheet,
    scenarios: any[],
  ) {
    // Add header row
    const headerRow = sheet.addRow([
      'Scenario No',
      'Equipment ID',
      'Terms',
      'Proposed Utilization',
      'Unit Price',
    ]);

    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add scenario rows
    scenarios.forEach(scenario => {
      sheet.addRow([
        scenario.scenarioNo || 'N/A',
        scenario.equipmentId || 'N/A',
        scenario.terms || 'N/A',
        scenario.proposedUtilization || 'N/A',
        scenario.unitPrice || 'N/A',
      ]);
    });

    // Auto-fit columns for utilization scenarios table
    for (let i = 1; i <= 5; i++) {
      sheet.getColumn(i).width = 25;
    }
  }

  private static addRow(sheet: ExcelJS.Worksheet, label: string, value: any) {
    sheet.addRow([label, value]);
  }
}
