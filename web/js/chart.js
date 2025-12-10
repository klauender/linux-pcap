console.log("script.js loaded");

// サイバーテーマのカラーパレット
const chartColors = {
    // メインカラー（シアン/ネオングリーン系）
    primary: "#00ff9f",
    primaryLight: "#00ffcc",
    // セカンダリ（マゼンタ/ピンク系）
    secondary: "#ff006e",
    secondaryLight: "#ff4d94",
    // アクセント（オレンジ/イエロー系）
    accent: "#ffbe0b",
    accentLight: "#ffd60a",
    // 情報（ブルー/シアン系）
    info: "#00d4ff",
    infoLight: "#00e5ff",
    // 危険（レッド系）
    danger: "#ff0055",
    dangerLight: "#ff4477",
    // グラデーション
    gradient1: ["#00ff9f", "#00d4aa"],
    gradient2: ["#ff006e", "#ff4d94"],
    gradient3: ["#ffbe0b", "#ffd60a"],
    gradient4: ["#00d4ff", "#00e5ff"],
};

// グラデーション作成ヘルパー
function createGradient(ctx, color1, color2) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
}

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
                    font: {
                        size: 12,
                        weight: "500"
                    },
                    color: textColor
                }
            },
            tooltip: {
                backgroundColor: tooltipBg,
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: "600"
                },
                bodyFont: {
                    size: 13
                },
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
                grid: {
                    display: true,
                    color: gridColor,
                    drawBorder: true,
                    borderColor: borderColor
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    color: textColor
                }
            },
            y: {
                grid: {
                    display: true,
                    color: gridColor,
                    drawBorder: true,
                    borderColor: borderColor
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    color: textColor
                }
            }
        }
    };
}

