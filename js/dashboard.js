// js/dashboard.js

// Replace with your actual Google Apps Script Web App URL
const GAS_URL = "https://script.google.com/macros/s/AKfycbzzmoECXnmtVUy5sHsqvq0_OrEurkzou1ZvKrvNJNjR2xNmms281Y7q_sD5dVg7z8Oq/exec";

// Get user info from sessionStorage
const userRole = sessionStorage.getItem('userRole');
const username = sessionStorage.getItem('username');

// Redirect to login if not authenticated
if (!userRole) {
  window.location.href = 'index.html';
}

// DOM elements
const ppcFormSection = document.getElementById('ppcFormSection');
const csFormSection = document.getElementById('csFormSection');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const lastUpdateSpan = document.getElementById('lastUpdate');
const userRoleBadge = document.getElementById('userRoleBadge');

let allData = [];

// Utility functions
function showLoading(show) {
  const loading = document.getElementById('loadingIndicator');
  if (loading) {
    loading.style.display = show ? 'flex' : 'none';
  }
}

function setUserRoleUI(role) {
  userRoleBadge.textContent = role;
  userRoleBadge.className = `ml-4 px-3 py-1 text-xs font-medium rounded-full ${
    role === 'PPC' ? 'bg-blue-100 text-blue-800' :
    role === 'CS' ? 'bg-green-100 text-green-800' :
    'bg-purple-100 text-purple-800'
  }`;

  const managerChartsSection = document.getElementById('managerChartsSection');
  const managerKPISection = document.getElementById('managerKPISection');

  if (role === 'PPC') {
    ppcFormSection.classList.remove('hidden');
    csFormSection.classList.add('hidden');
    if (managerChartsSection) managerChartsSection.classList.add('hidden');
    if (managerKPISection) managerKPISection.classList.add('hidden');
  } else if (role === 'CS') {
    csFormSection.classList.remove('hidden');
    ppcFormSection.classList.add('hidden');
    if (managerChartsSection) managerChartsSection.classList.add('hidden');
    if (managerKPISection) managerKPISection.classList.add('hidden');
  } else if (role === 'MANAGER') {
    // Manager sees all sections
    ppcFormSection.classList.add('hidden');
    csFormSection.classList.add('hidden');
    if (managerChartsSection) managerChartsSection.classList.remove('hidden');
    if (managerKPISection) managerKPISection.classList.remove('hidden');
    
    // Initialize additional charts for manager
    setTimeout(() => {
      if (window.chartFunctions && window.chartFunctions.initAdditionalCharts) {
        window.chartFunctions.initAdditionalCharts();
      }
    }, 500);
  }
}

function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

// Event listeners
logoutBtn.addEventListener('click', logout);
refreshBtn.addEventListener('click', () => {
  const dataSource = document.getElementById('dataSourceSelector').value;
  fetchData(dataSource);
});

// Data source selector event listener
document.getElementById('dataSourceSelector').addEventListener('change', (e) => {
  const selectedSource = e.target.value;
  const analyzeBtn = document.getElementById('analyzeBtn');
  
  // Show analyze button only for existing sheet
  if (selectedSource === 'existing') {
    analyzeBtn.classList.remove('hidden');
  } else {
    analyzeBtn.classList.add('hidden');
  }
  
  // Auto-refresh when source changes
  fetchData(selectedSource);
});

// Analyze button event listener
document.getElementById('analyzeBtn').addEventListener('click', async () => {
  try {
    showLoading(true);
    const analysis = await analyzeExistingSheet();
    showSheetAnalysis(analysis);
  } catch (error) {
    alert('Error analyzing sheet: ' + error.message);
  } finally {
    showLoading(false);
  }
});

// Initialize UI based on user role
setUserRoleUI(userRole);

// Mock data for demo purposes (replace with actual GAS integration)
function generateMockData() {
  const mockData = [];
  const vendors = ['Invitationery Asia', 'Invitto Printery', 'Galeria Inviitation','Souvenery Asia'];
  const channels = ['Meta Ads'];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const budget = Math.floor(Math.random() * 5000000) + 1000000;
    const lead = Math.floor(Math.random() * 100) + 10;
    const cpl = budget / lead;
    const revenue = lead * (Math.random() * 500000 + 100000);
    const roas = revenue / budget;
    
    mockData.push({
      tanggal: dateStr,
      vendor: vendors[Math.floor(Math.random() * vendors.length)],
      channel: channels[Math.floor(Math.random() * channels.length)],
      budget: budget,
      lead: lead,
      CPL: Math.round(cpl),
      ROAS: Math.round(roas * 100) / 100,
      revenue: Math.round(revenue),
      role: Math.random() > 0.5 ? 'PPC' : 'CS'
    });
  }
  
  return mockData;
}

// Function to fetch data from existing spreadsheet
async function fetchExistingData() {
  try {
    const response = await fetch(GAS_URL + "?action=getExistingData");
    if (!response.ok) throw new Error("Failed to fetch existing data");
    const result = await response.json();
    
    if (result.status === 'success') {
      return result.data || [];
    } else {
      throw new Error(result.message || 'Unknown error');
    }
  } catch (error) {
    console.error("Error fetching existing data:", error);
    throw error;
  }
}

