console.log("realtime-chart.js loaded");

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

// 共通のグラフオプション（動的に生成）
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

// チャートのテーマを更新
function updateChartTheme(chartData) {
    if (!chartData) return;
    const commonOptions = getCommonChartOptions();
    const textColor = isDarkTheme() ? "#F1F5F9" : "#374151";
    
    if (chartData.options.plugins) {
        if (chartData.options.plugins.legend) {
            chartData.options.plugins.legend.labels.color = textColor;
        }
        if (chartData.options.plugins.tooltip) {
            chartData.options.plugins.tooltip.backgroundColor = commonOptions.plugins.tooltip.backgroundColor;
            chartData.options.plugins.tooltip.borderColor = commonOptions.plugins.tooltip.borderColor;
        }
    }
    if (chartData.options.scales) {
        if (chartData.options.scales.x) {
            chartData.options.scales.x.grid.color = commonOptions.scales.x.grid.color;
            chartData.options.scales.x.grid.borderColor = commonOptions.scales.x.grid.borderColor;
            chartData.options.scales.x.ticks.color = textColor;
            if (chartData.options.scales.x.title) chartData.options.scales.x.title.color = textColor;
        }
        if (chartData.options.scales.y) {
            chartData.options.scales.y.grid.color = commonOptions.scales.y.grid.color;
            chartData.options.scales.y.grid.borderColor = commonOptions.scales.y.grid.borderColor;
            chartData.options.scales.y.ticks.color = textColor;
            if (chartData.options.scales.y.title) chartData.options.scales.y.title.color = textColor;
        }
    }
    chartData.update();
}

// テーマ変更時にグラフを更新
window.updateChartsTheme = function() {
    updateChartTheme(realtimeChartData);
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

// 現在の時間幅（分）と単位
let currentTimeRangeMinutes = 10;
let currentUnit = localStorage.getItem("displayUnit") || "mb";

// 保存されたデータ（単位切り替え用）
let cachedData = null;
let cachedLabels = null;

// 時間幅に応じた集約間隔（秒）
function getAggregationInterval(minutes) {
    if (minutes <= 10) return 5;
    if (minutes === 60) return 30;
    if (minutes === 1440) return 600;
    if (minutes === 10080) return 3600;
    if (minutes === 40320) return 21600;
    return 86400;
}

// データポイント数を計算
function getDataPointCount(minutes) {
    const interval = getAggregationInterval(minutes);
    return (minutes * 60) / interval;
}

// 現在時刻をキリのいい数字に切り捨て
function floorToInterval(date, intervalSeconds) {
    const ms = date.getTime();
    const intervalMs = intervalSeconds * 1000;
    return new Date(Math.floor(ms / intervalMs) * intervalMs);
}

// 横軸のラベルを生成
function generateTimeLabels(minutes) {
    const labels = [];
    const now = new Date();
    const dataPoints = getDataPointCount(minutes);
    const interval = getAggregationInterval(minutes);
    const baseTime = floorToInterval(now, interval);
    
    for (let i = dataPoints - 1; i >= 0; i--) {
        const time = new Date(baseTime.getTime() - i * interval * 1000);
        if (minutes <= 10) {
            labels.push(time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } else if (minutes >= 525600) {
            labels.push(time.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }));
        } else if (minutes >= 40320) {
            labels.push(time.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }));
        } else if (minutes >= 10080) {
            labels.push(time.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }) + ' ' + 
                       time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
        } else {
            labels.push(time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
        }
    }
    return labels;
}