// テーマ変更時にグラフを更新（グローバルスコープに公開）
window.updateChartsTheme = function updateChartsTheme() {
    const commonOptions = getCommonChartOptions();
    const textColor = isDarkTheme() ? "#F1F5F9" : "#374151";
    
    // flowsByBytesChartData
    if (flowsByBytesChartData) {
        // プラグインの更新
        if (flowsByBytesChartData.options.plugins) {
            if (flowsByBytesChartData.options.plugins.legend) {
                flowsByBytesChartData.options.plugins.legend.labels.color = textColor;
            }
            if (flowsByBytesChartData.options.plugins.tooltip) {
                flowsByBytesChartData.options.plugins.tooltip.backgroundColor = commonOptions.plugins.tooltip.backgroundColor;
                flowsByBytesChartData.options.plugins.tooltip.borderColor = commonOptions.plugins.tooltip.borderColor;
            }
        }
        // スケールの更新
        if (flowsByBytesChartData.options.scales) {
            if (flowsByBytesChartData.options.scales.x) {
                flowsByBytesChartData.options.scales.x.grid.color = commonOptions.scales.x.grid.color;
                flowsByBytesChartData.options.scales.x.grid.borderColor = commonOptions.scales.x.grid.borderColor;
                flowsByBytesChartData.options.scales.x.ticks.color = textColor;
                if (flowsByBytesChartData.options.scales.x.title) {
                    flowsByBytesChartData.options.scales.x.title.color = textColor;
                }
            }
            if (flowsByBytesChartData.options.scales.y) {
                flowsByBytesChartData.options.scales.y.grid.color = commonOptions.scales.y.grid.color;
                flowsByBytesChartData.options.scales.y.grid.borderColor = commonOptions.scales.y.grid.borderColor;
                flowsByBytesChartData.options.scales.y.ticks.color = textColor;
                if (flowsByBytesChartData.options.scales.y.title) {
                    flowsByBytesChartData.options.scales.y.title.color = textColor;
                }
            }
        }
        flowsByBytesChartData.update();
    }
    
    // flowsByPacketsChartData
    if (flowsByPacketsChartData) {
        if (flowsByPacketsChartData.options.plugins) {
            if (flowsByPacketsChartData.options.plugins.legend) {
                flowsByPacketsChartData.options.plugins.legend.labels.color = textColor;
            }
            if (flowsByPacketsChartData.options.plugins.tooltip) {
                flowsByPacketsChartData.options.plugins.tooltip.backgroundColor = commonOptions.plugins.tooltip.backgroundColor;
                flowsByPacketsChartData.options.plugins.tooltip.borderColor = commonOptions.plugins.tooltip.borderColor;
            }
        }
        if (flowsByPacketsChartData.options.scales) {
            if (flowsByPacketsChartData.options.scales.x) {
                flowsByPacketsChartData.options.scales.x.grid.color = commonOptions.scales.x.grid.color;
                flowsByPacketsChartData.options.scales.x.grid.borderColor = commonOptions.scales.x.grid.borderColor;
                flowsByPacketsChartData.options.scales.x.ticks.color = textColor;
                if (flowsByPacketsChartData.options.scales.x.title) {
                    flowsByPacketsChartData.options.scales.x.title.color = textColor;
                }
            }
            if (flowsByPacketsChartData.options.scales.y) {
                flowsByPacketsChartData.options.scales.y.grid.color = commonOptions.scales.y.grid.color;
                flowsByPacketsChartData.options.scales.y.grid.borderColor = commonOptions.scales.y.grid.borderColor;
                flowsByPacketsChartData.options.scales.y.ticks.color = textColor;
                if (flowsByPacketsChartData.options.scales.y.title) {
                    flowsByPacketsChartData.options.scales.y.title.color = textColor;
                }
            }
        }
        flowsByPacketsChartData.update();
    }
    
    // bytesByDirectionChartData
    if (bytesByDirectionChartData) {
        if (bytesByDirectionChartData.options.plugins) {
            if (bytesByDirectionChartData.options.plugins.legend) {
                bytesByDirectionChartData.options.plugins.legend.labels.color = textColor;
            }
            if (bytesByDirectionChartData.options.plugins.tooltip) {
                bytesByDirectionChartData.options.plugins.tooltip.backgroundColor = commonOptions.plugins.tooltip.backgroundColor;
                bytesByDirectionChartData.options.plugins.tooltip.borderColor = commonOptions.plugins.tooltip.borderColor;
            }
        }
        bytesByDirectionChartData.update();
    }
    
    // packetsByDirectionChartData
    if (packetsByDirectionChartData) {
        if (packetsByDirectionChartData.options.plugins) {
            if (packetsByDirectionChartData.options.plugins.legend) {
                packetsByDirectionChartData.options.plugins.legend.labels.color = textColor;
            }
            if (packetsByDirectionChartData.options.plugins.tooltip) {
                packetsByDirectionChartData.options.plugins.tooltip.backgroundColor = commonOptions.plugins.tooltip.backgroundColor;
                packetsByDirectionChartData.options.plugins.tooltip.borderColor = commonOptions.plugins.tooltip.borderColor;
            }
        }
        packetsByDirectionChartData.update();
    }
    
    // bytesByProtocolChartData
    if (bytesByProtocolChartData) {
        if (bytesByProtocolChartData.options.plugins) {
            if (bytesByProtocolChartData.options.plugins.legend) {
                bytesByProtocolChartData.options.plugins.legend.labels.color = textColor;
            }
            if (bytesByProtocolChartData.options.plugins.tooltip) {
                bytesByProtocolChartData.options.plugins.tooltip.backgroundColor = commonOptions.plugins.tooltip.backgroundColor;
                bytesByProtocolChartData.options.plugins.tooltip.borderColor = commonOptions.plugins.tooltip.borderColor;
            }
        }
        bytesByProtocolChartData.update();
    }
    
    // packetsByProtocolChartData
    if (packetsByProtocolChartData) {
        if (packetsByProtocolChartData.options.plugins) {
            if (packetsByProtocolChartData.options.plugins.legend) {
                packetsByProtocolChartData.options.plugins.legend.labels.color = textColor;
            }
            if (packetsByProtocolChartData.options.plugins.tooltip) {
                packetsByProtocolChartData.options.plugins.tooltip.backgroundColor = commonOptions.plugins.tooltip.backgroundColor;
                packetsByProtocolChartData.options.plugins.tooltip.borderColor = commonOptions.plugins.tooltip.borderColor;
            }
        }
        packetsByProtocolChartData.update();
    }
    
}

// テーマ変更イベントをリッスン
document.addEventListener("DOMContentLoaded", () => {
    const observer = new MutationObserver(() => {
        if (typeof window.updateChartsTheme === "function") {
            window.updateChartsTheme();
        }
    });
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class"]
    });
});