// Function to analyze existing spreadsheet structure
async function analyzeExistingSheet() {
  try {
    const response = await fetch(GAS_URL + "?action=analyzeSheet");
    if (!response.ok) throw new Error("Failed to analyze sheet");
    const result = await response.json();
    
    if (result.status === 'success') {
      return result.analysis;
    } else {
      throw new Error(result.message || 'Analysis failed');
    }
  } catch (error) {
    console.error("Error analyzing sheet:", error);
    throw error;
  }
}

// Fetch data function with multiple data source options
async function fetchData(dataSource = 'demo') {
  showLoading(true);
  try {
    let dataSourceText = '';
    
    switch(dataSource) {
      case 'existing':
        // Fetch from existing spreadsheet
        allData = await fetchExistingData();
        // Filter out demo data if any
        allData = allData.filter(item => item.role !== 'demo');
        dataSourceText = '(From Existing Sheet)';
        break;
        
      case 'new':
        // Fetch from new dashboard spreadsheet
        const response = await fetch(GAS_URL + "?action=getData");
        if (!response.ok) throw new Error("Failed to fetch data");
        const result = await response.json();
        allData = result.data || [];
        dataSourceText = '(Live Data)';
        break;
        
      case 'demo':
      default:
        // Use mock data for demo
        allData = generateMockData();
        dataSourceText = '(Demo Mode)';
        break;
    }
    
    updateDashboard();
    lastUpdateSpan.textContent = `Last updated: ${new Date().toLocaleTimeString()} ${dataSourceText}`;
    
  } catch (error) {
    console.error("Error fetching data:", error);
    // Fallback to mock data if error
    allData = generateMockData();
    updateDashboard();
    lastUpdateSpan.textContent = `Last updated: ${new Date().toLocaleTimeString()} (Demo Mode - Error)`;
  } finally {
    showLoading(false);
  }
}

// Update dashboard with filtered data
function updateDashboard() {
  const filterDateFrom = document.getElementById('filterDateFrom').value;
  const filterDateTo = document.getElementById('filterDateTo').value;
  const filterVendor = document.getElementById('filterVendor').value.toLowerCase();
  const filterChannel = document.getElementById('filterChannel').value.toLowerCase();

  let filteredData = allData;

  // Apply filters
  if (filterDateFrom) {
    filteredData = filteredData.filter(item => item.tanggal >= filterDateFrom);
  }
  if (filterDateTo) {
    filteredData = filteredData.filter(item => item.tanggal <= filterDateTo);
  }
  if (filterVendor) {
    filteredData = filteredData.filter(item => item.vendor.toLowerCase().includes(filterVendor));
  }
  if (filterChannel) {
    filteredData = filteredData.filter(item => item.channel && item.channel.toLowerCase() === filterChannel);
  }

  // Role-based data filtering
  if (userRole === 'PPC') {
    // PPC users see their own data (simplified for demo)
    filteredData = filteredData.filter(item => item.role === 'PPC');
  } else if (userRole === 'CS') {
    // CS users see follow-up related data
    filteredData = filteredData.filter(item => item.role === 'CS');
  }
  // Manager sees all data

  updateSummary(filteredData);
  if (window.chartFunctions && window.chartFunctions.updateChart) {
    window.chartFunctions.updateChart(filteredData);
  }
  updateTable(filteredData);

  // Update manager-specific sections
  if (userRole === 'MANAGER') {
    updateManagerKPI(filteredData);
    updateCSPerformanceTable(filteredData);
    if (window.chartFunctions) {
      if (window.chartFunctions.updateVendorChart) {
        window.chartFunctions.updateVendorChart(filteredData);
      }
      if (window.chartFunctions.updateWeeklyChart) {
        window.chartFunctions.updateWeeklyChart(filteredData);
      }
    }
  }
}

// Update summary boxes
function updateSummary(data) {
  const totalBudget = data.reduce((sum, item) => sum + Number(item.budget || 0), 0);
  const totalLead = data.reduce((sum, item) => sum + Number(item.lead || 0), 0);
  const totalRevenue = data.reduce((sum, item) => sum + Number(item.revenue || 0), 0);
  const avgROAS = data.length ? (data.reduce((sum, item) => sum + Number(item.ROAS || 0), 0) / data.length) : 0;

  document.getElementById('totalBudget').textContent = `Rp ${totalBudget.toLocaleString('id-ID')}`;
  document.getElementById('totalLead').textContent = totalLead.toLocaleString('id-ID');
  document.getElementById('totalRevenue').textContent = `Rp ${totalRevenue.toLocaleString('id-ID')}`;
  document.getElementById('avgROAS').textContent = avgROAS.toFixed(2);
}

// Update data table
function updateTable(data) {
  const tbody = document.getElementById('dataTableBody');
  tbody.innerHTML = '';

  if (data.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td colspan="8" class="px-6 py-4 text-center text-gray-500">No data available</td>
    `;
    tbody.appendChild(tr);
    return;
  }

  data.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50';

    // Highlight anomalies: CPL > 100000 or ROAS < 1
    const cplHigh = Number(item.CPL) > 100000;
    const roasLow = Number(item.ROAS) < 1;

    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.tanggal}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.vendor}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.channel || '-'}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp ${Number(item.budget).toLocaleString('id-ID')}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.lead}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm ${cplHigh ? 'bg-red-100 text-red-700 font-semibold' : 'text-gray-900'}">Rp ${Number(item.CPL).toLocaleString('id-ID')}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm ${roasLow ? 'bg-red-100 text-red-700 font-semibold' : 'text-gray-900'}">${item.ROAS}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp ${Number(item.revenue).toLocaleString('id-ID')}</td>
    `;

    tbody.appendChild(tr);
  });
}