// データをタイムスタンプでマッピング・集約
function mapDataToLabels(data, minutes) {
    const dataPoints = getDataPointCount(minutes);
    const interval = getAggregationInterval(minutes);
    const baseTime = floorToInterval(new Date(), interval);
    const nowSeconds = Math.floor(baseTime.getTime() / 1000);
    const result = {
        inBytes: new Array(dataPoints).fill(0),
        outBytes: new Array(dataPoints).fill(0),
        inPackets: new Array(dataPoints).fill(0),
        outPackets: new Array(dataPoints).fill(0)
    };
    
    data.forEach(row => {
        const secondsAgo = nowSeconds - row.timestamp;
        const index = dataPoints - 1 - Math.floor(secondsAgo / interval);
        if (index >= 0 && index < dataPoints) {
            result.inBytes[index] += parseFloat(((row.in_bytes || 0) / (1024 * 1024)).toFixed(4));
            result.outBytes[index] += parseFloat(((row.out_bytes || 0) / (1024 * 1024)).toFixed(4));
            result.inPackets[index] += row.in_packets || 0;
            result.outPackets[index] += row.out_packets || 0;
        }
    });
    
    result.inBytes = result.inBytes.map(v => parseFloat(v.toFixed(2)));
    result.outBytes = result.outBytes.map(v => parseFloat(v.toFixed(2)));
    
    return result;
}

// 必要なレコード数
function getRequiredRecordCount(minutes) {
    return minutes * 12;
}

// リアルタイムデータを取得
async function loadRealtimeData() {
    try {
        const limit = getRequiredRecordCount(currentTimeRangeMinutes);
        const res = await fetch(`/api/realtimePackets?limit=${limit}`);
        
        if (!res.ok) throw new Error("HTTP error" + res.status);
        
        const data = await res.json();
        cachedLabels = generateTimeLabels(currentTimeRangeMinutes);
        cachedData = mapDataToLabels(data, currentTimeRangeMinutes);
        
        updateRealtimeChart();
        updateStats();
        
    } catch (err) {
        console.error(err);
    }
}

// 統計を更新
function updateStats() {
    if (!cachedData) return;
    
    let inData, outData;
    let formatFn;
    
    if (currentUnit === "mb") {
        inData = cachedData.inBytes;
        outData = cachedData.outBytes;
        formatFn = (val) => {
            if (val >= 1) return val.toFixed(2) + " MB";
            return (val * 1024).toFixed(1) + " KB";
        };
    } else {
        inData = cachedData.inPackets;
        outData = cachedData.outPackets;
        formatFn = (val) => {
            if (val >= 1000) return (val / 1000).toFixed(1) + "K";
            return Math.round(val).toString();
        };
    }
    
    const peakIn = Math.max(...inData);
    const peakOut = Math.max(...outData);
    
    const validIn = inData.filter(v => v > 0);
    const validOut = outData.filter(v => v > 0);
    
    const avgIn = validIn.length > 0 ? validIn.reduce((a, b) => a + b, 0) / validIn.length : 0;
    const avgOut = validOut.length > 0 ? validOut.reduce((a, b) => a + b, 0) / validOut.length : 0;
    
    const peakInEl = document.getElementById("stat-peak-in");
    const peakOutEl = document.getElementById("stat-peak-out");
    const avgInEl = document.getElementById("stat-avg-in");
    const avgOutEl = document.getElementById("stat-avg-out");
    
    if (peakInEl) peakInEl.textContent = formatFn(peakIn);
    if (peakOutEl) peakOutEl.textContent = formatFn(peakOut);
    if (avgInEl) avgInEl.textContent = formatFn(avgIn);
    if (avgOutEl) avgOutEl.textContent = formatFn(avgOut);
}

let realtimeChartData = null;