//これでawaitが使えるようになる
//データを取りに行って、描画用の関数に渡す係
async function loadFlows() {

    try {
        //resが帰ってくるまで待つ
        const [flowsByBytesRes, flowsByPacketsRes, bytesByDirectionRes, packetsByDirectionRes, bytesByProtocolRes, packetsByProtocolRes] = await Promise.all([
            fetch("/api/flowsByBytes"),
            fetch("/api/flowsByPackets"),
            fetch("/api/bytesByDirection"),
            fetch("/api/packetsByDirection"),
            fetch("/api/bytesByProtocol"),
            fetch("/api/packetsByProtocol"),
        ]);

        
        //.okで成功かどうかチェック。ステータスコードが404や500などの場合false
        if(!flowsByBytesRes.ok) {  
            //throwはエラーを投げる=中断する命令 try→catchを探す
            throw new Error("HTTP error" + flowsByBytesRes.status);
        }
        if(!flowsByPacketsRes.ok) {  
            throw new Error("HTTP error" + flowsByPacketsRes.status);
        }
        if(!bytesByDirectionRes.ok) {  
            throw new Error("HTTP error" + bytesByDirectionRes.status);
        }
        if(!packetsByDirectionRes.ok) {  
            throw new Error("HTTP error" + packetsByDirectionRes.status);
        }
        if(!bytesByProtocolRes.ok) {  
            throw new Error("HTTP error" + bytesByProtocolRes.status);
        }
        if(!packetsByProtocolRes.ok) {  
            throw new Error("HTTP error" + packetsByProtocolRes.status);
        }

        //json形式→jsオブジェクト形式に解凍 jsonパース
        const [flowsByBytesData, flowsByPacketsData, bytesByDirectionData, packetsByDirectionData, bytesByProtocolData, packetsByProtocolData] = await Promise.all([
            flowsByBytesRes.json(),
            flowsByPacketsRes.json(),
            bytesByDirectionRes.json(),
            packetsByDirectionRes.json(),
            bytesByProtocolRes.json(),
            packetsByProtocolRes.json()
        ]);

        //グラフ描画関数
        flowsByBytesChart(flowsByBytesData);
        flowsByPacketsChart(flowsByPacketsData);
        bytesByDirectionChart(bytesByDirectionData);
        packetsByDirectionChart(packetsByDirectionData);
        bytesByProtocolChart(bytesByProtocolData);
        packetsByProtocolChart(packetsByProtocolData);
        
        // サマリーカードを更新
        updateSummaryCards(flowsByBytesData, bytesByDirectionData, packetsByDirectionData);

    } catch (err) {
        console.error(err);
    }
}


let flowsByBytesChartData = null;

//chart.jsに関数と座標を渡して描画してもらう
//canvas...どこに描くか
//labels/values...何を書くのか
function flowsByBytesChart(data) {

    //canvasタグの位置情報を取ってくる
    const canvas = document.getElementById("flowsByBytes");   //場所指定

    if(!canvas){
        console.error("not found <canvas> in html")
        return;
    }

    //ラベルと値を設定
    //.mapでdata配列を新しい配列にする
    //例) [1,2,3].map(x => x * 2);    →   [2,4,6]
    const labels = data.map(row => `${row.src_ip} → ${row.dst_ip} (${row.direction})`);
    const values = data.map(row => row.bytes / 1024 /1024);

    // flowsByBytesChartがない場合新しく作る
    if (!flowsByBytesChartData) {
        const ctx = canvas.getContext("2d");
        const gradient = createGradient(ctx, chartColors.gradient1[0], chartColors.gradient1[1]);

        flowsByBytesChartData = new Chart(canvas, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "データ量 (MB)",
                    data: values,
                    backgroundColor: gradient,
                    borderColor: chartColors.primary,
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
                    tooltip: {
                        ...getCommonChartOptions().plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                return "データ量: " + context.parsed.x.toFixed(2) + " MB";
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ...getCommonChartOptions().scales.x,
                        title: {
                            display: true,
                            text: "データ量 (MB)",
                            font: {
                                size: 13,
                                weight: "600"
                            },
                            color: isDarkTheme() ? "#F1F5F9" : "#374151"
                        },
                        beginAtZero: true
                    },
                    y: {
                        ...getCommonChartOptions().scales.y,
                        title: {
                            display: true,
                            text: "フロー",
                            font: {
                                size: 13,
                                weight: "600"
                            },
                            color: isDarkTheme() ? "#F1F5F9" : "#374151"
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: "easeOutQuart"
                }
            }
        });

    } else {
        //すでにchartがある場合は中身入れ替えて更新
        flowsByBytesChartData.data.labels = labels;
        flowsByBytesChartData.data.datasets[0].data = values;
        flowsByBytesChartData.update();
    }
}


let flowsByPacketsChartData = null;