function calculatePPCTotals() {
  const budgetAwareness = Number(document.getElementById('ppcBudgetAwareness').value) || 0;
  const budgetConversion = Number(document.getElementById('ppcBudgetConversion').value) || 0;
  const kontak = Number(document.getElementById('ppcKontak').value) || 0;
  
  // Calculate pajak iklan = 12% dari (budgetAwareness + budgetConversion)
  const pajakIklan = (budgetAwareness + budgetConversion) * 0.12;
  document.getElementById('ppcPajakIklan').value = Math.round(pajakIklan);
  
  // Calculate total budget = budgetAwareness + budgetConversion + pajakIklan
  const totalBudget = budgetAwareness + budgetConversion + pajakIklan;
  document.getElementById('ppcTotalBudget').value = Math.round(totalBudget);
  
  // Calculate CPA = totalBudget / kontak
  const cpa = kontak > 0 ? totalBudget / kontak : 0;
  document.getElementById('ppcCPA').value = Math.round(cpa);
  
  // Calculate CPL
  const lead = Number(document.getElementById('ppcLead').value) || 0;
  const cpl = lead > 0 ? Math.round(totalBudget / lead) : 0;
  document.getElementById('ppcCPL').value = cpl;
}
  
  // Calculate CPL
  const cpl = lead > 0 ? Math.round(totalBudget / lead) : 0;
  document.getElementById('ppcCPL').value = cpl;


// Auto-calculate closing percentage for CS form
function calculateClosingPercentage() {
  const totalLeadFollowUp = Number(document.getElementById('csTotalLeadFollowUp').value) || 0;
  const closing = Number(document.getElementById('csClosing').value) || 0;
  const closingPercentage = totalLeadFollowUp > 0 ? (closing / totalLeadFollowUp * 100) : 0;
  document.getElementById('csClosingPercentage').value = closingPercentage.toFixed(2);
}

// Auto-calculate functions for PPC form
function calculatePPCTotals() {
  const budgetAwareness = Number(document.getElementById('ppcBudgetAwareness').value) || 0;
  const budgetConversion = Number(document.getElementById('ppcBudgetConversion').value) || 0;
  const kontak = Number(document.getElementById('ppcKontak').value) || 0;
  
  // Calculate pajak iklan = 12% dari (budgetAwareness + budgetConversion)
  const pajakIklan = (budgetAwareness + budgetConversion) * 0.12;
  document.getElementById('ppcPajakIklan').value = Math.round(pajakIklan);
  
  // Calculate total budget = budgetAwareness + budgetConversion + pajakIklan
  const totalBudget = budgetAwareness + budgetConversion + pajakIklan;
  document.getElementById('ppcTotalBudget').value = Math.round(totalBudget);
  
  // Calculate CPA = totalBudget / kontak
  const cpa = kontak > 0 ? totalBudget / kontak : 0;
  document.getElementById('ppcCPA').value = Math.round(cpa);
  
  // Calculate CPL
  const lead = Number(document.getElementById('ppcLead').value) || 0;
  const cpl = lead > 0 ? Math.round(totalBudget / lead) : 0;
  document.getElementById('ppcCPL').value = cpl;
}

// Add event listeners for auto-calculation
document.addEventListener('DOMContentLoaded', () => {
  // PPC form auto-calculation
  const ppcBudgetInputs = ['ppcBudgetAwareness', 'ppcBudgetConversion', 'ppcPajakIklan', 'ppcLead', 'ppcKontak'];
  ppcBudgetInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', calculatePPCTotals);
    }
  });
  
  // CS form auto-calculation
  const totalLeadFollowUpInput = document.getElementById('csTotalLeadFollowUp');
  const closingInput = document.getElementById('csClosing');
  
  if (totalLeadFollowUpInput && closingInput) {
    totalLeadFollowUpInput.addEventListener('input', calculateClosingPercentage);
    closingInput.addEventListener('input', calculateClosingPercentage);
  }
});

// Auto-calculate functions for PPC form
function calculatePPCTotals() {
  const budgetAwareness = Number(document.getElementById('ppcBudgetAwareness').value) || 0;
  const budgetConversion = Number(document.getElementById('ppcBudgetConversion').value) || 0;
  const kontak = Number(document.getElementById('ppcKontak').value) || 0;
  
  // Calculate pajak iklan = 12% dari (budgetAwareness + budgetConversion)
  const pajakIklan = (budgetAwareness + budgetConversion) * 0.12;
  document.getElementById('ppcPajakIklan').value = Math.round(pajakIklan);
  
  // Calculate total budget = budgetAwareness + budgetConversion + pajakIklan
  const totalBudget = budgetAwareness + budgetConversion + pajakIklan;
  document.getElementById('ppcTotalBudget').value = Math.round(totalBudget);
  
  // Calculate CPA = totalBudget / kontak
  const cpa = kontak > 0 ? totalBudget / kontak : 0;
  document.getElementById('ppcCPA').value = Math.round(cpa);
  
  // Calculate CPL
  const lead = Number(document.getElementById('ppcLead').value) || 0;
  const cpl = lead > 0 ? Math.round(totalBudget / lead) : 0;
  document.getElementById('ppcCPL').value = cpl;
}