// リアルタイムグラフを更新
function updateRealtimeChart() {
    if (!cachedData || !cachedLabels) return;
    
    const canvas = document.getElementById("realtimeChart");
    if (!canvas) return;

    let inData, outData, yAxisLabel, tooltipSuffix, minMax;
    
    if (currentUnit === "mb") {
        inData = cachedData.inBytes;
        outData = cachedData.outBytes;
        yAxisLabel = "データ量 (MB)";
        tooltipSuffix = " MB";
        minMax = 1;
    } else {
        inData = cachedData.inPackets;
        outData = cachedData.outPackets;
        yAxisLabel = "パケット数";
        tooltipSuffix = " pkt";
        minMax = 1000;
    }
    
    const maxDataValue = Math.max(...inData, ...outData);
    const yAxisMax = Math.max(maxDataValue * (4/3), minMax);

    if (!realtimeChartData) {
        realtimeChartData = new Chart(canvas, {
            type: "line",
            data: {
                labels: cachedLabels,
                datasets: [
                    {
                        label: "IN",
                        data: inData,
                        borderColor: chartColors.primary,
                        backgroundColor: "rgba(0, 255, 159, 0.1)",
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        pointBackgroundColor: chartColors.primary,
                    },
                    {
                        label: "OUT",
                        data: outData,
                        borderColor: chartColors.secondary,
                        backgroundColor: "rgba(255, 0, 110, 0.1)",
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        pointBackgroundColor: chartColors.secondary,
                    }
                ]
            },
            options: {
                ...getCommonChartOptions(),
                plugins: {
                    ...getCommonChartOptions().plugins,
                    tooltip: {
                        ...getCommonChartOptions().plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                if (currentUnit === "mb") {
                                    return context.dataset.label + ": " + context.parsed.y.toFixed(2) + tooltipSuffix;
                                } else {
                                    return context.dataset.label + ": " + context.parsed.y.toLocaleString() + tooltipSuffix;
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        ...getCommonChartOptions().scales.y,
                        beginAtZero: true,
                        max: yAxisMax,
                        title: {
                            display: true,
                            text: yAxisLabel,
                            font: { size: 13, weight: "600" },
                            color: isDarkTheme() ? "#F1F5F9" : "#374151"
                        }
                    },
                    x: {
                        ...getCommonChartOptions().scales.x,
                        title: {
                            display: true,
                            text: "時刻",
                            font: { size: 13, weight: "600" },
                            color: isDarkTheme() ? "#F1F5F9" : "#374151"
                        },
                        ticks: {
                            ...getCommonChartOptions().scales.x.ticks,
                            maxRotation: 45,
                            minRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 20
                        }
                    }
                },
                animation: { duration: 0 }
            }
        });
    } else {
        realtimeChartData.data.labels = cachedLabels;
        realtimeChartData.data.datasets[0].data = inData;
        realtimeChartData.data.datasets[1].data = outData;
        realtimeChartData.options.scales.y.max = yAxisMax;
        realtimeChartData.options.scales.y.title.text = yAxisLabel;
        realtimeChartData.update('none');
    }
}

// キャプチャ状態をチェック
async function checkCaptureStatus() {
    try {
        const res = await fetch("/api/captureStatus");
        if (!res.ok) return;
        
        const data = await res.json();
        
        const titles = document.querySelectorAll('.chart-title');
        titles.forEach(title => {
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

// 時間幅変更時（グローバルに公開）
window.onTimeRangeChange = function(minutes) {
    currentTimeRangeMinutes = minutes;
    if (realtimeChartData) {
        realtimeChartData.destroy();
        realtimeChartData = null;
    }
    loadRealtimeData();
}

// グラフタイトルを更新
function updateChartTitles() {
    const unitLabel = currentUnit === "mb" ? "/Bytes" : "/Packets";
    
    const realtimeTitle = document.getElementById("realtime-chart-title");
    if (realtimeTitle) {
        const baseText = realtimeTitle.getAttribute("data-i18n-base") || realtimeTitle.textContent.replace(/\s*\/.*$/, '');
        realtimeTitle.setAttribute("data-i18n-base", baseText);
        realtimeTitle.textContent = baseText + " " + unitLabel;
    }
}

// 単位変更時（グローバルに公開）
window.onUnitChange = function(unit) {
    currentUnit = unit;
    updateRealtimeChart();
    updateStats();
    updateChartTitles();
}

// ページ読み込み時
window.addEventListener("DOMContentLoaded", () => {
    // 保存された単位を復元
    currentUnit = localStorage.getItem("displayUnit") || "mb";
    
    // 保存された時間範囲を復元
    const savedTimeRange = localStorage.getItem("timeRange") || "10";
    currentTimeRangeMinutes = parseInt(savedTimeRange);
    
    // 初期タイトル更新
    updateChartTitles();
    
    loadRealtimeData();
    checkCaptureStatus();
    timerId = setInterval(loadRealtimeData, 5000);
    statusTimerId = setInterval(checkCaptureStatus, 5000);
});
