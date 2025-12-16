console.log("chart.js loaded");

// サイバーテーマのカラーパレット
const chartColors = {
    primary: "#00ff9f",
    primaryLight: "#00ffcc",
    secondary: "#ff006e",
    secondaryLight: "#ff4d94",
    accent: "#ffbe0b",
    accentLight: "#ffd60a",
    info: "#00d4ff",
    infoLight: "#00e5ff",
    danger: "#ff006e",
    dangerLight: "#ff4d94",
};

// ダークテーマかどうかを判定
function isDarkTheme() {
    return document.body.classList.contains("dark-theme");
}

// 共通のグラフオプション
function getCommonChartOptions() {
    const isDark = isDarkTheme();
    const textColor = isDark ? "#F1F5F9" : "#374151";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
    const borderColor = isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)";
    const tooltipBg = isDark ? "rgba(31, 41, 55, 0.95)" : "rgba(0, 0, 0, 0.8)";
    
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "top",
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: { size: 12, weight: "500" },
                    color: textColor
                }
            },
            tooltip: {
                backgroundColor: tooltipBg,
                padding: 12,
                titleFont: { size: 14, weight: "600" },
                bodyFont: { size: 13 },
                borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)",
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                titleColor: "#ffffff",
                bodyColor: "#ffffff"
            }
        },
        scales: {
            x: {
                grid: { display: true, color: gridColor, drawBorder: true, borderColor: borderColor },
                ticks: { font: { size: 11 }, color: textColor }
            },
            y: {
                grid: { display: true, color: gridColor, drawBorder: true, borderColor: borderColor },
                ticks: { font: { size: 11 }, color: textColor }
            }
        }
    };
}

// 現在の単位（localStorageから復元）
let currentUnit = localStorage.getItem("displayUnit") || "mb";

// 現在の時間範囲（分）
let flowsTimeRangeMinutes = parseInt(localStorage.getItem("timeRange")) || 10;

// キャッシュされたデータ
let cachedFlowsByBytesData = null;
let cachedFlowsByPacketsData = null;

// チャートインスタンス
let flowsChartData = null;

// テーマ変更時にグラフを更新
window.updateChartsTheme = function() {
    const commonOptions = getCommonChartOptions();
    const textColor = isDarkTheme() ? "#F1F5F9" : "#374151";
    
    if (flowsChartData) {
        if (flowsChartData.options.plugins) {
            if (flowsChartData.options.plugins.legend) flowsChartData.options.plugins.legend.labels.color = textColor;
            if (flowsChartData.options.plugins.tooltip) {
                flowsChartData.options.plugins.tooltip.backgroundColor = commonOptions.plugins.tooltip.backgroundColor;
                flowsChartData.options.plugins.tooltip.borderColor = commonOptions.plugins.tooltip.borderColor;
            }
        }
        if (flowsChartData.options.scales) {
            if (flowsChartData.options.scales.x) {
                flowsChartData.options.scales.x.grid.color = commonOptions.scales.x.grid.color;
                flowsChartData.options.scales.x.grid.borderColor = commonOptions.scales.x.grid.borderColor;
                flowsChartData.options.scales.x.ticks.color = textColor;
                if (flowsChartData.options.scales.x.title) flowsChartData.options.scales.x.title.color = textColor;
            }
            if (flowsChartData.options.scales.y) {
                flowsChartData.options.scales.y.grid.color = commonOptions.scales.y.grid.color;
                flowsChartData.options.scales.y.grid.borderColor = commonOptions.scales.y.grid.borderColor;
                flowsChartData.options.scales.y.ticks.color = textColor;
                if (flowsChartData.options.scales.y.title) flowsChartData.options.scales.y.title.color = textColor;
            }
        }
        flowsChartData.update();
    }
}