function flowsByPacketsChart(data) {

    const canvas = document.getElementById("flowsByPackets");

    if(!canvas){
        console.error("not found <canvas> in html")
        return;
    }

    const labels = data.map(row => `${row.src_ip} → ${row.dst_ip} (${row.direction})`);
    const values = data.map(row => row.packets);

    if (!flowsByPacketsChartData) {
        const ctx = canvas.getContext("2d");
        const gradient = createGradient(ctx, chartColors.gradient2[0], chartColors.gradient2[1]);

        flowsByPacketsChartData = new Chart(canvas, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "パケット数",
                    data: values,
                    backgroundColor: gradient,
                    borderColor: chartColors.secondary,
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
                    tooltip: {
                        ...getCommonChartOptions().plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                return "パケット数: " + context.parsed.x.toLocaleString() + " パケット";
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ...getCommonChartOptions().scales.x,
                        title: {
                            display: true,
                            text: "パケット数",
                            font: {
                                size: 13,
                                weight: "600"
                            },
                            color: isDarkTheme() ? "#F1F5F9" : "#374151"
                        },
                        beginAtZero: true
                    },
                    y: {
                        ...getCommonChartOptions().scales.y,
                        title: {
                            display: true,
                            text: "フロー",
                            font: {
                                size: 13,
                                weight: "600"
                            },
                            color: isDarkTheme() ? "#F1F5F9" : "#374151"
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: "easeOutQuart"
                }
            }
        });

    } else {
        //すでにchartがある場合は中身入れ替えて更新
        flowsByPacketsChartData.data.labels = labels;
        flowsByPacketsChartData.data.datasets[0].data = values;
        flowsByPacketsChartData.update();
    }
}

let bytesByDirectionChartData = null;

function bytesByDirectionChart(data) {

    const canvas = document.getElementById("bytesByDirection");

    if(!canvas){
        console.error("not found <canvas> in html")
        return;
    }

    const labelMap = {
        in: "IN",
        out: "OUT",
        external: "External",
        internal: "Internal"
    }

    // 色をdirection別に固定（external=オレンジ, in=緑, out=赤, internal=水色）
    const colorMap = {
        external: "#ffbe0b",
        in: "#00ff9f",
        out: "#ff006e",
        internal: "#00d4ff"
    }

    const labels = data.map(row => labelMap[row.direction]);
    const values = data.map(row => row.totalBytes / 1024 /1024);
    const colors = data.map(row => colorMap[row.direction]);

    if (!bytesByDirectionChartData) {
        bytesByDirectionChartData = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    label: "データ量 (MB)",
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 15,
                    hoverBorderWidth: 2,
                    hoverBorderColor: "#ffffff"
                }]
            },
            options: {
                ...getCommonChartOptions(),
                scales: {},
                plugins: {
                    ...getCommonChartOptions().plugins,
                    legend: {
                        ...getCommonChartOptions().plugins.legend,
                        position: "bottom",
                    },
                    tooltip: {
                        ...getCommonChartOptions().plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || "";
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value.toFixed(2)} MB (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000,
                    easing: "easeOutQuart"
                }
            },
            plugins: [{
                id: 'centerText',
                beforeDraw: (chart) => {
                    const ctx = chart.ctx;
                    const meta = chart.getDatasetMeta(0);
                    const innerRadius = meta.controller.innerRadius;
                    const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
                    const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
                    
                    // 中央を塗りつぶす
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
                    
                    // 中央を塗りつぶす
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
                    ctx.fillStyle = isDarkTheme() ? "#1f2937" : "#ffffff";
                    ctx.fill();
                    ctx.restore();
                    
                    // データから総MB量を計算
                    const data = chart.data.datasets[0].data;
                    const totalMB = data.reduce((a, b) => a + b, 0);
                    
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    const textColor = isDarkTheme() ? "#F1F5F9" : "#374151";
                    ctx.fillStyle = textColor;
                    
                    ctx.font = 'bold 16px Arial';
                    ctx.fillText('総MB', centerX, centerY - 15);
                    
                    ctx.font = 'bold 24px Arial';
                    ctx.fillText(totalMB.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','), centerX, centerY + 15);
                    
                    ctx.restore();
                }
            }]
        });

    } else {
        //更新処理
        bytesByDirectionChartData.data.labels = labels;
        bytesByDirectionChartData.data.datasets[0].data = values;
        bytesByDirectionChartData.data.datasets[0].backgroundColor = colors;
        bytesByDirectionChartData.update();
    }
}

