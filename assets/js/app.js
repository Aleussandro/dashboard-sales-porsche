// Register datalabels plugin globally if available
if (typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
    Chart.defaults.plugins.datalabels.display = false; // Disable globally, enable locally
}

// dashboard_data.js defines `PORSCHE_DATA`
let filteredData = [...PORSCHE_DATA];

// Elements
const elModel = document.getElementById('filter-model');
const elYear = document.getElementById('filter-year');
const elCity = document.getElementById('filter-city');
const elPay = document.getElementById('filter-pay');
const elPeriodStart = document.getElementById('filter-period-start');
const elPeriodEnd = document.getElementById('filter-period-end');

// Chart instances
let chartModelsCity = null;
let chartYearPeriod = null;
let chartEvolutionState = null;

// Theme Toggle Logic
function setupThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // Check saved theme
    const savedTheme = localStorage.getItem('porsche_theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.innerText = '☀️';
        Chart.defaults.color = '#E0E0E0'; // Dark mode text for charts
    } else {
        Chart.defaults.color = '#666';
    }

    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('porsche_theme', 'light');
            themeIcon.innerText = '🌙';
            Chart.defaults.color = '#666';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('porsche_theme', 'dark');
            themeIcon.innerText = '☀️';
            Chart.defaults.color = '#E0E0E0';
        }

        const newGridColor = currentTheme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
        
        // Update grid line colors dynamically
        [chartModelsCity, chartYearPeriod, chartEvolutionState].forEach(chart => {
            if (chart) {
                if (chart.options.scales.x) chart.options.scales.x.grid.color = newGridColor;
                if (chart.options.scales.y) chart.options.scales.y.grid.color = newGridColor;
            }
        });

        // Force chart update to reflect new colors
        if (chartModelsCity) chartModelsCity.update();
        if (chartYearPeriod) chartYearPeriod.update();
        if (chartEvolutionState) chartEvolutionState.update();
    });
}

// Initialize
function init() {
    setupThemeToggle();

    // Populate filters
    populateFilters();

    // Initial Render
    updateDashboard();

    // Event listeners
    document.getElementById('btn-apply-filters').addEventListener('click', () => {
        applyFilters();
    });

    document.getElementById('btn-clear-filters').addEventListener('click', () => {
        elModel.value = '';
        elYear.value = '';
        elCity.value = '';
        elPay.value = '';
        elPeriodStart.value = '';
        elPeriodEnd.value = '';
        applyFilters();
    });
}

function getUniqueValues(key) {
    const vals = PORSCHE_DATA.map(d => d[key]).filter(v => v !== 'INVALID' && v != null);
    return [...new Set(vals)].sort();
}

function populateFilters() {
    const models = getUniqueValues('PorscheModelSanitized');
    const years = getUniqueValues('ModelYearSanitized');
    const cities = getUniqueValues('CitySanitized');
    const pays = getUniqueValues('PayMethodSanitized');

    models.forEach(m => elModel.add(new Option(m, m)));
    years.forEach(y => elYear.add(new Option(y, y)));
    cities.forEach(c => elCity.add(new Option(c, c)));
    pays.forEach(p => elPay.add(new Option(p, p)));
}

function parseDateInput(val) {
    if (!val) return null;
    // Format YYYY-MM-DD
    if (val.match(/^\d{4}-\d{2}-\d{2}$/)) return val;
    // Format DD/MM/YYYY (Brazilian)
    const brMatch = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (brMatch) return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
    // Fallback to JS Date
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    return null;
}

function applyFilters() {
    const model = elModel.value;
    const year = elYear.value;
    const city = elCity.value;
    const pay = elPay.value;
    const pStart = parseDateInput(elPeriodStart.value);
    const pEnd = parseDateInput(elPeriodEnd.value);

    filteredData = PORSCHE_DATA.filter(d => {
        if (model && d.PorscheModelSanitized !== model) return false;
        if (year && String(d.ModelYearSanitized) !== String(year)) return false;
        if (city && d.CitySanitized !== city) return false;
        if (pay && d.PayMethodSanitized !== pay) return false;

        // Date logic
        if (d.SaleDateSanitized === 'INVALID') {
            if (pStart || pEnd) return false; // Ignore invalids if filtering by date
        } else {
            if (pStart && d.SaleDateSanitized < pStart) return false;
            if (pEnd && d.SaleDateSanitized > pEnd) return false;
        }
        return true;
    });

    updateDashboard();
}

function updateDashboard() {
    updateKPIs();
    renderChartModelsCity();
    renderChartYearPeriod();
    renderChartEvolutionState();
    generateInsights();
}

