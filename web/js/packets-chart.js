console.log("packets-chart.js loaded");

// chartColors と isDarkTheme, getCommonChartOptions は realtime-chart.js で既に定義済み
// このファイルではそれらを再利用する

// キャッシュされたデータ
var cachedBytesByDirectionData = null;
var cachedPacketsByDirectionData = null;
var cachedBytesByProtocolData = null;
var cachedPacketsByProtocolData = null;
var cachedTcpFlagsInData = null;
var cachedTcpFlagsOutData = null;

// チャートインスタンス
var directionChartData = null;
var protocolChartData = null;
var tcpFlagsChartData = null;

// 現在のTCPフラグ方向
var currentTcpFlagsDirection = "in";

// 現在の単位を取得するヘルパー
function getPacketsCurrentUnit() {
    return localStorage.getItem("displayUnit") || "mb";
}

// 現在の時間範囲を取得するヘルパー
function getPacketsTimeRange() {
    return parseInt(localStorage.getItem("timeRange")) || 10;
}

// テーマ変更時にグラフを更新
(function() {
    const originalUpdateChartsTheme = window.updateChartsTheme;
    window.updateChartsTheme = function() {
        if (originalUpdateChartsTheme) originalUpdateChartsTheme();
        
        const commonOptions = getCommonChartOptions();
        const textColor = isDarkTheme() ? "#F1F5F9" : "#374151";
        
        [directionChartData, protocolChartData, tcpFlagsChartData].forEach(chart => {
            if (!chart) return;
            if (chart.options.plugins) {
                if (chart.options.plugins.legend) chart.options.plugins.legend.labels.color = textColor;
                if (chart.options.plugins.tooltip) {
                    chart.options.plugins.tooltip.backgroundColor = commonOptions.plugins.tooltip.backgroundColor;
                    chart.options.plugins.tooltip.borderColor = commonOptions.plugins.tooltip.borderColor;
                }
            }
            chart.update();
        });
    };
})();

// データを取得（flowsテーブルから取得）
async function loadPacketsCharts() {
    try {
        const minutes = getPacketsTimeRange();
        const [bytesByDirectionRes, packetsByDirectionRes, bytesByProtocolRes, packetsByProtocolRes, tcpFlagsInRes, tcpFlagsOutRes] = await Promise.all([
            fetch(`/api/bytesByDirection?minutes=${minutes}`),
            fetch(`/api/packetsByDirection?minutes=${minutes}`),
            fetch(`/api/bytesByProtocol?minutes=${minutes}`),
            fetch(`/api/packetsByProtocol?minutes=${minutes}`),
            fetch(`/api/tcpFlagsIn?minutes=${minutes}`),
            fetch(`/api/tcpFlagsOut?minutes=${minutes}`),
        ]);

        if (!bytesByDirectionRes.ok || !packetsByDirectionRes.ok || !bytesByProtocolRes.ok || !packetsByProtocolRes.ok || !tcpFlagsInRes.ok || !tcpFlagsOutRes.ok) {
            throw new Error("HTTP error");
        }

        [cachedBytesByDirectionData, cachedPacketsByDirectionData, cachedBytesByProtocolData, cachedPacketsByProtocolData, cachedTcpFlagsInData, cachedTcpFlagsOutData] = await Promise.all([
            bytesByDirectionRes.json(),
            packetsByDirectionRes.json(),
            bytesByProtocolRes.json(),
            packetsByProtocolRes.json(),
            tcpFlagsInRes.json(),
            tcpFlagsOutRes.json()
        ]);

        updatePacketsCharts();

    } catch (err) {
        console.error(err);
    }
}

// 全チャートを更新
function updatePacketsCharts(forceRecreate = false) {
    updateDirectionChart(forceRecreate);
    updateProtocolChart(forceRecreate);
    updateTcpFlagsChart(forceRecreate);
}

