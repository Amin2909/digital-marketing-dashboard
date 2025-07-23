# 📊 PANDUAN MENGGUNAKAN SPREADSHEET YANG SUDAH ADA

## ✅ Dashboard Sudah Siap Membaca Data Existing!

Dashboard marketing digital ini **SUDAH BISA** mengambil dan mengadaptasi data dari spreadsheet Google Sheets yang sudah ada, tanpa perlu membuat spreadsheet baru.

---

## 🚀 CARA SETUP UNTUK SPREADSHEET EXISTING

### 1. **Siapkan Google Apps Script**

#### A. Buat Project Apps Script Baru:
```
1. Buka https://script.google.com
2. New Project → "Marketing Dashboard Reader"
3. Copy-paste kode dari: apps_script/read_existing_sheet.gs
```

#### B. Update Configuration:
```javascript
// Ganti dengan ID spreadsheet yang sudah ada
const EXISTING_SPREADSHEET_ID = 'your-existing-spreadsheet-id';
const EXISTING_SHEET_NAME = 'Sheet1'; // atau nama sheet Anda

// Jika ingin tetap bisa input data baru, tambahkan juga:
const SPREADSHEET_ID = 'your-new-spreadsheet-id'; // untuk data baru
const SHEET_NAME = 'data_iklan_new_global';
```

#### C. Deploy sebagai Web App:
```
1. Deploy → New deployment → Web app
2. Execute as: Me
3. Who has access: Anyone
4. Copy Web App URL
```

### 2. **Update Dashboard Configuration**

Edit `js/dashboard.js`:
```javascript
// Ganti URL ini dengan Web App URL Anda:
const GAS_URL = "https://script.google.com/macros/s/AKfycbx.../exec";
```

### 3. **Gunakan Dashboard**

1. **Login** ke dashboard
2. **Pilih Data Source**: "Existing Sheet" dari dropdown di header
3. **Klik "Analyze Sheet"** untuk melihat struktur data
4. **Dashboard otomatis** akan membaca dan mengadaptasi data

---

## 🔍 FITUR ANALISIS SPREADSHEET

### Auto-Detection Kolom:
Dashboard akan otomatis mendeteksi dan memetakan kolom berdasarkan nama:

| Nama Kolom di Sheet | Mapping Dashboard |
|---------------------|-------------------|
| tanggal, date, tgl | tanggal |
| vendor, vendor_name | vendor |
| channel, platform, media | channel |
| budget, spend, cost | budget |
| lead, leads, total_lead | lead |
| cpl, cost_per_lead | CPL |
| roas, return_on_ad_spend | ROAS |
| revenue, income, pendapatan | revenue |
| campaign, campaign_name | campaign |
| closing, close, deal | closing |
| follow_up, followup, fu | followUp |

### Auto-Calculation:
- **CPL**: Otomatis dihitung jika ada budget dan lead
- **ROAS**: Otomatis dihitung jika ada revenue dan budget
- **Role Detection**: PPC (jika ada budget/campaign), CS (jika ada closing/follow-up)

---

## 📋 CONTOH STRUKTUR SPREADSHEET YANG DIDUKUNG

### Format 1 - Data Marketing Umum:
```
| Tanggal    | Vendor   | Budget   | Lead | Revenue  |
|------------|----------|----------|------|----------|
| 2024-01-15 | Vendor A | 1000000  | 50   | 2500000  |
| 2024-01-16 | Vendor B | 1500000  | 75   | 3000000  |
```

### Format 2 - Data PPC Detail:
```
| Date       | Campaign Name | Spend    | Leads | CPL   | ROAS |
|------------|---------------|----------|-------|-------|------|
| 2024-01-15 | Campaign A    | 1000000  | 50    | 20000 | 2.5  |
| 2024-01-16 | Campaign B    | 1500000  | 75    | 20000 | 2.0  |
```

### Format 3 - Data CS Follow-up:
```
| Tanggal    | Follow Up | Closing | Revenue  |
|------------|-----------|---------|----------|
| 2024-01-15 | 45        | 12      | 2400000  |
| 2024-01-16 | 50        | 15      | 3000000  |
```

