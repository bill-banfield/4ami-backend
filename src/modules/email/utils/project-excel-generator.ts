import * as ExcelJS from 'exceljs';

export class ProjectExcelGenerator {
  static async generateProjectExcel(project: any, creator: any, company: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Set workbook properties
    workbook.creator = '4AMI Platform';
    workbook.created = new Date();

    // Create worksheets
    this.createProjectInfoSheet(workbook, project, creator, company);

    if (project.client) {
      this.createClientSheet(workbook, project.client);
    }

    if (project.source) {
      this.createSourceSheet(workbook, project.source);
    }

    if (project.equipments && project.equipments.length > 0) {
      this.createEquipmentSheet(workbook, project.equipments);
    }

    if (project.financial) {
      this.createFinancialSheet(workbook, project.financial);
    }

    if (project.transaction) {
      this.createTransactionSheet(workbook, project.transaction);
    }

    if (project.utilizationScenarios && project.utilizationScenarios.length > 0) {
      this.createUtilizationScenariosSheet(workbook, project.utilizationScenarios);
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private static createProjectInfoSheet(workbook: ExcelJS.Workbook, project: any, creator: any, company: any) {
    const sheet = workbook.addWorksheet('Project Information');

    // Set column widths
    sheet.columns = [
      { width: 25 },
      { width: 50 },
    ];

    // Add header
    sheet.addRow(['Project Information']).font = { bold: true, size: 14 };
    sheet.addRow([]);

    // Add project details
    this.addRow(sheet, 'Project Number', project.projectNumber);
    this.addRow(sheet, 'Project Name', project.name);
    this.addRow(sheet, 'Project Type', project.projectType?.name || 'N/A');
    this.addRow(sheet, 'Status', project.status?.toUpperCase());
    this.addRow(sheet, 'Description', project.description || 'N/A');
    this.addRow(sheet, 'Start Date', project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A');
    this.addRow(sheet, 'End Date', project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A');

    sheet.addRow([]);
    sheet.addRow(['Company Information']).font = { bold: true, size: 12 };
    this.addRow(sheet, 'Company Name', company.companyName);
    this.addRow(sheet, 'Company Email', company.companyEmail);

    sheet.addRow([]);
    sheet.addRow(['Created By']).font = { bold: true, size: 12 };
    this.addRow(sheet, 'Name', `${creator.firstName} ${creator.lastName}`);
    this.addRow(sheet, 'Email', creator.email);
    this.addRow(sheet, 'Role', creator.role);
    this.addRow(sheet, 'Created At', new Date(project.createdAt).toLocaleString());

    // Style the first column
    sheet.getColumn(1).font = { bold: true };
  }

  private static createClientSheet(workbook: ExcelJS.Workbook, client: any) {
    const sheet = workbook.addWorksheet('Client Information');

    sheet.columns = [
      { width: 30 },
      { width: 50 },
    ];

    sheet.addRow(['Client Information']).font = { bold: true, size: 14 };
    sheet.addRow([]);

    this.addRow(sheet, 'Client Name', client.clientName || 'N/A');
    this.addRow(sheet, 'Client Email', client.clientEmail || 'N/A');
    this.addRow(sheet, 'Phone', client.lesseePhone || 'N/A');
    this.addRow(sheet, 'Country Code', client.countryCode || 'N/A');
    this.addRow(sheet, 'Website', client.website || 'N/A');
    this.addRow(sheet, 'Communication Preference', client.communicationPreference ? 'Yes' : 'No');

    sheet.getColumn(1).font = { bold: true };
  }

  private static createSourceSheet(workbook: ExcelJS.Workbook, source: any) {
    const sheet = workbook.addWorksheet('Source Information');

    sheet.columns = [
      { width: 30 },
      { width: 50 },
    ];

    sheet.addRow(['Source Information']).font = { bold: true, size: 14 };
    sheet.addRow([]);

    this.addRow(sheet, 'Source Number', source.sourceNo || 'N/A');
    this.addRow(sheet, 'Source Name', source.sourceName || 'N/A');
    this.addRow(sheet, 'Source Type', source.sourceType || 'N/A');
    this.addRow(sheet, 'Contact', source.contact || 'N/A');
    this.addRow(sheet, 'Title', source.title || 'N/A');
    this.addRow(sheet, 'Communication', source.communication ? 'Yes' : 'No');
    this.addRow(sheet, 'Phone 1', source.phoneNumber1 || 'N/A');
    this.addRow(sheet, 'Phone 2', source.phoneNumber2 || 'N/A');
    this.addRow(sheet, 'Email', source.email || 'N/A');
    this.addRow(sheet, 'Website', source.website || 'N/A');

    sheet.getColumn(1).font = { bold: true };
  }

  private static createEquipmentSheet(workbook: ExcelJS.Workbook, equipments: any[]) {
    const sheet = workbook.addWorksheet('Equipment');

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
    ]);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

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
      ]);
    });

    // Auto-fit columns
    sheet.columns.forEach(column => {
      column.width = 20;
    });
  }

  private static createFinancialSheet(workbook: ExcelJS.Workbook, financial: any) {
    const sheet = workbook.addWorksheet('Financial Information');

    sheet.columns = [
      { width: 30 },
      { width: 50 },
    ];

    sheet.addRow(['Financial Information']).font = { bold: true, size: 14 };
    sheet.addRow([]);

    this.addRow(sheet, 'Subject Price', financial.subjectPrice || 'N/A');
    this.addRow(sheet, 'Concession', financial.concession || 'N/A');
    this.addRow(sheet, 'Extended Warranty', financial.extendedWarranty || 'N/A');
    this.addRow(sheet, 'Maintenance PMs', financial.maintenancePMs || 'N/A');

    sheet.getColumn(1).font = { bold: true };
  }

  private static createTransactionSheet(workbook: ExcelJS.Workbook, transaction: any) {
    const sheet = workbook.addWorksheet('Transaction Information');

    sheet.columns = [
      { width: 30 },
      { width: 50 },
    ];

    sheet.addRow(['Transaction Information']).font = { bold: true, size: 14 };
    sheet.addRow([]);

    this.addRow(sheet, 'Current Meter', transaction.currentMeter || 'N/A');
    this.addRow(sheet, 'Meter Unit', transaction.meterUnit || 'N/A');
    this.addRow(sheet, 'Maintenance Records', transaction.maintenanceRecords || 'N/A');
    this.addRow(sheet, 'Inspection Report', transaction.inspectionReport || 'N/A');
    this.addRow(sheet, 'Structure', transaction.structure || 'N/A');
    this.addRow(sheet, 'Application', transaction.application || 'N/A');
    this.addRow(sheet, 'Environment', transaction.environment || 'N/A');

    sheet.getColumn(1).font = { bold: true };
  }

  private static createUtilizationScenariosSheet(workbook: ExcelJS.Workbook, scenarios: any[]) {
    const sheet = workbook.addWorksheet('Utilization Scenarios');

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

    // Auto-fit columns
    sheet.columns.forEach(column => {
      column.width = 25;
    });
  }

  private static addRow(sheet: ExcelJS.Worksheet, label: string, value: any) {
    sheet.addRow([label, value]);
  }
}
