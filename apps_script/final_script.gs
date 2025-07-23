// Google Apps Script untuk Dashboard Marketing Digital
// Menggunakan spreadsheet: https://docs.google.com/spreadsheets/d/1SKy697_7EmR6U7ZRt3QkgxeLxih54zOKQUO8JnaV7Vc

// Configuration - Spreadsheet yang sudah ada
const SPREADSHEET_ID = '1SKy697_7EmR6U7ZRt3QkgxeLxih54zOKQUO8JnaV7Vc';
const SHEET_NAME = 'data_iklan_new_global';

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getData' || action === 'getExistingData') {
      return getData();
    } else if (action === 'analyzeSheet') {
      return analyzeSheet();
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
    
    // Baca semua data
    const range = sheet.getRange(1, 1, lastRow, sheet.getLastColumn());
    const values = range.getValues();
    
    // Ambil header dari baris pertama
    const headers = values[0];
    const dataRows = values.slice(1);
    
    // Konversi ke format dashboard
    const data = dataRows.map(row => {
      const obj = {};
      
      headers.forEach((header, index) => {
        const normalizedHeader = header.toString().toLowerCase().trim();
        const cellValue = row[index];
        
        // Mapping kolom berdasarkan suggestMapping function
        const mapping = suggestMapping(header);
        
        switch(mapping) {
          case 'tanggal':
            obj.tanggal = formatDate(cellValue);
            break;
            
          case 'budget_awareness':
            if (!obj.budget) obj.budget = 0;
            obj.budget += parseNumber(cellValue);
            obj.budget_awareness = parseNumber(cellValue);
            break;
            
          case 'budget_conversion':
            if (!obj.budget) obj.budget = 0;
            obj.budget += parseNumber(cellValue);
            obj.budget_conversion = parseNumber(cellValue);
            break;
            
          case 'total_budget':
            if (!obj.budget) obj.budget = 0;
            obj.budget += parseNumber(cellValue);
            obj.total_budget = parseNumber(cellValue);
            break;
            
          case 'budget':
            if (!obj.budget) obj.budget = 0;
            obj.budget += parseNumber(cellValue);
            break;
            
          case 'pajak':
            obj.pajak = parseNumber(cellValue);
            break;
            
          case 'lead':
            obj.lead = parseNumber(cellValue);
            break;
            
          case 'CPL':
            obj.CPL = parseNumber(cellValue);
            break;
            
          case 'sisa_iklan':
            obj.sisaIklan = parseNumber(cellValue);
            break;
            
          case 'vendor':
            obj.vendor = cellValue || '';
            break;
            
          case 'kontak':
            obj.kontak = parseNumber(cellValue);
            break;
            
          case 'timestamp':
            obj.timestamp = cellValue;
            break;
            
          case 'channel':
            obj.channel = cellValue || '';
            break;
            
          case 'ROAS':
            obj.ROAS = parseNumber(cellValue);
            break;
            
          case 'revenue':
            obj.revenue = parseNumber(cellValue);
            break;
            
          case 'campaign':
            obj.campaign = cellValue || '';
            break;
            
          case 'closing':
            obj.closing = parseNumber(cellValue);
            break;
            
          case 'followUp':
            obj.followUp = parseNumber(cellValue);
            break;
            
          default:
            // Simpan kolom custom dengan nama yang dibersihkan
            const cleanName = normalizedHeader.replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            obj[cleanName] = cellValue;
        }
      });
      
      // Auto-calculate missing values
      if (!obj.CPL && obj.budget && obj.lead && obj.lead > 0) {
        obj.CPL = Math.round(obj.budget / obj.lead);
      }
      
      if (!obj.ROAS && obj.revenue && obj.budget && obj.budget > 0) {
        obj.ROAS = Math.round((obj.revenue / obj.budget) * 100) / 100;
      }
      
      // Auto-calculate closing percentage
      if (!obj.closingPercentage && obj.totalLeadFollowUp && obj.closing) {
        obj.closingPercentage = Math.round((obj.closing / obj.totalLeadFollowUp) * 100 * 100) / 100;
      }
      
      // Tentukan role berdasarkan data
      if (obj.budget > 0 || obj.campaign) {
        obj.role = 'PPC';
      } else if (obj.closing > 0 || obj.followUp > 0 || obj.totalLeadFollowUp > 0) {
        obj.role = 'CS';
      } else {
        obj.role = 'GENERAL';
      }
      
      // Tambahkan timestamp jika tidak ada
      if (!obj.timestamp) {
        obj.timestamp = new Date();
      }
      
      return obj;
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        data: data,
        totalRows: data.length
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
    const cpl = data.totalLead > 0 ? Math.round(data.budget / data.totalLead) : 0;
    
    // Prepare row data - sesuaikan dengan struktur sheet Anda
    const rowData = [
      data.tanggal,                     // A: tanggal
      data.vendor,                      // B: vendor
      'PPC Campaign',                   // C: channel
      data.budget,                      // D: budget
      data.totalLead,                   // E: lead
      cpl,                              // F: CPL
      0,                                // G: ROAS (akan diupdate nanti)
      0,                                // H: revenue (akan diupdate nanti)
      new Date(),                       // I: timestamp
      'PPC',                            // J: role
      `Campaign: ${data.campaign}`,     // K: notes
      '',                               // L: follow_up
      '',                               // M: closing
      data.campaign,                    // N: campaign
      data.leadBerdu                    // O: leadBerdu
    ];
    
    // Add new row
    sheet.appendRow(rowData);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data PPC berhasil disimpan'
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
    const roas = data.totalLeadFollowUp > 0 ? Math.round((revenue / (data.totalLeadFollowUp * 50000)) * 100) / 100 : 0;
    
    // Prepare row data
    const rowData = [
      data.tanggal,                     // A: tanggal
      'CS Team',                        // B: vendor
      'Follow-up',                      // C: channel
      0,                                // D: budget
      data.totalLeadFollowUp,           // E: lead
      0,                                // F: CPL
      roas,                             // G: ROAS
      revenue,                          // H: revenue
      new Date(),                       // I: timestamp
      'CS',                             // J: role
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
        message: 'Data CS berhasil disimpan'
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

function analyzeSheet() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Sheet not found: ' + SHEET_NAME);
    }
    
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    // Ambil header
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    // Ambil sample data (5 baris pertama)
    const sampleData = lastRow > 1 ? 
      sheet.getRange(2, 1, Math.min(5, lastRow - 1), lastCol).getValues() : [];
    
    // Analisis tipe data per kolom
    const columnAnalysis = headers.map((header, index) => {
      const sampleValues = sampleData.map(row => row[index]).filter(val => val !== '');
      const dataTypes = sampleValues.map(val => typeof val);
      const mostCommonType = dataTypes.length > 0 ? 
        dataTypes.sort((a,b) => dataTypes.filter(v => v===a).length - dataTypes.filter(v => v===b).length).pop() : 'unknown';
      
      return {
        columnName: header,
        index: index,
        dataType: mostCommonType,
        sampleValues: sampleValues.slice(0, 3),
        suggestedMapping: suggestMapping(header.toString().toLowerCase())
      };
    });
    
    const analysis = {
      sheetInfo: {
        name: SHEET_NAME,
        totalRows: lastRow,
        totalColumns: lastCol,
        dataRows: lastRow - 1
      },
      headers: headers,
      columnAnalysis: columnAnalysis,
      sampleData: sampleData.slice(0, 3)
    };
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        analysis: analysis
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

// Helper functions
function formatDate(dateValue) {
  if (!dateValue) return '';
  
  try {
    let date;
    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else {
      return dateValue.toString();
    }
    
    // Format ke YYYY-MM-DD
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
  } catch (error) {
    return dateValue.toString();
  }
}

function parseNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Hapus karakter non-numeric kecuali titik dan koma
    const cleaned = value.replace(/[^\d.,]/g, '');
    const number = parseFloat(cleaned.replace(',', '.'));
    return isNaN(number) ? 0 : number;
  }
  return 0;
}

function suggestMapping(headerName) {
  const normalizedHeader = headerName.toString().toLowerCase().trim();
  
  // Debug log untuk melihat header yang masuk
  Logger.log('Mapping header: ' + normalizedHeader);
  
  // Mapping berdasarkan kolom yang PERSIS terlihat di screenshot
  // Kolom 1: object -> tanggal
  if (normalizedHeader.includes('tanggal') || normalizedHeader === 'date' || normalizedHeader === 'tgl') {
    return 'tanggal';
  }
  
  // Kolom 2: Budget Iklan Awareness & Traffic
  if (normalizedHeader.includes('budget iklan awareness') || normalizedHeader.includes('awareness')) {
    return 'budget_awareness';
  }
  
  // Kolom 3: Budget Iklan Conversion
  if (normalizedHeader.includes('budget iklan conversion') || normalizedHeader.includes('conversion')) {
    return 'budget_conversion';
  }
  
  // Kolom 4: Pajak Iklan
  if (normalizedHeader.includes('pajak iklan') || normalizedHeader.includes('pajak')) {
    return 'pajak';
  }
  
  // Kolom 5: Total budget iklan
  if (normalizedHeader.includes('total budget iklan') || (normalizedHeader.includes('total') && normalizedHeader.includes('budget'))) {
    return 'total_budget';
  }
  
  // Kolom 6: Kontak
  if (normalizedHeader === 'kontak' || normalizedHeader.includes('kontak')) {
    return 'kontak';
  }
  
  // Kolom 7: CPA
  if (normalizedHeader === 'cpa' || normalizedHeader.includes('cpa')) {
    return 'CPL';
  }
  
  // Kolom 8: Lead
  if (normalizedHeader === 'lead' || normalizedHeader === 'leads') {
    return 'lead';
  }
  
  // Kolom 9: CPL
  if (normalizedHeader === 'cpl' || normalizedHeader.includes('cpl')) {
    return 'CPL';
  }
  
  // Kolom 10: Sisa iklan
  if (normalizedHeader.includes('sisa iklan') || normalizedHeader.includes('sisa')) {
    return 'sisa_iklan';
  }
  
  // Kolom 11: Vendor, invito
  if (normalizedHeader.includes('vendor') || normalizedHeader.includes('invito')) {
    return 'vendor';
  }
  
  // Kolom 12: timestap
  if (normalizedHeader.includes('timestamp') || normalizedHeader.includes('timestap')) {
    return 'timestamp';
  }
  
  // Fallback untuk kolom umum
  if (normalizedHeader.includes('budget')) {
    return 'budget';
  }
  
  if (normalizedHeader.includes('revenue') || normalizedHeader.includes('income')) {
    return 'revenue';
  }
  
  if (normalizedHeader.includes('roas')) {
    return 'ROAS';
  }
  
  if (normalizedHeader.includes('campaign')) {
    return 'campaign';
  }
  
  if (normalizedHeader.includes('channel') || normalizedHeader.includes('platform')) {
    return 'channel';
  }
  
  if (normalizedHeader.includes('closing')) {
    return 'closing';
  }
  
  if (normalizedHeader.includes('follow')) {
    return 'followUp';
  }
  
  // Jika tidak ada yang cocok, return custom
  Logger.log('No mapping found for: ' + normalizedHeader);
  return 'custom';
}

// Function to setup sheet headers (run once if needed)
function setupSheet() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    throw new Error('Sheet not found: ' + SHEET_NAME);
  }
  
  // Check if headers already exist
  const firstRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (firstRow.length === 0 || firstRow[0] === '') {
    // Set up headers
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
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f0f0f0');
    headerRange.setBorder(true, true, true, true, true, true);
  }
  
  Logger.log('Sheet setup completed');
}