---

## 🎯 FITUR YANG AKAN AKTIF

### ✅ Dashboard Analytics:
- **Summary KPI**: Total budget, lead, revenue, ROAS
- **Charts**: Line chart harian, bar chart weekly, pie chart vendor
- **Filters**: Berdasarkan vendor, tanggal, channel
- **Role-based View**: Data terpisah untuk PPC, CS, Manager

### ✅ Manager Dashboard:
- **Time Progress**: Progress bulan ini vs target
- **Gap Analysis**: Analisis pencapaian target
- **CS Performance**: Ranking individual CS
- **Export Tools**: PDF, Excel, daily reports

### ✅ Real-time Updates:
- **Auto-refresh**: Setiap 30 detik
- **Live sync**: Perubahan di spreadsheet langsung terlihat
- **Multi-source**: Bisa switch antara demo, existing, dan live data

---

## 🔧 TROUBLESHOOTING

### Data Tidak Muncul:
1. **Check Spreadsheet ID**: Pastikan ID benar
2. **Check Sheet Name**: Pastikan nama sheet sesuai
3. **Check Permissions**: Pastikan Apps Script bisa akses spreadsheet
4. **Check Console**: Lihat error di browser console

### Kolom Tidak Termapping:
1. **Gunakan Analyze Sheet**: Lihat mapping yang terdeteksi
2. **Rename Kolom**: Gunakan nama yang lebih standard
3. **Custom Mapping**: Edit kode Apps Script untuk mapping khusus

### Performance Issues:
1. **Limit Data**: Jika data terlalu besar, tambahkan filter tanggal
2. **Optimize Queries**: Gunakan range yang lebih spesifik
3. **Cache Data**: Implementasi caching untuk data yang jarang berubah

---

## 📊 CONTOH PENGGUNAAN

### Skenario 1: Agency Marketing
```
Spreadsheet existing berisi:
- Data spend harian dari berbagai platform
- Lead generation dari form
- Revenue tracking dari sales team

Dashboard akan:
- Otomatis kategorikan sebagai PPC/CS data
- Hitung CPL dan ROAS
- Tampilkan analytics lengkap
```

### Skenario 2: E-commerce
```
Spreadsheet existing berisi:
- Ad spend dari Facebook, Google, TikTok
- Conversion data dari website
- Revenue dari sales

Dashboard akan:
- Group by platform/vendor
- Calculate performance metrics
- Show manager-level insights
```

### Skenario 3: Startup
```
Spreadsheet existing berisi:
- Marketing budget allocation
- Lead tracking dari berbagai channel
- Customer acquisition cost

Dashboard akan:
- Visualize growth trends
- Track CAC vs LTV
- Monitor budget efficiency
```

---

## 🎉 KEUNGGULAN MENGGUNAKAN DATA EXISTING

### ✅ No Data Migration:
- Tidak perlu pindah data
- Tetap gunakan spreadsheet yang sudah ada
- Workflow existing tidak terganggu

### ✅ Instant Analytics:
- Dashboard langsung bisa digunakan
- Analytics real-time dari data existing
- Visualisasi modern untuk data lama

### ✅ Flexible Integration:
- Support berbagai format spreadsheet
- Auto-adaptation untuk struktur data
- Custom mapping untuk kebutuhan khusus

### ✅ Dual Mode:
- Baca data existing untuk analytics
- Input data baru untuk tracking harian
- Combine existing + new data untuk insights lengkap

---

## 🚀 READY TO USE!

**Dashboard marketing digital Anda sudah siap membaca data dari spreadsheet yang sudah ada!**

### Langkah Singkat:
1. ✅ Setup Google Apps Script (5 menit)
2. ✅ Update dashboard configuration (1 menit)  
3. ✅ Pilih "Existing Sheet" di dashboard
4. ✅ Klik "Analyze Sheet" untuk preview
5. ✅ Enjoy real-time analytics dari data existing!

**Tidak perlu membuat spreadsheet baru atau migrasi data - dashboard langsung bisa digunakan dengan data yang sudah ada!**