// Add event listeners for auto-calculation
document.addEventListener('DOMContentLoaded', () => {
  // PPC form auto-calculation
  const ppcBudgetInputs = ['ppcBudgetAwareness', 'ppcBudgetConversion', 'ppcPajakIklan', 'ppcLead', 'ppcKontak'];
  ppcBudgetInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', calculatePPCTotals);
    }
  });
  
  // CS form auto-calculation
  const totalLeadFollowUpInput = document.getElementById('csTotalLeadFollowUp');
  const closingInput = document.getElementById('csClosing');
  
  if (totalLeadFollowUpInput && closingInput) {
    totalLeadFollowUpInput.addEventListener('input', calculateClosingPercentage);
    closingInput.addEventListener('input', calculateClosingPercentage);
  }
});

// Auto-calculate functions for PPC form
function calculatePPCTotals() {
  const budgetAwareness = Number(document.getElementById('ppcBudgetAwareness').value) || 0;
  const budgetConversion = Number(document.getElementById('ppcBudgetConversion').value) || 0;
  const kontak = Number(document.getElementById('ppcKontak').value) || 0;
  
  // Calculate pajak iklan = 12% dari (budgetAwareness + budgetConversion)
  const pajakIklan = (budgetAwareness + budgetConversion) * 0.12;
  document.getElementById('ppcPajakIklan').value = Math.round(pajakIklan);
  
  // Calculate total budget = budgetAwareness + budgetConversion + pajakIklan
  const totalBudget = budgetAwareness + budgetConversion + pajakIklan;
  document.getElementById('ppcTotalBudget').value = Math.round(totalBudget);
  
  // Calculate CPA = totalBudget / kontak
  const cpa = kontak > 0 ? totalBudget / kontak : 0;
  document.getElementById('ppcCPA').value = Math.round(cpa);
  
  // Calculate CPL
  const lead = Number(document.getElementById('ppcLead').value) || 0;
  const cpl = lead > 0 ? Math.round(totalBudget / lead) : 0;
  document.getElementById('ppcCPL').value = cpl;
}

// Add event listeners for auto-calculation
document.addEventListener('DOMContentLoaded', () => {
  // PPC form auto-calculation
  const ppcBudgetInputs = ['ppcBudgetAwareness', 'ppcBudgetConversion', 'ppcPajakIklan', 'ppcLead', 'ppcKontak'];
  ppcBudgetInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', calculatePPCTotals);
    }
  });
  
  // CS form auto-calculation
  const totalLeadFollowUpInput = document.getElementById('csTotalLeadFollowUp');
  const closingInput = document.getElementById('csClosing');
  
  if (totalLeadFollowUpInput && closingInput) {
    totalLeadFollowUpInput.addEventListener('input', calculateClosingPercentage);
    closingInput.addEventListener('input', calculateClosingPercentage);
  }
});

// Auto-calculate functions for PPC form
function calculatePPCTotals() {
  const budgetAwareness = Number(document.getElementById('ppcBudgetAwareness').value) || 0;
  const budgetConversion = Number(document.getElementById('ppcBudgetConversion').value) || 0;
  const kontak = Number(document.getElementById('ppcKontak').value) || 0;
  
  // Calculate pajak iklan = 12% dari (budgetAwareness + budgetConversion)
  const pajakIklan = (budgetAwareness + budgetConversion) * 0.12;
  document.getElementById('ppcPajakIklan').value = Math.round(pajakIklan);
  
  // Calculate total budget = budgetAwareness + budgetConversion + pajakIklan
  const totalBudget = budgetAwareness + budgetConversion + pajakIklan;
  document.getElementById('ppcTotalBudget').value = Math.round(totalBudget);
  
  // Calculate CPA = totalBudget / kontak
  const cpa = kontak > 0 ? totalBudget / kontak : 0;
  document.getElementById('ppcCPA').value = Math.round(cpa);
  
  // Calculate CPL
  const lead = Number(document.getElementById('ppcLead').value) || 0;
  const cpl = lead > 0 ? Math.round(totalBudget / lead) : 0;
  document.getElementById('ppcCPL').value = cpl;
}

// Add event listeners for auto-calculation
document.addEventListener('DOMContentLoaded', () => {
  // PPC form auto-calculation
  const ppcBudgetInputs = ['ppcBudgetAwareness', 'ppcBudgetConversion', 'ppcPajakIklan', 'ppcLead', 'ppcKontak'];
  ppcBudgetInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', calculatePPCTotals);
    }
  });
  
  // CS form auto-calculation
  const totalLeadFollowUpInput = document.getElementById('csTotalLeadFollowUp');
  const closingInput = document.getElementById('csClosing');
  
  if (totalLeadFollowUpInput && closingInput) {
    totalLeadFollowUpInput.addEventListener('input', calculateClosingPercentage);
    closingInput.addEventListener('input', calculateClosingPercentage);
  }
});