let packetsByDirectionChartData = null;

function packetsByDirectionChart(data) {

    const canvas = document.getElementById("packetsByDirection");

    if(!canvas){
        console.error("not found <canvas> in html")
        return;
    }

    const labelMap = {
        in: "IN",
        out: "OUT",
        external: "External",
        internal: "Internal"
    }

    // 色をdirection別に固定（external=オレンジ, in=緑, out=赤, internal=水色）
    const colorMap = {
        external: "#ffd60a",
        in: "#00ffcc",
        out: "#ff4d94",
        internal: "#00e5ff"
    }

    const labels = data.map(row => labelMap[row.direction]);
    const values = data.map(row => row.totalPackets);
    const colors = data.map(row => colorMap[row.direction]);

    if (!packetsByDirectionChartData) {
        packetsByDirectionChartData = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    label: "パケット数",
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 15,
                    hoverBorderWidth: 2,
                    hoverBorderColor: "#ffffff"
                }]
            },
            options: {
                ...getCommonChartOptions(),
                scales: {},
                plugins: {
                    ...getCommonChartOptions().plugins,
                    legend: {
                        ...getCommonChartOptions().plugins.legend,
                        position: "bottom",
                    },
                    tooltip: {
                        ...getCommonChartOptions().plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || "";
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value.toLocaleString()} パケット (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000,
                    easing: "easeOutQuart"
                }
            },
            plugins: [{
                id: 'centerText',
                beforeDraw: (chart) => {
                    const ctx = chart.ctx;
                    const meta = chart.getDatasetMeta(0);
                    const innerRadius = meta.controller.innerRadius;
                    const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
                    const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
                    
                    // 中央を塗りつぶす
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
                    
                    // 中央を塗りつぶす
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
                    ctx.fillStyle = isDarkTheme() ? "#1f2937" : "#ffffff";
                    ctx.fill();
                    ctx.restore();
                    
                    // データから総パケット量を計算
                    const data = chart.data.datasets[0].data;
                    const totalPackets = data.reduce((a, b) => a + b, 0);
                    
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    const textColor = isDarkTheme() ? "#F1F5F9" : "#374151";
                    ctx.fillStyle = textColor;
                    
                    ctx.font = 'bold 16px Arial';
                    ctx.fillText('総パケット', centerX, centerY - 15);
                    
                    ctx.font = 'bold 24px Arial';
                    ctx.fillText(totalPackets.toLocaleString(), centerX, centerY + 15);
                    
                    ctx.restore();
                }
            }]
        });

    } else {
        //更新処理
        packetsByDirectionChartData.data.labels = labels;
        packetsByDirectionChartData.data.datasets[0].data = values;
        packetsByDirectionChartData.data.datasets[0].backgroundColor = colors;
        packetsByDirectionChartData.update();
    }
}

let bytesByProtocolChartData = null;

function bytesByProtocolChart(data) {

    const canvas = document.getElementById("bytesByProtocol");

    if(!canvas){
        console.error("not found <canvas> in html")
        return;
    }

    const labels = data.map(row => row.protocol);
    const values = data.map(row => row.totalBytes / 1024 / 1024);

    // プロトコル用の色（TCP=青系、UDP=オレンジ系）
    const protocolColors = {
        TCP: "#3b82f6",
        UDP: "#f59e0b"
    };
    const colors = labels.map(label => protocolColors[label] || "#8b5cf6");

    if (!bytesByProtocolChartData) {
        bytesByProtocolChartData = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    label: "データ量 (MB)",
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 15,
                    hoverBorderWidth: 2,
                    hoverBorderColor: "#ffffff"
                }]
            },
            options: {
                ...getCommonChartOptions(),
                scales: {},
                plugins: {
                    ...getCommonChartOptions().plugins,
                    legend: {
                        ...getCommonChartOptions().plugins.legend,
                        position: "bottom",
                    },
                    tooltip: {
                        ...getCommonChartOptions().plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || "";
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value.toFixed(2)} MB (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000,
                    easing: "easeOutQuart"
                }
            },
            plugins: [{
                id: 'centerTextProtocolBytes',
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
                    const totalMB = data.reduce((a, b) => a + b, 0);
                    
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    const textColor = isDarkTheme() ? "#F1F5F9" : "#374151";
                    ctx.fillStyle = textColor;
                    
                    ctx.font = 'bold 16px Arial';
                    ctx.fillText('総MB', centerX, centerY - 15);
                    
                    ctx.font = 'bold 24px Arial';
                    ctx.fillText(totalMB.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','), centerX, centerY + 15);
                    
                    ctx.restore();
                }
            }]
        });

    } else {
        bytesByProtocolChartData.data.labels = labels;
        bytesByProtocolChartData.data.datasets[0].data = values;
        bytesByProtocolChartData.data.datasets[0].backgroundColor = colors;
        bytesByProtocolChartData.update();
    }
}