// 通信方向チャートを更新
function updateDirectionChart(forceRecreate = false) {
    const canvas = document.getElementById("directionChart");
    if (!canvas) return;

    const unit = getPacketsCurrentUnit();
    const data = unit === "mb" ? cachedBytesByDirectionData : cachedPacketsByDirectionData;
    if (!data) return;

    const labelMap = { in: "IN", out: "OUT", internal: "Internal", external: "External" };
    const colorMap = { in: chartColors.primary, out: chartColors.secondary, internal: "#ffbe0b", external: "#3b82f6" };

    const order = ["in", "out", "internal", "external"];
    const sortedData = [...data].sort((a, b) => order.indexOf(a.direction) - order.indexOf(b.direction));

    const labels = sortedData.map(row => labelMap[row.direction]);
    const values = unit === "mb"
        ? sortedData.map(row => parseFloat(((row.totalBytes || 0) / 1024 / 1024).toFixed(1)))
        : sortedData.map(row => row.totalPackets || 0);
    const colors = sortedData.map(row => colorMap[row.direction]);

    const tooltipCallback = unit === "mb"
        ? (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed.toFixed(1)} MB (${percentage}%)`;
        }
        : (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed.toLocaleString()} pkt (${percentage}%)`;
        };

    const centerTextPlugin = {
        id: 'centerTextDirection',
        beforeDraw: (chart) => {
            const ctx = chart.ctx;
            const meta = chart.getDatasetMeta(0);
            const innerRadius = meta.controller.innerRadius;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
            ctx.fillStyle = isDarkTheme() ? "#1f2937" : "#ffffff";
            ctx.fill();
            ctx.restore();
        },
        afterDatasetsDraw: (chart) => {
            const currentUnit = getPacketsCurrentUnit();
            const currentUnitLabel = currentUnit === "mb" ? "MB" : "PKT";
            
            const ctx = chart.ctx;
            const meta = chart.getDatasetMeta(0);
            const innerRadius = meta.controller.innerRadius;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
            ctx.fillStyle = isDarkTheme() ? "#1f2937" : "#ffffff";
            ctx.fill();
            ctx.restore();
            
            const data = chart.data.datasets[0].data;
            const total = data.reduce((a, b) => a + b, 0);
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = isDarkTheme() ? "#F1F5F9" : "#374151";
            ctx.font = 'bold 24px Arial';
            const displayTotal = currentUnit === "mb" ? total.toFixed(1) : Math.round(total).toLocaleString();
            ctx.fillText(displayTotal, centerX, centerY - 8);
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = isDarkTheme() ? "#9ca3af" : "#6b7280";
            ctx.fillText(currentUnitLabel, centerX, centerY + 18);
            ctx.restore();
        }
    };

    // 単位変更時は再作成
    if (forceRecreate && directionChartData) {
        directionChartData.destroy();
        directionChartData = null;
    }

    if (!directionChartData) {
        directionChartData = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 0 }]
            },
            options: {
                ...getCommonChartOptions(),
                scales: {},
                plugins: {
                    ...getCommonChartOptions().plugins,
                    legend: { ...getCommonChartOptions().plugins.legend, position: "bottom" },
                    tooltip: { ...getCommonChartOptions().plugins.tooltip, callbacks: { label: tooltipCallback } }
                },
                animation: { duration: 300 }
            },
            plugins: [centerTextPlugin]
        });
    } else {
        directionChartData.data.labels = labels;
        directionChartData.data.datasets[0].data = values;
        directionChartData.data.datasets[0].backgroundColor = colors;
        directionChartData.options.plugins.tooltip.callbacks.label = tooltipCallback;
        directionChartData.update();
    }
}