// Auto-calculate functions for PPC form
function calculatePPCTotals() {
  const budgetAwareness = Number(document.getElementById('ppcBudgetAwareness').value) || 0;
  const budgetConversion = Number(document.getElementById('ppcBudgetConversion').value) || 0;
  const kontak = Number(document.getElementById('ppcKontak').value) || 0;
  
  // Calculate pajak iklan = 12% dari (budgetAwareness + budgetConversion)
  const pajakIklan = (budgetAwareness + budgetConversion) * 0.12;
  document.getElementById('ppcPajakIklan').value = Math.round(pajakIklan);
  
  // Calculate total budget = budgetAwareness + budgetConversion + pajakIklan
  const totalBudget = budgetAwareness + budgetConversion + pajakIklan;
  document.getElementById('ppcTotalBudget').value = Math.round(totalBudget);
  
  // Calculate CPA = totalBudget / kontak
  const cpa = kontak > 0 ? totalBudget / kontak : 0;
  document.getElementById('ppcCPA').value = Math.round(cpa);
  
  // Calculate CPL
  const lead = Number(document.getElementById('ppcLead').value) || 0;
  const cpl = lead > 0 ? Math.round(totalBudget / lead) : 0;
  document.getElementById('ppcCPL').value = cpl;
}

// Add event listeners for auto-calculation
document.addEventListener('DOMContentLoaded', () => {
  // PPC form auto-calculation
  const ppcBudgetInputs = ['ppcBudgetAwareness', 'ppcBudgetConversion', 'ppcPajakIklan', 'ppcLead'];
  ppcBudgetInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', calculatePPCTotals);
    }
  });
  
  // CS form auto-calculation
  const totalLeadFollowUpInput = document.getElementById('csTotalLeadFollowUp');
  const closingInput = document.getElementById('csClosing');
  
  if (totalLeadFollowUpInput && closingInput) {
    totalLeadFollowUpInput.addEventListener('input', calculateClosingPercentage);
    closingInput.addEventListener('input', calculateClosingPercentage);
  }
});

// Auto-calculate functions for PPC form
function calculatePPCTotals() {
  const budgetAwareness = Number(document.getElementById('ppcBudgetAwareness').value) || 0;
  const budgetConversion = Number(document.getElementById('ppcBudgetConversion').value) || 0;
  const kontak = Number(document.getElementById('ppcKontak').value) || 0;
  
  // Calculate pajak iklan = 12% dari (budgetAwareness + budgetConversion)
  const pajakIklan = (budgetAwareness + budgetConversion) * 0.12;
  document.getElementById('ppcPajakIklan').value = Math.round(pajakIklan);
  
  // Calculate total budget = budgetAwareness + budgetConversion + pajakIklan
  const totalBudget = budgetAwareness + budgetConversion + pajakIklan;
  document.getElementById('ppcTotalBudget').value = Math.round(totalBudget);
  
  // Calculate CPA = totalBudget / kontak
  const cpa = kontak > 0 ? totalBudget / kontak : 0;
  document.getElementById('ppcCPA').value = Math.round(cpa);
  
  // Calculate CPL
  const lead = Number(document.getElementById('ppcLead').value) || 0;
  const cpl = lead > 0 ? Math.round(totalBudget / lead) : 0;
  document.getElementById('ppcCPL').value = cpl;
}

// Add event listeners for auto-calculation
document.addEventListener('DOMContentLoaded', () => {
  // PPC form auto-calculation
  const ppcBudgetInputs = ['ppcBudgetAwareness', 'ppcBudgetConversion', 'ppcPajakIklan', 'ppcLead'];
  ppcBudgetInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', calculatePPCTotals);
    }
  });
  
  // CS form auto-calculation
  const totalLeadFollowUpInput = document.getElementById('csTotalLeadFollowUp');
  const closingInput = document.getElementById('csClosing');
  
  if (totalLeadFollowUpInput && closingInput) {
    totalLeadFollowUpInput.addEventListener('input', calculateClosingPercentage);
    closingInput.addEventListener('input', calculateClosingPercentage);
  }
});

