// Google Apps Script file: submit.gs
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
    
    // Calculate CPL and ROAS
    const cpl = data.budget / data.lead;
    const roas = 0; // Will be updated when revenue data is available
    
    // Prepare row data - adjust column order based on your sheet structure
    const rowData = [
      data.tanggal,
      data.vendor,
      data.channel,
      data.budget,
      data.lead,
      cpl,
      roas,
      0, // revenue - to be updated by CS
      new Date(), // timestamp
      data.role,
      '', // notes
      '', // follow_up
      '', // closing
    ];
    
    // Add new row
    sheet.appendRow(rowData);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'PPC data added successfully'
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
    
    // For CS data, we might want to update existing rows or add new follow-up data
    // This is a simplified version - you might want to implement more complex logic
    
    const rowData = [
      data.tanggal,
      'CS Team',
      'Follow-up',
      0, // budget
      data.inboundLead,
      0, // cpl
      data.revenue / (data.inboundLead * 10000), // simplified ROAS calculation
      data.revenue,
      new Date(), // timestamp
      data.role,
      'CS Follow-up data',
      data.followUp,
      data.closing
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'CS data added successfully'
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
        const columnIndex = getColumnIndex(key); // You'll need to implement this
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
  
  // Set up headers if they don't exist
  const headers = [
    'tanggal',
    'vendor',
    'channel',
    'budget',
    'lead',
    'CPL',
    'ROAS',
    'revenue',
    'timestamp',
    'role',
    'notes',
    'follow_up',
    'closing'
  ];
  
  // Check if headers already exist
  const firstRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (firstRow.length === 0 || firstRow[0] === '') {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f0f0f0');
  }
}