// プロトコルチャートを更新
function updateProtocolChart(forceRecreate = false) {
    const canvas = document.getElementById("protocolChart");
    if (!canvas) return;

    const unit = getPacketsCurrentUnit();
    const data = unit === "mb" ? cachedBytesByProtocolData : cachedPacketsByProtocolData;
    if (!data) return;

    const labels = data.map(row => row.protocol);
    const values = unit === "mb"
        ? data.map(row => parseFloat(((row.totalBytes || 0) / 1024 / 1024).toFixed(1)))
        : data.map(row => row.totalPackets || 0);

    const protocolColors = { TCP: "#00ff9f", UDP: "#ff006e" };
    const colors = labels.map(label => protocolColors[label] || "#00d4ff");

    const tooltipCallback = unit === "mb"
        ? (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed.toFixed(1)} MB (${percentage}%)`;
        }
        : (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed.toLocaleString()} pkt (${percentage}%)`;
        };

    const centerTextPlugin = {
        id: 'centerTextProtocol',
        beforeDraw: (chart) => {
            const ctx = chart.ctx;
            const meta = chart.getDatasetMeta(0);
            const innerRadius = meta.controller.innerRadius;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
            ctx.fillStyle = isDarkTheme() ? "#1f2937" : "#ffffff";
            ctx.fill();
            ctx.restore();
        },
        afterDatasetsDraw: (chart) => {
            const currentUnit = getPacketsCurrentUnit();
            const currentUnitLabel = currentUnit === "mb" ? "MB" : "PKT";
            
            const ctx = chart.ctx;
            const meta = chart.getDatasetMeta(0);
            const innerRadius = meta.controller.innerRadius;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
            ctx.fillStyle = isDarkTheme() ? "#1f2937" : "#ffffff";
            ctx.fill();
            ctx.restore();
            
            const data = chart.data.datasets[0].data;
            const total = data.reduce((a, b) => a + b, 0);
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = isDarkTheme() ? "#F1F5F9" : "#374151";
            ctx.font = 'bold 24px Arial';
            const displayTotal = currentUnit === "mb" ? total.toFixed(1) : Math.round(total).toLocaleString();
            ctx.fillText(displayTotal, centerX, centerY - 8);
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = isDarkTheme() ? "#9ca3af" : "#6b7280";
            ctx.fillText(currentUnitLabel, centerX, centerY + 18);
            ctx.restore();
        }
    };

    // 単位変更時は再作成
    if (forceRecreate && protocolChartData) {
        protocolChartData.destroy();
        protocolChartData = null;
    }

    if (!protocolChartData) {
        protocolChartData = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 0 }]
            },
            options: {
                ...getCommonChartOptions(),
                scales: {},
                plugins: {
                    ...getCommonChartOptions().plugins,
                    legend: { ...getCommonChartOptions().plugins.legend, position: "bottom" },
                    tooltip: { ...getCommonChartOptions().plugins.tooltip, callbacks: { label: tooltipCallback } }
                },
                animation: { duration: 300 }
            },
            plugins: [centerTextPlugin]
        });
    } else {
        protocolChartData.data.labels = labels;
        protocolChartData.data.datasets[0].data = values;
        protocolChartData.data.datasets[0].backgroundColor = colors;
        protocolChartData.options.plugins.tooltip.callbacks.label = tooltipCallback;
        protocolChartData.update();
    }
}

// TCPフラグチャートを更新
function updateTcpFlagsChart(forceRecreate = false) {
    const canvas = document.getElementById("tcpFlagsChart");
    if (!canvas) return;

    const data = currentTcpFlagsDirection === "in" ? cachedTcpFlagsInData : cachedTcpFlagsOutData;
    if (!data) return;

    const labels = data.map(row => row.flag);
    const values = data.map(row => row.count || 0);

    // ACK=緑、SYN=マゼンダ、FIN=黄色、RST=青
    const flagColors = { 
        ACK: "#00ff9f", 
        SYN: "#ff006e", 
        FIN: "#ffbe0b", 
        RST: "#3b82f6" 
    };
    const colors = labels.map(label => flagColors[label] || "#00d4ff");

    const tooltipCallback = (context) => {
        const total = context.dataset.data.reduce((a, b) => a + b, 0);
        const percentage = ((context.parsed / total) * 100).toFixed(1);
        return `${context.label}: ${context.parsed.toLocaleString()} (${percentage}%)`;
    };

    const centerTextPlugin = {
        id: 'centerTextTcpFlags',
        beforeDraw: (chart) => {
            const ctx = chart.ctx;
            const meta = chart.getDatasetMeta(0);
            const innerRadius = meta.controller.innerRadius;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
            ctx.fillStyle = isDarkTheme() ? "#1f2937" : "#ffffff";
            ctx.fill();
            ctx.restore();
        },
        afterDatasetsDraw: (chart) => {
            const ctx = chart.ctx;
            const meta = chart.getDatasetMeta(0);
            const innerRadius = meta.controller.innerRadius;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
            ctx.fillStyle = isDarkTheme() ? "#1f2937" : "#ffffff";
            ctx.fill();
            ctx.restore();
            
            const data = chart.data.datasets[0].data;
            const total = data.reduce((a, b) => a + b, 0);
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = isDarkTheme() ? "#F1F5F9" : "#374151";
            ctx.font = 'bold 24px Arial';
            ctx.fillText(total.toLocaleString(), centerX, centerY - 8);
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = isDarkTheme() ? "#9ca3af" : "#6b7280";
            ctx.fillText("flags", centerX, centerY + 18);
            ctx.restore();
        }
    };

    // 方向変更時は再作成
    if (forceRecreate && tcpFlagsChartData) {
        tcpFlagsChartData.destroy();
        tcpFlagsChartData = null;
    }

    if (!tcpFlagsChartData) {
        tcpFlagsChartData = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 0 }]
            },
            options: {
                ...getCommonChartOptions(),
                scales: {},
                plugins: {
                    ...getCommonChartOptions().plugins,
                    legend: { ...getCommonChartOptions().plugins.legend, position: "bottom" },
                    tooltip: { ...getCommonChartOptions().plugins.tooltip, callbacks: { label: tooltipCallback } }
                },
                animation: { duration: 300 }
            },
            plugins: [centerTextPlugin]
        });
    } else {
        tcpFlagsChartData.data.labels = labels;
        tcpFlagsChartData.data.datasets[0].data = values;
        tcpFlagsChartData.data.datasets[0].backgroundColor = colors;
        tcpFlagsChartData.options.plugins.tooltip.callbacks.label = tooltipCallback;
        tcpFlagsChartData.update();
    }
}