// PPC form submission handler - Updated untuk struktur spreadsheet
const ppcForm = document.getElementById('ppcForm');
if (ppcForm) {
  ppcForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ppcError = document.getElementById('ppcError');
    ppcError.textContent = '';

    const data = {
      role: 'PPC',
      tanggal: document.getElementById('ppcTanggal').value,
      budgetAwareness: Number(document.getElementById('ppcBudgetAwareness').value) || 0,
      budgetConversion: Number(document.getElementById('ppcBudgetConversion').value) || 0,
      pajakIklan: Number(document.getElementById('ppcPajakIklan').value) || 0,
      totalBudget: Number(document.getElementById('ppcTotalBudget').value) || 0,
      kontak: Number(document.getElementById('ppcKontak').value) || 0,
      cpa: Number(document.getElementById('ppcCPA').value) || 0,
      lead: Number(document.getElementById('ppcLead').value) || 0,
      cpl: Number(document.getElementById('ppcCPL').value) || 0,
      sisaIklan: Number(document.getElementById('ppcSisaIklan').value) || 0,
      vendor: document.getElementById('ppcVendor').value
    };

    if (!data.tanggal || !data.vendor || !data.lead) {
      ppcError.textContent = 'Tanggal, Vendor, dan Lead wajib diisi.';
      return;
    }

    try {
      // Create entry sesuai struktur spreadsheet
      const newEntry = {
        tanggal: data.tanggal,
        vendor: data.vendor,
        channel: 'PPC Campaign',
        budget_awareness: data.budgetAwareness,
        budget_conversion: data.budgetConversion,
        pajak: data.pajakIklan,
        total_budget: data.totalBudget,
        budget: data.totalBudget, // Total budget untuk compatibility
        kontak: data.kontak,
        cpa: data.cpa,
        lead: data.lead,
        CPL: data.cpl,
        sisa_iklan: data.sisaIklan,
        ROAS: Math.round((Math.random() * 3 + 1) * 100) / 100, // Random ROAS for demo
        revenue: Math.round(data.lead * (Math.random() * 500000 + 100000)),
        role: 'PPC',
        timestamp: new Date().toISOString()
      };
      
      allData.unshift(newEntry);
      
      // In production, use this fetch call:
      /*
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addPPCData', data })
      });
      const result = await response.json();
      if (result.status !== 'success') throw new Error(result.message);
      */
      
      ppcForm.reset();
      updateDashboard();
      
      // Show success message
      ppcError.className = 'text-green-500 text-sm';
      ppcError.textContent = 'Data iklan berhasil disimpan!';
      setTimeout(() => {
        ppcError.textContent = '';
        ppcError.className = 'text-red-500 text-sm';
      }, 3000);
      
    } catch (error) {
      ppcError.textContent = error.message;
      console.error('PPC submit error:', error);
    }
  });
}

// CS form submission handler
const csForm = document.getElementById('csForm');
if (csForm) {
  csForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const csError = document.getElementById('csError');
    csError.textContent = '';

    const data = {
      role: 'CS',
      tanggal: document.getElementById('csDate').value,
      totalLeadFollowUp: Number(document.getElementById('csTotalLeadFollowUp').value),
      closing: Number(document.getElementById('csClosing').value),
      ghosting: Number(document.getElementById('csGhosting').value),
      duplicate: Number(document.getElementById('csDuplicate').value),
      closingPercentage: Number(document.getElementById('csClosingPercentage').value)
    };

    if (!data.tanggal || !data.totalLeadFollowUp || !data.closing || !data.ghosting || !data.duplicate) {
      csError.textContent = 'Please fill in all fields.';
      return;
    }

    try {
      // Calculate revenue based on closing (simplified)
      const avgRevenuePerClosing = 2000000; // Rp 2 juta per closing (adjust as needed)
      const revenue = data.closing * avgRevenuePerClosing;
      
      const newEntry = {
        tanggal: data.tanggal,
        vendor: username.toUpperCase() + ' (CS)',
        channel: 'Follow-up',
        budget: 0,
        lead: data.totalLeadFollowUp,
        CPL: 0,
        ROAS: revenue > 0 ? (revenue / (data.totalLeadFollowUp * 50000)) : 0, // Simplified ROAS calculation
        revenue: revenue,
        role: 'CS',
        totalLeadFollowUp: data.totalLeadFollowUp,
        closing: data.closing,
        ghosting: data.ghosting,
        duplicate: data.duplicate,
        closingPercentage: data.closingPercentage
      };
      
      allData.unshift(newEntry);
      
      // In production, use this fetch call:
      /*
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addCSData', data })
      });
      const result = await response.json();
      if (result.status !== 'success') throw new Error(result.message);
      */
      
      csForm.reset();
      updateDashboard();
      
      // Show success message
      csError.className = 'text-green-500 text-sm';
      csError.textContent = 'Data CS berhasil disimpan!';
      setTimeout(() => {
        csError.textContent = '';
        csError.className = 'text-red-500 text-sm';
      }, 3000);
      
    } catch (error) {
      csError.textContent = error.message;
      console.error('CS submit error:', error);
    }
  });
}

// Filter event listeners
document.getElementById('filterDateFrom').addEventListener('change', updateDashboard);
document.getElementById('filterDateTo').addEventListener('change', updateDashboard);
document.getElementById('filterVendor').addEventListener('input', updateDashboard);
document.getElementById('filterChannel').addEventListener('change', updateDashboard);

