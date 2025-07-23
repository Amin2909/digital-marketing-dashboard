# 🔗 Panduan Integrasi Google Sheets

## 📋 Langkah-langkah Setup Google Sheets Integration

### 1. **Buat Google Spreadsheet**

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru dengan nama: `data_iklan_new_global`
3. Buat header di baris pertama dengan kolom berikut:

```
A1: tanggal
B1: vendor  
C1: channel
D1: budget
E1: lead
F1: CPL
G1: ROAS
H1: revenue
I1: timestamp
J1: role
K1: notes
L1: follow_up
M1: closing
N1: campaign
O1: leadBerdu
P1: totalLeadFollowUp
Q1: ghosting
R1: duplicate
S1: closingPercentage
```

4. **Copy Spreadsheet ID** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### 2. **Setup Google Apps Script**

1. Buka [Google Apps Script](https://script.google.com)
2. Klik **"New Project"**
3. Ganti nama project menjadi: `Marketing Dashboard API`
4. Hapus kode default dan paste kode dari file `apps_script/submit.gs`
5. **Update Configuration**:
   ```javascript
   const SPREADSHEET_ID = 'paste-spreadsheet-id-anda-disini';
   const SHEET_NAME = 'data_iklan_new_global';
   ```

### 3. **Deploy Google Apps Script**

1. Klik **"Deploy"** → **"New deployment"**
2. Pilih type: **"Web app"**
3. Settings:
   - **Execute as**: Me (your-email@gmail.com)
   - **Who has access**: Anyone
4. Klik **"Deploy"**
5. **Copy Web App URL** yang diberikan

### 4. **Update Dashboard Configuration**

Edit file `js/dashboard.js` dan ganti URL:

```javascript
// Ganti baris ini:
const GAS_URL = "https://script.google.com/macros/s/your-script-id/exec";

// Dengan URL Web App yang baru:
const GAS_URL = "https://script.google.com/macros/s/AKfycbx.../exec";
```

### 5. **Aktifkan Real Integration**

Di file `js/dashboard.js`, uncomment kode production dan comment kode demo:

```javascript
// Fetch data function
async function fetchData() {
  showLoading(true);
  try {
    // UNCOMMENT INI UNTUK PRODUCTION:
    const response = await fetch(GAS_URL + "?action=getData");
    if (!response.ok) throw new Error("Failed to fetch data");
    const result = await response.json();
    allData = result.data || [];
    
    // COMMENT INI UNTUK PRODUCTION:
    // allData = generateMockData();
    
    updateDashboard();
    lastUpdateSpan.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
  } catch (error) {
    console.error("Error fetching data:", error);
    // Fallback ke mock data jika error
    allData = generateMockData();
    updateDashboard();
    lastUpdateSpan.textContent = `Last updated: ${new Date().toLocaleTimeString()} (Demo Mode)`;
  } finally {
    showLoading(false);
  }
}
```

Dan untuk form submissions, uncomment bagian fetch:

```javascript
// Di PPC form handler:
const response = await fetch(GAS_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'addPPCData', data })
});
const result = await response.json();
if (result.status !== 'success') throw new Error(result.message);

// Di CS form handler:
const response = await fetch(GAS_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'addCSData', data })
});
const result = await response.json();
if (result.status !== 'success') throw new Error(result.message);
```

## 🧪 Testing Integration

### 1. **Test Setup Sheet Headers**
Jalankan fungsi `setupSheet()` di Google Apps Script untuk setup headers otomatis.

### 2. **Test API Endpoints**
- **GET Data**: `https://your-gas-url/exec?action=getData`
- **POST PPC**: Send JSON dengan action: 'addPPCData'
- **POST CS**: Send JSON dengan action: 'addCSData'

### 3. **Test dari Dashboard**
1. Login sebagai PPC → Input data iklan
2. Login sebagai CS → Input data follow-up  
3. Login sebagai Manager → Lihat semua data

## 🔧 Troubleshooting

### Error: "Sheet not found"
- Pastikan nama sheet: `data_iklan_new_global`
- Pastikan SPREADSHEET_ID benar

### Error: "Permission denied"
- Deploy ulang dengan akses "Anyone"
- Pastikan Google Account memiliki akses ke spreadsheet

### Error: "CORS"
- Pastikan Web App di-deploy dengan benar
- Cek URL Web App sudah benar

### Data tidak muncul
- Cek console browser untuk error
- Pastikan spreadsheet memiliki data
- Test API endpoint langsung di browser

## 📊 Data Structure

### PPC Data:
```json
{
  "tanggal": "2024-01-15",
  "vendor": "Vendor A", 
  "campaign": "Campaign Name",
  "budget": 1000000,
  "totalLead": 50,
  "leadBerdu": 30,
  "role": "PPC"
}
```

### CS Data:
```json
{
  "tanggal": "2024-01-15",
  "totalLeadFollowUp": 45,
  "closing": 12,
  "ghosting": 8,
  "duplicate": 5,
  "closingPercentage": 26.67,
  "role": "CS"
}
```

## 🚀 Production Ready!

Setelah setup selesai, dashboard akan:
- ✅ Real-time sync dengan Google Sheets
- ✅ Auto-update setiap 30 detik
- ✅ Form submission langsung ke spreadsheet
- ✅ Role-based data filtering
- ✅ Manager analytics dari data real

## 🔐 Security Notes

- Web App URL bersifat public, jangan share sembarangan
- Untuk production, pertimbangkan authentication tambahan
- Monitor usage quota Google Apps Script
- Backup data spreadsheet secara berkala

---

**🎯 Integrasi Google Sheets sudah siap digunakan!**