function updateKPIs() {
    let totalSales = 0;
    let units = filteredData.length;
    let modelCounts = {};

    filteredData.forEach(d => {
        const priceStr = String(d.SalesPriceSanitized).replace(/[^0-9.-]/g, '');
        totalSales += parseFloat(priceStr) || 0;

        const m = d.PorscheModelSanitized;
        if (m && m !== 'INVALID') {
            modelCounts[m] = (modelCounts[m] || 0) + 1;
        }
    });

    document.getElementById('kpi-total-units').innerText = units;

    // format to USD
    document.getElementById('kpi-total-sales').innerText = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalSales);

    let topModel = '-';
    let max = 0;
    for (const [m, count] of Object.entries(modelCounts)) {
        if (count > max) {
            max = count;
            topModel = m;
        }
    }
    document.getElementById('kpi-top-model').innerText = topModel;
}

function renderChartModelsCity() {
    const ctx = document.getElementById('chart-models-city').getContext('2d');

    // 1. Paleta de Cores baseada no padrão atual (Porsche/Racing) - 5 cores distintas
    const baseColors = [
        { bg: 'rgba(213, 0, 28, 0.8)', border: '#D5001C' },   // Red Porsche
        { bg: 'rgba(25, 25, 25, 0.8)', border: '#191919' },   // Black
        { bg: 'rgba(216, 159, 15, 0.8)', border: '#D89F0F' }, // Gold
        { bg: 'rgba(59, 130, 246, 0.8)', border: '#3b82f6' }, // Blue
        { bg: 'rgba(16, 185, 129, 0.8)', border: '#10b981' }  // Green
    ];

    // Determine Top 5 Cities based on filteredData to map as datasets
    const cityCounts = {};
    filteredData.forEach(d => {
        const c = d.CitySanitized;
        if (c && c !== 'INVALID') {
            cityCounts[c] = (cityCounts[c] || 0) + 1;
        }
    });

    // As Top 5 Cidades
    const targetCities = Object.entries(cityCounts)
        .sort((a, b) => b[1] - a[1])
        .map(x => x[0])
        .slice(0, 5);

    // 2. Manipulação de Dados (Data Wrangling)
    // Precisamos limitar aos Top Modelos para evitar que 20 modelos espremam as barras!
    const elTopModels = document.getElementById('filter-top-models');
    const topN = elTopModels ? parseInt(elTopModels.value, 10) : 5;

    const modelTotals = {};
    filteredData.forEach(d => {
        const m = d.PorscheModelSanitized;
        if (m && m !== 'INVALID') {
            modelTotals[m] = (modelTotals[m] || 0) + 1;
        }
    });

    const topModels = Object.entries(modelTotals)
        .sort((a, b) => b[1] - a[1])
        .map(x => x[0])
        .slice(0, topN);

    // Criar a estrutura dos datasets
    const datasets = targetCities.map((city, idx) => {
        const color = baseColors[idx % baseColors.length];
        return {
            label: city,
            backgroundColor: color.bg,
            borderColor: color.border,
            borderWidth: 1,
            borderRadius: 4,
            data: topModels.map(model => {
                // Filtrar os dados brutos combinando o nome da cidade com cada modelo de carro específico, e retorne o .length
                return filteredData.filter(d => d.CitySanitized === city && d.PorscheModelSanitized === model).length;
            })
        };
    });

    if (chartModelsCity) chartModelsCity.destroy();

    // 3. Configuração do Chart.js
    chartModelsCity = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topModels,
            datasets: datasets
        },
        options: {
            indexAxis: 'y', // Horizontal bar chart
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { right: 40 } // Prevent label cutoff
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'bottom'
                },
                datalabels: {
                    display: true,
                    color: () => document.documentElement.getAttribute('data-theme') === 'dark' ? '#E0E0E0' : '#666',
                    anchor: 'end',
                    align: 'right',
                    clip: false,
                    font: { weight: 'bold' },
                    formatter: (value) => value > 0 ? value : ''
                }
            },
            scales: {
                x: {
                    stacked: false, // Grouped instead of stacked
                    suggestedMax: 5, // Prevent axis locking at 1 unit
                    grid: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
                },
                y: {
                    stacked: false, // Grouped instead of stacked
                    grid: { display: false }
                }
            }
        }
    });
}

function renderChartYearPeriod() {
    const ctx = document.getElementById('chart-year-period').getContext('2d');

    // Group by ModelYearSanitized
    const yearCounts = {};
    filteredData.forEach(d => {
        const y = d.ModelYearSanitized;
        if (!y || y === 'INVALID') return;
        yearCounts[y] = (yearCounts[y] || 0) + 1;
    });

    const labels = Object.keys(yearCounts).sort();
    const data = labels.map(l => yearCounts[l]);

    if (chartYearPeriod) chartYearPeriod.destroy();

    chartYearPeriod = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Unidades Vendidas por Ano de Modelo',
                data: data,
                borderColor: '#D5001C',
                backgroundColor: 'rgba(213, 0, 28, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 6, // Ensures single points are visible
                pointBackgroundColor: '#D5001C',
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                datalabels: { display: false }
            },
            scales: {
                x: {
                    grid: {
                        color: document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });
}

