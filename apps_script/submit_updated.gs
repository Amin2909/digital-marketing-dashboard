// Google Apps Script file: submit_updated.gs
// Deploy this as a Web App with execute permissions set to "Anyone"

// Configuration
const SPREADSHEET_ID = 'your-spreadsheet-id'; // Replace with your actual spreadsheet ID
const SHEET_NAME = 'data_iklan_new_global'; // Your sheet name

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getData') {
      return getData();
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Invalid action'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'addPPCData') {
      return addPPCData(data.data);
    } else if (action === 'addCSData') {
      return addCSData(data.data);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Invalid action'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getData() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Sheet not found: ' + SHEET_NAME);
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'success',
          data: []
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get all data from row 2 onwards (assuming row 1 has headers)
    const range = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
    const values = range.getValues();
    
    // Get headers from row 1
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Convert to array of objects
    const data = values.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        data: data
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addPPCData(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Sheet not found: ' + SHEET_NAME);
    }
    
    // Calculate CPL
    const cpl = data.totalLead > 0 ? data.budget / data.totalLead : 0;
    const roas = 0; // Will be updated when revenue data is available
    
    // Prepare row data sesuai struktur baru
    const rowData = [
      data.tanggal,                     // A: tanggal
      data.vendor,                      // B: vendor
      'PPC Campaign',                   // C: channel
      data.budget,                      // D: budget
      data.totalLead,                   // E: lead
      Math.round(cpl),                  // F: CPL
      roas,                             // G: ROAS
      0,                                // H: revenue - to be updated by CS
      new Date(),                       // I: timestamp
      data.role,                        // J: role
      `Campaign: ${data.campaign}`,     // K: notes
      '',                               // L: follow_up
      '',                               // M: closing
      data.campaign,                    // N: campaign
      data.leadBerdu,                   // O: leadBerdu
      '',                               // P: totalLeadFollowUp
      '',                               // Q: ghosting
      '',                               // R: duplicate
      ''                                // S: closingPercentage
    ];
    
    // Add new row
    sheet.appendRow(rowData);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'PPC data berhasil disimpan ke spreadsheet'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addCSData(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Sheet not found: ' + SHEET_NAME);
    }
    
    // Calculate revenue (simplified: Rp 2juta per closing)
    const avgRevenuePerClosing = 2000000;
    const revenue = data.closing * avgRevenuePerClosing;
    const roas = data.totalLeadFollowUp > 0 ? revenue / (data.totalLeadFollowUp * 50000) : 0;
    
    // Get CS name from session or use default
    const csName = data.csName || 'CS';
    
    // Prepare row data sesuai struktur baru
    const rowData = [
      data.tanggal,                     // A: tanggal
      `${csName} (CS)`,                 // B: vendor
      'Follow-up',                      // C: channel
      0,                                // D: budget
      data.totalLeadFollowUp,           // E: lead
      0,                                // F: CPL
      Math.round(roas * 100) / 100,     // G: ROAS
      revenue,                          // H: revenue
      new Date(),                       // I: timestamp
      data.role,                        // J: role
      'CS Follow-up data',              // K: notes
      data.totalLeadFollowUp,           // L: follow_up
      data.closing,                     // M: closing
      '',                               // N: campaign
      '',                               // O: leadBerdu
      data.totalLeadFollowUp,           // P: totalLeadFollowUp
      data.ghosting,                    // Q: ghosting
      data.duplicate,                   // R: duplicate
      data.closingPercentage            // S: closingPercentage
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'CS data berhasil disimpan ke spreadsheet'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper function to find and update existing rows (optional)
function updateExistingRow(sheet, searchDate, searchVendor, updateData) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;
  
  const range = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
  const values = range.getValues();
  
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    if (row[0] === searchDate && row[1] === searchVendor) {
      // Update the row
      const rowNumber = i + 2; // +2 because array is 0-indexed and we start from row 2
      
      // Update specific columns based on updateData
      Object.keys(updateData).forEach(key => {
        const columnIndex = getColumnIndex(key);
        if (columnIndex !== -1) {
          sheet.getRange(rowNumber, columnIndex + 1).setValue(updateData[key]);
        }
      });
      
      return true;
    }
  }
  
  return false;
}

// Helper function to get column index by header name
function getColumnIndex(headerName) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  return headers.indexOf(headerName);
}

// Function to set up the sheet with proper headers (run once)
function setupSheet() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    throw new Error('Sheet not found: ' + SHEET_NAME);
  }
  
  // Set up headers sesuai struktur baru
  const headers = [
    'tanggal',              // A
    'vendor',               // B
    'channel',              // C
    'budget',               // D
    'lead',                 // E
    'CPL',                  // F
    'ROAS',                 // G
    'revenue',              // H
    'timestamp',            // I
    'role',                 // J
    'notes',                // K
    'follow_up',            // L
    'closing',              // M
    'campaign',             // N
    'leadBerdu',            // O
    'totalLeadFollowUp',    // P
    'ghosting',             // Q
    'duplicate',            // R
    'closingPercentage'     // S
  ];
  
  // Check if headers already exist
  const firstRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (firstRow.length === 0 || firstRow[0] === '') {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f0f0f0');
    headerRange.setBorder(true, true, true, true, true, true);
  }
  
  Logger.log('Sheet setup completed with ' + headers.length + ' columns');
}

// Function to get summary statistics (optional)
function getSummaryStats() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { totalRows: 0, ppcCount: 0, csCount: 0 };
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    
    let ppcCount = 0;
    let csCount = 0;
    let totalBudget = 0;
    let totalLead = 0;
    let totalRevenue = 0;
    
    data.forEach(row => {
      const role = row[9]; // role column
      if (role === 'PPC') {
        ppcCount++;
        totalBudget += Number(row[3]) || 0; // budget
        totalLead += Number(row[4]) || 0;   // lead
      } else if (role === 'CS') {
        csCount++;
        totalRevenue += Number(row[7]) || 0; // revenue
      }
    });
    
    return {
      totalRows: data.length,
      ppcCount: ppcCount,
      csCount: csCount,
      totalBudget: totalBudget,
      totalLead: totalLead,
      totalRevenue: totalRevenue,
      avgCPL: totalLead > 0 ? totalBudget / totalLead : 0
    };
    
  } catch (error) {
    Logger.log('Error getting summary stats: ' + error.toString());
    return { error: error.toString() };
  }
}