let packetsByProtocolChartData = null;

function packetsByProtocolChart(data) {

    const canvas = document.getElementById("packetsByProtocol");

    if(!canvas){
        console.error("not found <canvas> in html")
        return;
    }

    const labels = data.map(row => row.protocol);
    const values = data.map(row => row.totalPackets);

    // プロトコル用の色（TCP=青系、UDP=オレンジ系）
    const protocolColors = {
        TCP: "#60a5fa",
        UDP: "#fbbf24"
    };
    const colors = labels.map(label => protocolColors[label] || "#a78bfa");

    if (!packetsByProtocolChartData) {
        packetsByProtocolChartData = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    label: "パケット数",
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 15,
                    hoverBorderWidth: 2,
                    hoverBorderColor: "#ffffff"
                }]
            },
            options: {
                ...getCommonChartOptions(),
                scales: {},
                plugins: {
                    ...getCommonChartOptions().plugins,
                    legend: {
                        ...getCommonChartOptions().plugins.legend,
                        position: "bottom",
                    },
                    tooltip: {
                        ...getCommonChartOptions().plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || "";
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value.toLocaleString()} パケット (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000,
                    easing: "easeOutQuart"
                }
            },
            plugins: [{
                id: 'centerTextProtocolPackets',
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
                    const totalPackets = data.reduce((a, b) => a + b, 0);
                    
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    const textColor = isDarkTheme() ? "#F1F5F9" : "#374151";
                    ctx.fillStyle = textColor;
                    
                    ctx.font = 'bold 16px Arial';
                    ctx.fillText('総パケット', centerX, centerY - 15);
                    
                    ctx.font = 'bold 24px Arial';
                    ctx.fillText(totalPackets.toLocaleString(), centerX, centerY + 15);
                    
                    ctx.restore();
                }
            }]
        });

    } else {
        packetsByProtocolChartData.data.labels = labels;
        packetsByProtocolChartData.data.datasets[0].data = values;
        packetsByProtocolChartData.data.datasets[0].backgroundColor = colors;
        packetsByProtocolChartData.update();
    }
}


// キャプチャ状態をチェックしてステータスインジケーターを更新
async function checkCaptureStatus() {
    try {
        const res = await fetch("/api/captureStatus");
        if (!res.ok) return;
        
        const data = await res.json();
        const indicators = document.querySelectorAll('.status-indicator');
        const isDark = document.body.classList.contains('dark-theme');
        
        indicators.forEach(indicator => {
            const dot = indicator.querySelector('.status-dot');
            const text = indicator.querySelector('span:last-child');
            
            if (data.active) {
                if (dot) {
                    dot.style.background = isDark ? '#00ff9f' : '#22c55e';
                    dot.style.animation = 'pulse 2s infinite';
                    dot.style.boxShadow = isDark ? '0 0 10px rgba(0, 255, 159, 0.5)' : '';
                }
                if (text) text.textContent = 'Running';
            } else {
                if (dot) {
                    dot.style.background = '#ef4444';
                    dot.style.animation = 'none';
                    dot.style.boxShadow = isDark ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none';
                }
                if (text) text.textContent = 'Stopped';
            }
        });
    } catch (err) {
        console.error("Failed to check capture status:", err);
    }
}

let timerId;
let statusTimerId;

//ページが読み込まれたらloadFlowsを実行する
//これをしたらindex.htmlを開いただけで自動的にfetchが走る
window.addEventListener("DOMContentLoaded", () => {
    loadFlows();
    checkCaptureStatus();

    //予約関数setInterval...「○ミリ秒ごとに、この関数を呼び続けて」ってお願いする
    //setInterval() を呼ぶと、ブラウザ側が「このタイマーはID=1ね」みたいに番号をくれて、その番号が timerId に入る。
    timerId = setInterval(loadFlows, 5000); //ms単位（5秒ごとに更新）
    statusTimerId = setInterval(checkCaptureStatus, 5000); // 5秒ごとに監視状態をチェック
});