function renderChartEvolutionState() {
    const canvas = document.getElementById('chart-evolution-state');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const baseColors = [
        { bg: 'rgba(213, 0, 28, 0.8)', border: '#D5001C' },
        { bg: 'rgba(25, 25, 25, 0.8)', border: '#191919' },
        { bg: 'rgba(216, 159, 15, 0.8)', border: '#D89F0F' },
        { bg: 'rgba(59, 130, 246, 0.8)', border: '#3b82f6' },
        { bg: 'rgba(16, 185, 129, 0.8)', border: '#10b981' }
    ];

    // Determine Top 5 States by Revenue
    const stateRevenue = {};
    filteredData.forEach(d => {
        const s = d.StateSanitized;
        if (s && s !== 'INVALID') {
            stateRevenue[s] = (stateRevenue[s] || 0) + (parseFloat(d.SalesPriceSanitized) || 0);
        }
    });

    const topStates = Object.entries(stateRevenue)
        .sort((a, b) => b[1] - a[1])
        .map(x => x[0])
        .slice(0, 5);

    // Get unique valid months (YYYY-MM)
    const monthSet = new Set();
    filteredData.forEach(d => {
        if (d.SaleDateSanitized && d.SaleDateSanitized !== 'INVALID') {
            monthSet.add(d.SaleDateSanitized.substring(0, 7)); // '2024-03'
        }
    });
    const months = Array.from(monthSet).sort();

    // Create datasets
    const datasets = topStates.map((state, index) => {
        const color = baseColors[index % baseColors.length];
        const data = months.map(m => {
            const sales = filteredData.filter(d => 
                d.StateSanitized === state && 
                d.SaleDateSanitized && 
                d.SaleDateSanitized.startsWith(m)
            );
            return sales.reduce((sum, d) => sum + (parseFloat(d.SalesPriceSanitized) || 0), 0);
        });

        return {
            label: state,
            data: data,
            borderColor: color.border,
            backgroundColor: color.bg,
            borderWidth: 2,
            tension: 0.3,
            fill: false,
            pointBackgroundColor: color.border,
            pointRadius: 4,
            pointHoverRadius: 6
        };
    });

    if (chartEvolutionState) chartEvolutionState.destroy();

    chartEvolutionState = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                },
                datalabels: {
                    display: false // Hide data labels for lines to keep it clean
                }
            },
            scales: {
                x: {
                    grid: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
                },
                y: {
                    ticks: { 
                        callback: function(value) {
                            return '$' + (value / 1000) + 'k';
                        }
                    },
                    grid: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
                }
            }
        }
    });
}

function generateInsights() {
    const insightsList = document.getElementById('insights-list');
    insightsList.innerHTML = '';

    const cityModels = {};
    filteredData.forEach(d => {
        const c = d.CitySanitized;
        const m = d.PorscheModelSanitized;
        if (!c || c === 'INVALID' || !m || m === 'INVALID') return;
        if (!cityModels[c]) cityModels[c] = {};
        cityModels[c][m] = (cityModels[c][m] || 0) + 1;
    });

    let html = '';

    // Insight 1: City with most sales
    let maxCity = '';
    let maxSales = 0;
    for (const [c, models] of Object.entries(cityModels)) {
        const total = Object.values(models).reduce((a, b) => a + b, 0);
        if (total > maxSales) {
            maxSales = total;
            maxCity = c;
        }
    }

    if (maxCity) {
        html += `<div class="insight-item">A cidade de <strong>${maxCity}</strong> lidera o volume de vendas com <strong>${maxSales} unidades</strong> comercializadas no cenário filtrado.</div>`;
    }

    // Insight 2: Model preference in top cities
    for (const [c, models] of Object.entries(cityModels)) {
        let topModel = '';
        let topCount = 0;
        for (const [m, count] of Object.entries(models)) {
            if (count > topCount) {
                topCount = count;
                topModel = m;
            }
        }
        if (topCount > 0 && c === maxCity) { // just highlight for top city to avoid clutter
            html += `<div class="insight-item">Em <strong>${c}</strong>, o modelo de maior sucesso é o <strong>${topModel}</strong>, representando forte aderência do público local.</div>`;
        }
    }

    if (!html) {
        html = '<p>Não há dados suficientes para gerar insights com os filtros atuais.</p>';
    }

    insightsList.innerHTML = html;
}

init();