// テーマ変更イベントをリッスン
document.addEventListener("DOMContentLoaded", () => {
    const observer = new MutationObserver(() => {
        if (typeof window.updateChartsTheme === "function") {
            window.updateChartsTheme();
        }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
});

// データを取得
async function loadFlows() {
    try {
        const [flowsByBytesRes, flowsByPacketsRes] = await Promise.all([
            fetch(`/api/flowsByBytes?minutes=${flowsTimeRangeMinutes}`),
            fetch(`/api/flowsByPackets?minutes=${flowsTimeRangeMinutes}`),
        ]);

        if (!flowsByBytesRes.ok || !flowsByPacketsRes.ok) {
            throw new Error("HTTP error");
        }

        [cachedFlowsByBytesData, cachedFlowsByPacketsData] = await Promise.all([
            flowsByBytesRes.json(),
            flowsByPacketsRes.json(),
        ]);

        updateFlowsChart();

    } catch (err) {
        console.error(err);
    }
}

// Top 10 フローチャートを更新
function updateFlowsChart() {
    const canvas = document.getElementById("flowsChart");
    if (!canvas) return;

    const data = currentUnit === "mb" ? cachedFlowsByBytesData : cachedFlowsByPacketsData;
    if (!data) return;

    const labels = data.map(row => {
        if (row.direction === 'in') return row.src_ip;
        if (row.direction === 'out') return row.dst_ip;
        return `${row.src_ip} → ${row.dst_ip}`;
    });
    
    const values = currentUnit === "mb" 
        ? data.map(row => row.bytes / 1024 / 1024)
        : data.map(row => row.packets);
    
    const barColors = data.map(row => {
        if (row.direction === 'in') return chartColors.primary;
        if (row.direction === 'out') return chartColors.secondary;
        return chartColors.info;
    });
    const borderColors = data.map(row => {
        if (row.direction === 'in') return chartColors.primaryLight;
        if (row.direction === 'out') return chartColors.secondaryLight;
        return chartColors.infoLight;
    });

    const xAxisLabel = currentUnit === "mb" ? "データ量 (MB)" : "パケット数";
    const tooltipCallback = currentUnit === "mb"
        ? (context) => "データ量: " + context.parsed.x.toFixed(2) + " MB"
        : (context) => "パケット数: " + context.parsed.x.toLocaleString() + " pkt";

    if (!flowsChartData) {
        flowsChartData = new Chart(canvas, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: xAxisLabel,
                    data: values,
                    backgroundColor: barColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                }]
            },
            options: {
                ...getCommonChartOptions(),
                indexAxis: "y",
                plugins: {
                    ...getCommonChartOptions().plugins,
                    legend: {
                        display: true,
                        position: "top",
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 12, weight: "500" },
                            color: isDarkTheme() ? "#F1F5F9" : "#374151",
                            generateLabels: function(chart) {
                                const textColor = isDarkTheme() ? "#F1F5F9" : "#374151";
                                return [
                                    { text: "IN", fillStyle: chartColors.primary, strokeStyle: chartColors.primaryLight, lineWidth: 2, pointStyle: "circle", fontColor: textColor },
                                    { text: "OUT", fillStyle: chartColors.secondary, strokeStyle: chartColors.secondaryLight, lineWidth: 2, pointStyle: "circle", fontColor: textColor }
                                ];
                            }
                        }
                    },
                    tooltip: {
                        ...getCommonChartOptions().plugins.tooltip,
                        callbacks: { label: tooltipCallback }
                    }
                },
                scales: {
                    x: {
                        ...getCommonChartOptions().scales.x,
                        title: { display: true, text: xAxisLabel, font: { size: 13, weight: "600" }, color: isDarkTheme() ? "#F1F5F9" : "#374151" },
                        beginAtZero: true
                    },
                    y: {
                        ...getCommonChartOptions().scales.y,
                        title: { display: true, text: "フロー", font: { size: 13, weight: "600" }, color: isDarkTheme() ? "#F1F5F9" : "#374151" }
                    }
                },
                animation: { duration: 300 }
            }
        });
    } else {
        flowsChartData.data.labels = labels;
        flowsChartData.data.datasets[0].data = values;
        flowsChartData.data.datasets[0].label = xAxisLabel;
        flowsChartData.data.datasets[0].backgroundColor = barColors;
        flowsChartData.data.datasets[0].borderColor = borderColors;
        flowsChartData.options.scales.x.title.text = xAxisLabel;
        flowsChartData.options.plugins.tooltip.callbacks.label = tooltipCallback;
        flowsChartData.update();
    }
}

// グラフタイトルを更新
function updateFlowsChartTitles() {
    const unitLabel = currentUnit === "mb" ? "/Bytes" : "/Packets";
    
    const top10Title = document.getElementById("top10-title");
    if (top10Title) {
        const baseText = top10Title.getAttribute("data-i18n-base") || top10Title.textContent.replace(/\s*\/.*$/, '');
        top10Title.setAttribute("data-i18n-base", baseText);
        top10Title.textContent = baseText + " " + unitLabel;
    }
}

// 単位変更時（グローバルに公開）
window.onUnitChange = function(unit) {
    currentUnit = unit;
    updateFlowsChart();
    updateFlowsChartTitles();
}

// 時間範囲変更時（グローバルに公開）
window.onTimeRangeChange = function(minutes) {
    flowsTimeRangeMinutes = minutes;
    loadFlows();
}

// キャプチャ状態チェック
async function checkCaptureStatus() {
    try {
        const res = await fetch("/api/captureStatus");
        if (!res.ok) return;
        
        const data = await res.json();
        
        document.querySelectorAll('.chart-title').forEach(title => {
            title.classList.toggle('running', data.active);
            title.classList.toggle('stopped', !data.active);
        });
        
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle) {
            headerTitle.classList.toggle('running', data.active);
            headerTitle.classList.toggle('stopped', !data.active);
        }
    } catch (err) {
        console.error("Failed to check capture status:", err);
    }
}

let timerId;
let statusTimerId;

// ページ読み込み時
window.addEventListener("DOMContentLoaded", () => {
    // 保存された単位を復元
    currentUnit = localStorage.getItem("displayUnit") || "mb";
    
    // 初期タイトル更新
    updateFlowsChartTitles();
    
    loadFlows();
    checkCaptureStatus();
    timerId = setInterval(loadFlows, 5000);
    statusTimerId = setInterval(checkCaptureStatus, 5000);
});