// グラフタイトルを更新
function updatePacketsChartTitles() {
    const unit = getPacketsCurrentUnit();
    const unitLabel = unit === "mb" ? "/Bytes" : "/Packets";
    
    const directionTitle = document.getElementById("direction-title");
    if (directionTitle) {
        const baseText = directionTitle.getAttribute("data-i18n-base") || directionTitle.textContent.replace(/\s*\/.*$/, '');
        directionTitle.setAttribute("data-i18n-base", baseText);
        directionTitle.textContent = baseText + " " + unitLabel;
    }
    
    const protocolTitle = document.getElementById("protocol-title");
    if (protocolTitle) {
        const baseText = protocolTitle.getAttribute("data-i18n-base") || protocolTitle.textContent.replace(/\s*\/.*$/, '');
        protocolTitle.setAttribute("data-i18n-base", baseText);
        protocolTitle.textContent = baseText + " " + unitLabel;
    }
}

// 単位変更時（グローバルに公開）
(function() {
    const originalOnUnitChange = window.onUnitChange;
    window.onUnitChange = function(unit) {
        if (originalOnUnitChange) originalOnUnitChange(unit);
        updatePacketsCharts(true);  // 単位変更時はチャートを再作成
        updatePacketsChartTitles();
    };
})();

// 時間範囲変更時（グローバルに公開）
(function() {
    const originalOnTimeRangeChange = window.onTimeRangeChange;
    window.onTimeRangeChange = function(minutes) {
        if (originalOnTimeRangeChange) originalOnTimeRangeChange(minutes);
        loadPacketsCharts();  // 時間範囲変更時はデータを再取得
    };
})();

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

var packetsTimerId;
var packetsStatusTimerId;

// ページ読み込み時
window.addEventListener("DOMContentLoaded", () => {
    // 初期タイトル更新
    updatePacketsChartTitles();
    
    // TCPフラグ方向切り替えトグル（スライダー形式）
    const tcpDirectionToggle = document.getElementById("tcp-direction-toggle");
    if (tcpDirectionToggle) {
        tcpDirectionToggle.addEventListener("click", () => {
            // トグル状態を切り替え
            const isOut = tcpDirectionToggle.classList.toggle("out");
            currentTcpFlagsDirection = isOut ? "out" : "in";
            
            // ラベルテキストを更新
            const label = tcpDirectionToggle.querySelector(".tcp-direction-label");
            if (label) {
                label.textContent = isOut ? "OUT" : "IN";
            }
            
            // チャートを再描画
            updateTcpFlagsChart(true);
        });
    }
    
    loadPacketsCharts();
    checkCaptureStatus();
    packetsTimerId = setInterval(loadPacketsCharts, 5000);
    packetsStatusTimerId = setInterval(checkCaptureStatus, 5000);
});