// Manager KPI Functions
function updateManagerKPI(data) {
  // Calculate time progress (current day of month / total days in month)
  const today = new Date();
  const currentDay = today.getDate();
  const totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const timeProgress = (currentDay / totalDaysInMonth) * 100;
  
  // Update time progress
  document.getElementById('timeProgress').textContent = `${timeProgress.toFixed(1)}%`;
  const progressCircle = document.getElementById('timeProgressCircle');
  if (progressCircle) {
    const circumference = 176; // 2 * π * 28
    const offset = circumference - (timeProgress / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
  }
  
  // Calculate target achievement (example: 1000 leads per month)
  const monthlyTarget = 1000;
  const currentMonthData = data.filter(item => {
    const itemDate = new Date(item.tanggal);
    return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
  });
  
  const totalLeadsThisMonth = currentMonthData.reduce((sum, item) => sum + Number(item.lead || 0), 0);
  const targetAchievement = (totalLeadsThisMonth / monthlyTarget) * 100;
  const gap = monthlyTarget - totalLeadsThisMonth;
  
  document.getElementById('targetAchievement').textContent = `${targetAchievement.toFixed(1)}%`;
  document.getElementById('gapAnalysis').textContent = `Gap: ${gap}`;
  
  // Calculate average closing rate
  const csData = data.filter(item => item.role === 'CS' && item.closingPercentage);
  const avgClosingRate = csData.length > 0 ? 
    csData.reduce((sum, item) => sum + Number(item.closingPercentage), 0) / csData.length : 0;
  
  document.getElementById('avgClosingRate').textContent = `${avgClosingRate.toFixed(1)}%`;
  
  // Find best CS
  const csPerformance = {};
  csData.forEach(item => {
    const csName = item.vendor.replace(' (CS)', '');
    if (!csPerformance[csName]) {
      csPerformance[csName] = { totalClosing: 0, totalFollowUp: 0, count: 0 };
    }
    csPerformance[csName].totalClosing += Number(item.closing || 0);
    csPerformance[csName].totalFollowUp += Number(item.totalLeadFollowUp || 0);
    csPerformance[csName].count++;
  });
  
  let bestCS = '-';
  let bestRate = 0;
  Object.keys(csPerformance).forEach(cs => {
    const rate = csPerformance[cs].totalFollowUp > 0 ? 
      (csPerformance[cs].totalClosing / csPerformance[cs].totalFollowUp) * 100 : 0;
    if (rate > bestRate) {
      bestRate = rate;
      bestCS = cs;
    }
  });
  
  document.getElementById('bestCS').textContent = `Best: ${bestCS}`;
}

function updateCSPerformanceTable(data) {
  const tbody = document.getElementById('csPerformanceTable');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  // Group CS data by CS name
  const csPerformance = {};
  data.filter(item => item.role === 'CS').forEach(item => {
    const csName = item.vendor.replace(' (CS)', '');
    if (!csPerformance[csName]) {
      csPerformance[csName] = {
        totalFollowUp: 0,
        totalClosing: 0,
        totalRevenue: 0,
        count: 0
      };
    }
    csPerformance[csName].totalFollowUp += Number(item.totalLeadFollowUp || 0);
    csPerformance[csName].totalClosing += Number(item.closing || 0);
    csPerformance[csName].totalRevenue += Number(item.revenue || 0);
    csPerformance[csName].count++;
  });
  
  // Convert to array and sort by closing percentage
  const csArray = Object.keys(csPerformance).map(cs => {
    const perf = csPerformance[cs];
    const closingPercentage = perf.totalFollowUp > 0 ? (perf.totalClosing / perf.totalFollowUp) * 100 : 0;
    return {
      name: cs,
      totalFollowUp: perf.totalFollowUp,
      totalClosing: perf.totalClosing,
      closingPercentage: closingPercentage,
      totalRevenue: perf.totalRevenue
    };
  }).sort((a, b) => b.closingPercentage - a.closingPercentage);
  
  // Populate table
  csArray.forEach((cs, index) => {
    const tr = document.createElement('tr');
    tr.className = index < 3 ? 'bg-green-50' : 'hover:bg-gray-50'; // Highlight top 3
    
    tr.innerHTML = `
      <td class="px-4 py-2 text-sm font-medium text-gray-900">${cs.name}</td>
      <td class="px-4 py-2 text-sm text-gray-900">${cs.totalFollowUp}</td>
      <td class="px-4 py-2 text-sm text-gray-900">${cs.totalClosing}</td>
      <td class="px-4 py-2 text-sm font-semibold ${cs.closingPercentage >= 20 ? 'text-green-600' : cs.closingPercentage >= 10 ? 'text-yellow-600' : 'text-red-600'}">${cs.closingPercentage.toFixed(1)}%</td>
      <td class="px-4 py-2 text-sm text-gray-900">Rp ${cs.totalRevenue.toLocaleString('id-ID')}</td>
      <td class="px-4 py-2 text-sm">
        <span class="px-2 py-1 text-xs font-medium rounded-full ${
          index === 0 ? 'bg-yellow-100 text-yellow-800' :
          index === 1 ? 'bg-gray-100 text-gray-800' :
          index === 2 ? 'bg-orange-100 text-orange-800' :
          'bg-blue-100 text-blue-800'
        }">
          ${index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
        </span>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
}

// Export functions
function exportToPDF() {
  // Simple implementation - in production, use libraries like jsPDF
  alert('Export PDF functionality - Integrate with jsPDF library for full implementation');
}

function exportToExcel() {
  // Simple CSV export
  const csvData = [];
  csvData.push(['Tanggal', 'Vendor', 'Channel', 'Budget', 'Lead', 'CPL', 'ROAS', 'Revenue']);
  
  allData.forEach(item => {
    csvData.push([
      item.tanggal,
      item.vendor,
      item.channel || '',
      item.budget || 0,
      item.lead || 0,
      item.CPL || 0,
      item.ROAS || 0,
      item.revenue || 0
    ]);
  });
  
  const csvContent = csvData.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `marketing_data_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

function sendDailyReport() {
  // Placeholder for email/WhatsApp integration
  alert('Send Daily Report - Integrate with email service or WhatsApp API');
}

// Function to show sheet analysis modal
function showSheetAnalysis(analysis) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-5xl max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-900">📊 Analisis Spreadsheet</h3>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
      </div>
      
      <div class="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 class="font-semibold mb-3 text-blue-900">📋 Informasi Sheet:</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">${analysis.sheetInfo?.totalRows || 0}</div>
            <div class="text-gray-600">Total Baris</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">${analysis.sheetInfo?.dataRows || 0}</div>
            <div class="text-gray-600">Data Baris</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">${analysis.sheetInfo?.totalColumns || 0}</div>
            <div class="text-gray-600">Kolom</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold text-orange-600">${analysis.sheetInfo?.name || 'Unknown'}</div>
            <div class="text-gray-600">Nama Sheet</div>
          </div>
        </div>
      </div>
      
      <div class="mb-6">
        <h4 class="font-semibold mb-3 text-gray-900">🔗 Mapping Kolom ke Dashboard:</h4>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm border border-gray-200 rounded-lg">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-3 text-left font-semibold">Nama Kolom</th>
                <th class="p-3 text-left font-semibold">Tipe Data</th>
                <th class="p-3 text-left font-semibold">Mapping Dashboard</th>
                <th class="p-3 text-left font-semibold">Contoh Data</th>
              </tr>
            </thead>
            <tbody>
              ${analysis.columnAnalysis?.map((col, index) => `
                <tr class="border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
                  <td class="p-3 font-medium text-gray-900">${col.columnName}</td>
                  <td class="p-3">
                    <span class="px-2 py-1 text-xs rounded bg-gray-200 text-gray-700">
                      ${col.dataType}
                    </span>
                  </td>
                  <td class="p-3">
                    <span class="px-2 py-1 text-xs rounded font-medium ${col.suggestedMapping !== 'custom' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                      ${col.suggestedMapping === 'custom' ? '⚠️ Custom' : '✅ ' + col.suggestedMapping}
                    </span>
                  </td>
                  <td class="p-3 text-xs text-gray-600">
                    ${col.sampleValues?.slice(0, 2).join(', ') || 'Tidak ada data'}
                    ${col.sampleValues?.length > 2 ? '...' : ''}
                  </td>
                </tr>
              `).join('') || '<tr><td colspan="4" class="p-4 text-center text-gray-500">Tidak ada analisis kolom tersedia</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="bg-green-50 p-4 rounded-lg mb-6">
        <h5 class="font-semibold text-green-800 mb-2">✅ Yang Akan Terjadi:</h5>
        <ul class="text-sm text-green-700 space-y-1">
          <li>• Dashboard akan membaca data dari spreadsheet ini</li>
          <li>• Kolom akan otomatis di-mapping ke format dashboard</li>
          <li>• Metrics seperti CPL, ROAS akan dihitung otomatis</li>
          <li>• Data akan update real-time setiap 30 detik</li>
        </ul>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button onclick="this.closest('.fixed').remove()" class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition">
          Tutup
        </button>
        <button onclick="migrateData()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
          🚀 Gunakan Data Ini
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Function to migrate data - actually use the existing data
function migrateData() {
  try {
    // Close the analysis modal first
    const modal = document.querySelector('.fixed');
    if (modal) {
      modal.remove();
    }
    
    // Switch to existing data source
    const dataSourceSelector = document.getElementById('dataSourceSelector');
    if (dataSourceSelector) {
      dataSourceSelector.value = 'existing';
      
      // Trigger change event to load existing data
      const changeEvent = new Event('change');
      dataSourceSelector.dispatchEvent(changeEvent);
    }
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    successMsg.textContent = 'Berhasil menggunakan data dari spreadsheet existing!';
    document.body.appendChild(successMsg);
    
    // Remove success message after 3 seconds
    setTimeout(() => {
      if (successMsg.parentNode) {
        successMsg.parentNode.removeChild(successMsg);
      }
    }, 3000);
    
  } catch (error) {
    console.error('Error in migrateData:', error);
    alert('Error: ' + error.message);
  }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  // Set default date range (last 30 days)
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  document.getElementById('filterDateFrom').value = thirtyDaysAgo.toISOString().split('T')[0];
  document.getElementById('filterDateTo').value = today.toISOString().split('T')[0];
  
  // Add export button listeners
  const exportPDFBtn = document.getElementById('exportPDFBtn');
  const exportExcelBtn = document.getElementById('exportExcelBtn');
  const sendReportBtn = document.getElementById('sendReportBtn');
  
  if (exportPDFBtn) exportPDFBtn.addEventListener('click', exportToPDF);
  if (exportExcelBtn) exportExcelBtn.addEventListener('click', exportToExcel);
  if (sendReportBtn) sendReportBtn.addEventListener('click', sendDailyReport);
  
  // Initial data fetch with default source
  const defaultSource = document.getElementById('dataSourceSelector').value;
  fetchData(defaultSource);
  
  // Set up periodic refresh (every 30 seconds) with current data source
  setInterval(() => {
    const currentSource = document.getElementById('dataSourceSelector').value;
    fetchData(currentSource);
  }, 30000);
});
