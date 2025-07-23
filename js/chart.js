// js/chart.js

let dailyChart = null;
let weeklyChart = null;
let vendorChart = null;

// Initialize the main daily chart
function initChart() {
  const ctx = document.getElementById('dailyChart');
  if (!ctx) return;

  dailyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],  // dates
      datasets: [
        {
          label: 'Total Lead',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 3,
          data: [],
          tension: 0.4,
          fill: true
        },
        {
          label: 'Lead Berdu',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 3,
          data: [],
          tension: 0.4,
          fill: true
        },
        {
          label: 'Realisasi CPL (Ribu)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 1)',
          borderWidth: 3,
          data: [],
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        },
        {
          label: 'Closing Percentage (%)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 3,
          data: [],
          tension: 0.4,
          fill: true,
          yAxisID: 'y2'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: 'Performance Harian - Lead, CPL, dan Closing Rate',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (label.includes('CPL')) {
                label += 'Rp ' + (context.parsed.y * 1000).toLocaleString('id-ID');
              } else if (label.includes('Percentage')) {
                label += context.parsed.y.toFixed(2) + '%';
              } else {
                label += context.parsed.y.toLocaleString('id-ID');
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Tanggal',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            display: false
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Jumlah Lead',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'CPL (Ribu Rupiah)',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          grid: {
            drawOnChartArea: false,
          },
        },
        y2: {
          type: 'linear',
          display: false,
          position: 'right',
          min: 0,
          max: 100
        }
      }
    }
  });
}

// Update chart datasets with new data from dashboard.js
function updateChart(filteredData) {
  if (!dailyChart) return;
  
  // Group data by tanggal and calculate metrics
  const grouped = {};
  filteredData.forEach(item => {
    const date = item.tanggal;
    if (!grouped[date]) {
      grouped[date] = { 
        totalLead: 0,
        leadBerdu: 0,
        cpl: [],
        closingPercentage: [],
        budget: 0,
        closing: 0,
        totalLeadFollowUp: 0
      };
    }
    
    // Aggregate PPC data
    if (item.role === 'PPC') {
      grouped[date].totalLead += Number(item.lead || 0);
      grouped[date].leadBerdu += Number(item.leadBerdu || 0);
      grouped[date].budget += Number(item.budget || 0);
      if (item.CPL && Number(item.CPL) > 0) {
        grouped[date].cpl.push(Number(item.CPL));
      }
    }
    
    // Aggregate CS data
    if (item.role === 'CS') {
      grouped[date].closing += Number(item.closing || 0);
      grouped[date].totalLeadFollowUp += Number(item.totalLeadFollowUp || 0);
      if (item.closingPercentage && Number(item.closingPercentage) >= 0) {
        grouped[date].closingPercentage.push(Number(item.closingPercentage));
      }
    }
  });
  
  // Sort dates and prepare data arrays
  const dates = Object.keys(grouped).sort();
  const totalLeads = dates.map(date => grouped[date].totalLead);
  const leadBerdus = dates.map(date => grouped[date].leadBerdu);
  const avgCPLs = dates.map(date => {
    const cplArray = grouped[date].cpl;
    const avgCPL = cplArray.length > 0 ? cplArray.reduce((a, b) => a + b, 0) / cplArray.length : 0;
    return avgCPL / 1000; // Convert to thousands for better visualization
  });
  const avgClosingPercentages = dates.map(date => {
    const closingArray = grouped[date].closingPercentage;
    return closingArray.length > 0 ? closingArray.reduce((a, b) => a + b, 0) / closingArray.length : 0;
  });
  
  // Update chart data
  dailyChart.data.labels = dates;
  dailyChart.data.datasets[0].data = totalLeads;
  dailyChart.data.datasets[1].data = leadBerdus;
  dailyChart.data.datasets[2].data = avgCPLs;
  dailyChart.data.datasets[3].data = avgClosingPercentages;
  
  // Animate the update
  dailyChart.update('active');
}

// Create additional charts for Manager dashboard
function initAdditionalCharts() {
  // Weekly performance chart
  const weeklyCtx = document.getElementById('weeklyChart');
  if (weeklyCtx) {
    weeklyChart = new Chart(weeklyCtx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Total Lead vs Target',
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            data: []
          },
          {
            label: 'Target Lead',
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            data: []
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Weekly Performance - Lead vs Target'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Jumlah Lead'
            }
          }
        }
      }
    });
  }

  // Vendor composition pie chart
  const vendorCtx = document.getElementById('vendorChart');
  if (vendorCtx) {
    vendorChart = new Chart(vendorCtx, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(34, 197, 94, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Komposisi Lead per Vendor'
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}

// Update vendor chart
function updateVendorChart(filteredData) {
  if (!vendorChart) return;
  
  const vendorData = {};
  filteredData.forEach(item => {
    if (item.vendor && item.lead) {
      vendorData[item.vendor] = (vendorData[item.vendor] || 0) + Number(item.lead);
    }
  });
  
  const vendors = Object.keys(vendorData);
  const leads = Object.values(vendorData);
  
  vendorChart.data.labels = vendors;
  vendorChart.data.datasets[0].data = leads;
  vendorChart.update();
}

// Update weekly chart
function updateWeeklyChart(filteredData) {
  if (!weeklyChart) return;
  
  // Group by week and calculate totals
  const weeklyData = {};
  const targetPerWeek = 500; // Example target, adjust as needed
  
  filteredData.forEach(item => {
    const date = new Date(item.tanggal);
    const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = 0;
    }
    weeklyData[weekKey] += Number(item.lead || 0);
  });
  
  const weeks = Object.keys(weeklyData).sort();
  const weeklyLeads = Object.values(weeklyData);
  const targets = weeks.map(() => targetPerWeek);
  
  weeklyChart.data.labels = weeks.map(week => `Week ${week}`);
  weeklyChart.data.datasets[0].data = weeklyLeads;
  weeklyChart.data.datasets[1].data = targets;
  weeklyChart.update();
}

// Function to show/hide chart based on role
function toggleChartVisibility(role) {
  const chartSection = document.querySelector('#dailyChart').closest('section');
  if (role === 'PPC') {
    // PPC can see limited chart data
    chartSection.style.display = 'block';
  } else if (role === 'CS') {
    // CS can see follow-up related charts
    chartSection.style.display = 'block';
  } else {
    // Manager can see everything
    chartSection.style.display = 'block';
  }
}

// Initialize chart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure canvas is properly rendered
  setTimeout(initChart, 100);
});

// Export functions for use in dashboard.js
window.chartFunctions = {
  updateChart,
  toggleChartVisibility,
  initChart,
  initAdditionalCharts,
  updateVendorChart,
  updateWeeklyChart
};
