import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';

export interface GoogleSheetsConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class GoogleSheetsService {
  private oauth2Client: OAuth2Client;
  
  constructor(config: GoogleSheetsConfig) {
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  async getTokenFromCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  async createSpreadsheet(title: string) {
    const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
    
    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: title,
        },
      },
    });

    return response.data;
  }

  async syncStaffData(spreadsheetId: string, staffData: any[]) {
    const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
    
    // Prepare headers
    const headers = [
      'Employee ID',
      'Name',
      'Email',
      'Role',
      'Brand',
      'Country',
      'Status',
      'Joining Date',
      'Date of Birth',
      'Available Leave'
    ];

    // Prepare data rows
    const rows = staffData.map(staff => [
      staff.employeeId || '',
      staff.name || '',
      staff.email || '',
      staff.role || '',
      staff.brand || '',
      staff.country || '',
      staff.status || '',
      staff.joinDate ? new Date(staff.joinDate).toISOString().split('T')[0] : '',
      staff.dateOfBirth || '',
      staff.availableLeave || ''
    ]);

    const values = [headers, ...rows];

    // Clear existing data first
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Staff!A1:Z',
    });

    // Update with new data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Staff!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    return { success: true, rowCount: rows.length };
  }

  async syncDepositsData(spreadsheetId: string, depositsData: any[]) {
    const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
    
    // Prepare headers
    const headers = [
      'Staff Name',
      'Type',
      'Date',
      'Brand Name',
      'FTD Count',
      'Deposit Count'
    ];

    // Prepare data rows
    const rows = depositsData.map(deposit => [
      deposit.staffName || '',
      deposit.type || '',
      deposit.date ? new Date(deposit.date).toISOString().split('T')[0] : '',
      deposit.brandName || '',
      deposit.ftdCount || 0,
      deposit.depositCount || 0
    ]);

    const values = [headers, ...rows];

    // Clear existing data first
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Deposits!A1:Z',
    });

    // Update with new data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Deposits!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    return { success: true, rowCount: rows.length };
  }

  async syncCallReportsData(spreadsheetId: string, callReportsData: any[]) {
    const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
    
    // Prepare headers
    const headers = [
      'User Name',
      'Call Agent',
      'Date & Time',
      'Call Status',
      'Phone Number',
      'Duration',
      'Remarks',
      'Call Type'
    ];

    // Prepare data rows
    const rows = callReportsData.map(report => [
      report.userName || '',
      report.callAgentName || '',
      report.dateTime ? new Date(report.dateTime).toISOString() : '',
      report.callStatus || '',
      report.phoneNumber || '',
      report.duration || '',
      report.remarks || '',
      report.callType || ''
    ]);

    const values = [headers, ...rows];

    // Clear existing data first
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'CallReports!A1:Z',
    });

    // Update with new data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'CallReports!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    return { success: true, rowCount: rows.length };
  }

  async syncAllData(spreadsheetId: string, data: { staff: any[], deposits: any[], callReports: any[] }) {
    const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
    
    // First, ensure all sheets exist
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const existingSheets = spreadsheet.data.sheets?.map(s => s.properties?.title) || [];
    const requiredSheets = ['Staff', 'Deposits', 'CallReports'];
    
    for (const sheetName of requiredSheets) {
      if (!existingSheets.includes(sheetName)) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            }],
          },
        });
      }
    }

    // Sync all data
    await this.syncStaffData(spreadsheetId, data.staff);
    await this.syncDepositsData(spreadsheetId, data.deposits);
    await this.syncCallReportsData(spreadsheetId, data.callReports);

    return { success: true, message: 'All data synced successfully' };
  }
}
