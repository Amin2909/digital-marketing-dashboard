// Google Apps Script untuk membaca data dari spreadsheet yang sudah ada
// Fungsi ini akan mengadaptasi struktur data existing ke format dashboard

// Configuration - menggunakan spreadsheet yang sudah ada
const EXISTING_SPREADSHEET_ID = '1SKy697_7EmR6U7ZRt3QkgxeLxih54zOKQUO8JnaV7Vc';
const EXISTING_SHEET_NAME = 'data_iklan_new_global'; // Sheet untuk data PPC

// Configuration untuk data baru (jika diperlukan)
const SPREADSHEET_ID = '1SKy697_7EmR6U7ZRt3QkgxeLxih54zOKQUO8JnaV7Vc'; // Sama dengan existing
const SHEET_NAME = 'data_iklan_new_global'; // Sheet yang sama untuk konsistensi
=======

// Fungsi untuk membaca dan mengadaptasi data existing
function getExistingData() {
  try {
    const sheet = SpreadsheetApp.openById(EXISTING_SPREADSHEET_ID).getSheetByName(EXISTING_SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Sheet not found: ' + EXISTING_SHEET_NAME);
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
    
    // Adaptasi data ke format dashboard
    const adaptedData = dataRows.map(row => {
      const obj = {};
      
      // Mapping kolom existing ke format dashboard
      headers.forEach((header, index) => {
        const normalizedHeader = header.toString().toLowerCase().trim();
        const cellValue = row[index];
        
        // Mapping berdasarkan nama kolom yang mungkin ada
        switch(normalizedHeader) {
          case 'tanggal':
          case 'date':
          case 'tgl':
            obj.tanggal = formatDate(cellValue);
            break;
            
          case 'vendor':
          case 'vendor_name':
          case 'nama_vendor':
            obj.vendor = cellValue || '';
            break;
            
          case 'channel':
          case 'platform':
          case 'media':
            obj.channel = cellValue || '';
            break;
            
          case 'budget':
          case 'spend':
          case 'cost':
            obj.budget = parseNumber(cellValue);
            break;
            
          case 'lead':
          case 'leads':
          case 'total_lead':
            obj.lead = parseNumber(cellValue);
            break;
            
          case 'cpl':
          case 'cost_per_lead':
            obj.CPL = parseNumber(cellValue);
            break;
            
          case 'roas':
          case 'return_on_ad_spend':
            obj.ROAS = parseNumber(cellValue);
            break;
            
          case 'revenue':
          case 'income':
          case 'pendapatan':
            obj.revenue = parseNumber(cellValue);
            break;
            
          case 'campaign':
          case 'campaign_name':
          case 'nama_campaign':
            obj.campaign = cellValue || '';
            break;
            
          case 'closing':
          case 'close':
          case 'deal':
            obj.closing = parseNumber(cellValue);
            break;
            
          case 'follow_up':
          case 'followup':
          case 'fu':
            obj.followUp = parseNumber(cellValue);
            break;
            
          default:
            // Simpan kolom lain dengan nama asli
            obj[normalizedHeader] = cellValue;
        }
      });
      
      // Auto-calculate missing values
      if (!obj.CPL && obj.budget && obj.lead && obj.lead > 0) {
        obj.CPL = Math.round(obj.budget / obj.lead);
      }
      
      if (!obj.ROAS && obj.revenue && obj.budget && obj.budget > 0) {
        obj.ROAS = Math.round((obj.revenue / obj.budget) * 100) / 100;
      }
      
      // Tentukan role berdasarkan data
      if (obj.budget > 0 || obj.campaign) {
        obj.role = 'PPC';
      } else if (obj.closing > 0 || obj.followUp > 0) {
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
        data: adaptedData,
        originalHeaders: headers,
        totalRows: adaptedData.length
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

// Helper function untuk format tanggal
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

// Helper function untuk parse angka
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

// Fungsi untuk analisis struktur spreadsheet existing
function analyzeExistingSheet() {
  try {
    const sheet = SpreadsheetApp.openById(EXISTING_SPREADSHEET_ID).getSheetByName(EXISTING_SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Sheet not found: ' + EXISTING_SHEET_NAME);
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
    
    return {
      sheetInfo: {
        name: EXISTING_SHEET_NAME,
        totalRows: lastRow,
        totalColumns: lastCol,
        dataRows: lastRow - 1
      },
      headers: headers,
      columnAnalysis: columnAnalysis,
      sampleData: sampleData.slice(0, 3)
    };
    
  } catch (error) {
    Logger.log('Error analyzing sheet: ' + error.toString());
    return { error: error.toString() };
  }
}

// Helper untuk suggest mapping kolom
function suggestMapping(headerName) {
  const mappings = {
    'tanggal': 'tanggal',
    'date': 'tanggal',
    'tgl': 'tanggal',
    'vendor': 'vendor',
    'vendor_name': 'vendor',
    'nama_vendor': 'vendor',
    'channel': 'channel',
    'platform': 'channel',
    'media': 'channel',
    'budget': 'budget',
    'spend': 'budget',
    'cost': 'budget',
    'lead': 'lead',
    'leads': 'lead',
    'total_lead': 'lead',
    'cpl': 'CPL',
    'cost_per_lead': 'CPL',
    'roas': 'ROAS',
    'return_on_ad_spend': 'ROAS',
    'revenue': 'revenue',
    'income': 'revenue',
    'pendapatan': 'revenue',
    'campaign': 'campaign',
    'campaign_name': 'campaign',
    'closing': 'closing',
    'close': 'closing',
    'follow_up': 'followUp',
    'followup': 'followUp'
  };
  
  return mappings[headerName] || 'custom';
}

// Update doGet function untuk handle existing data
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getData') {
      return getData(); // Data baru
    } else if (action === 'getExistingData') {
      return getExistingData(); // Data dari spreadsheet existing
    } else if (action === 'analyzeSheet') {
      const analysis = analyzeExistingSheet();
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'success',
          analysis: analysis
        }))
        .setMimeType(ContentService.MimeType.JSON);
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

// Fungsi untuk migrasi data existing ke format baru
function migrateExistingData() {
  try {
    const existingSheet = SpreadsheetApp.openById(EXISTING_SPREADSHEET_ID).getSheetByName(EXISTING_SHEET_NAME);
    const newSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!existingSheet || !newSheet) {
      throw new Error('One or both sheets not found');
    }
    
    // Baca data existing
    const existingData = getExistingData();
    const parsedData = JSON.parse(existingData.getContent());
    
    if (parsedData.status !== 'success') {
      throw new Error('Failed to read existing data');
    }
    
    // Setup header di sheet baru jika belum ada
    setupSheet();
    
    // Migrate data
    let migratedCount = 0;
    parsedData.data.forEach(item => {
      const rowData = [
        item.tanggal || '',
        item.vendor || '',
        item.channel || '',
        item.budget || 0,
        item.lead || 0,
        item.CPL || 0,
        item.ROAS || 0,
        item.revenue || 0,
        new Date(),
        item.role || 'GENERAL',
        'Migrated from existing sheet',
        item.followUp || '',
        item.closing || '',
        item.campaign || '',
        item.leadBerdu || '',
        item.totalLeadFollowUp || '',
        item.ghosting || '',
        item.duplicate || '',
        item.closingPercentage || ''
      ];
      
      newSheet.appendRow(rowData);
      migratedCount++;
    });
    
    Logger.log(`Successfully migrated ${migratedCount} rows`);
    return { success: true, migratedRows: migratedCount };
    
  } catch (error) {
    Logger.log('Migration error: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}
