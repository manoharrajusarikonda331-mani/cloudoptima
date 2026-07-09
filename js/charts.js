/* ==========================================================================
   CLOUDO-OPTIMA GRAPHICS ENGINE
   Wrapper class managing Chart.js updates, rendering, and dynamic telemetry mapping
   ========================================================================== */

let cloudSpendChart = null;
let llmRoutingChart = null;

// Initialize Chart contexts
export function initCharts() {
    const cloudCtx = document.getElementById('cloud-spend-chart');
    const llmCtx = document.getElementById('llm-routing-chart');
    
    if (!cloudCtx || !llmCtx) return;

    // Chart.js Default styling adjustments
    Chart.defaults.color = '#9ca3af';
    Chart.defaults.font.family = "'Space Grotesk', sans-serif";
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';

    // 1. Cloud Spend Chart (Line Chart)
    cloudSpendChart = new Chart(cloudCtx, {
        type: 'line',
        data: {
            labels: ["09:00", "09:10", "09:20", "09:30", "09:40", "09:50"],
            datasets: [
                {
                    label: 'Infrastructure Cost ($/mo)',
                    data: [14245, 14245, 14245, 14245, 14245, 14245],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.04)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#ef4444'
                },
                {
                    label: 'LLM Query Costs ($/hr)',
                    data: [85, 92, 110, 95, 125, 118],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.04)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#6366f1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(16, 22, 38, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 10 } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { font: { size: 10 } }
                }
            }
        }
    });

    // 2. LLM Routing Distribution Chart (Doughnut Chart)
    llmRoutingChart = new Chart(llmCtx, {
        type: 'doughnut',
        data: {
            labels: ['Offloaded (Local Llama-3)', 'Escalated (Premium Claude)'],
            datasets: [{
                data: [1, 1], // Initial balance
                backgroundColor: [
                    '#10b981', // Emerald for Local
                    '#6366f1'  // Indigo for Premium
                ],
                borderColor: 'rgba(16, 22, 38, 0.8)',
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(16, 22, 38, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderWidth: 1
                }
            },
            cutout: '65%'
        }
    });
}

// Redraw chart components with current state telemetry arrays
export function updateCharts(history) {
    if (!cloudSpendChart || !llmRoutingChart) return;

    // Update Line Chart values
    cloudSpendChart.data.labels = history.labels;
    cloudSpendChart.data.datasets[0].data = history.cloudSpend;
    cloudSpendChart.data.datasets[1].data = history.llmSpend;
    
    // Smooth update animation
    cloudSpendChart.update('active');

    // Update Doughnut Chart values
    const localVal = history.routingDistribution.local;
    const premiumVal = history.routingDistribution.premium;
    
    // Prevent 0/0 chart rendering errors
    if (localVal === 0 && premiumVal === 0) {
        llmRoutingChart.data.datasets[0].data = [1, 1];
    } else {
        llmRoutingChart.data.datasets[0].data = [localVal, premiumVal];
    }
    
    llmRoutingChart.update('active');
}
