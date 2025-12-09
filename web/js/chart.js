console.log("script.js loaded");

// 共通のグラフカラーパレット
const chartColors = {
    primary: "#695CFE",
    primaryLight: "#8B7FFF",
    secondary: "#10B981",
    secondaryLight: "#34D399",
    accent: "#F59E0B",
    accentLight: "#FBBF24",
    danger: "#EF4444",
    dangerLight: "#F87171",
    info: "#3B82F6",
    infoLight: "#60A5FA",
    gradient1: ["#695CFE", "#8B7FFF"],
    gradient2: ["#10B981", "#34D399"],
    gradient3: ["#F59E0B", "#FBBF24"],
    gradient4: ["#EF4444", "#F87171"],
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
    
    // realtimePacketsChartData
    if (realtimePacketsChartData) {
        if (realtimePacketsChartData.options.plugins) {
            if (realtimePacketsChartData.options.plugins.legend) {
                realtimePacketsChartData.options.plugins.legend.labels.color = textColor;
            }
            if (realtimePacketsChartData.options.plugins.tooltip) {
                realtimePacketsChartData.options.plugins.tooltip.backgroundColor = commonOptions.plugins.tooltip.backgroundColor;
                realtimePacketsChartData.options.plugins.tooltip.borderColor = commonOptions.plugins.tooltip.borderColor;
            }
        }
        if (realtimePacketsChartData.options.scales) {
            if (realtimePacketsChartData.options.scales.x) {
                realtimePacketsChartData.options.scales.x.grid.color = commonOptions.scales.x.grid.color;
                realtimePacketsChartData.options.scales.x.grid.borderColor = commonOptions.scales.x.grid.borderColor;
                realtimePacketsChartData.options.scales.x.ticks.color = textColor;
                if (realtimePacketsChartData.options.scales.x.title) {
                    realtimePacketsChartData.options.scales.x.title.color = textColor;
                }
            }
            if (realtimePacketsChartData.options.scales.y) {
                realtimePacketsChartData.options.scales.y.grid.color = commonOptions.scales.y.grid.color;
                realtimePacketsChartData.options.scales.y.grid.borderColor = commonOptions.scales.y.grid.borderColor;
                realtimePacketsChartData.options.scales.y.ticks.color = textColor;
                if (realtimePacketsChartData.options.scales.y.title) {
                    realtimePacketsChartData.options.scales.y.title.color = textColor;
                }
            }
        }
        realtimePacketsChartData.update();
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
        const [flowsByBytesRes, flowsByPacketsRes, bytesByDirectionRes, packetsByDirectionRes, realtimePacketsRes] = await Promise.all([
            fetch("/api/flowsByBytes"),
            fetch("/api/flowsByPackets"),
            fetch("/api/bytesByDirection"),
            fetch("/api/packetsByDirection"),
            fetch("/api/realtimePackets?limit=60"),
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
        if(!realtimePacketsRes.ok) {  
            throw new Error("HTTP error" + realtimePacketsRes.status);
        }

        //json形式→jsオブジェクト形式に解凍 jsonパース
        const [flowsByBytesData, flowsByPacketsData, bytesByDirectionData, packetsByDirectionData, realtimePacketsData] = await Promise.all([
            flowsByBytesRes.json(),
            flowsByPacketsRes.json(),
            bytesByDirectionRes.json(),
            packetsByDirectionRes.json(),
            realtimePacketsRes.json()
        ]);

        //グラフ描画関数
        flowsByBytesChart(flowsByBytesData);
        flowsByPacketsChart(flowsByPacketsData);
        bytesByDirectionChart(bytesByDirectionData)
        packetsByDirectionChart(packetsByDirectionData);
        realtimePacketsChart(realtimePacketsData);
        
        //ここから先の場所でdataを使ってhtmlに表示やグラフ化する

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

    const labels = data.map(row => labelMap[row.direction]);
    const values = data.map(row => row.totalBytes / 1024 /1024);

    if (!bytesByDirectionChartData) {
        bytesByDirectionChartData = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    label: "データ量 (MB)",
                    data: values,
                    backgroundColor: [
                        chartColors.primary,
                        chartColors.secondary,
                        chartColors.accent,
                        chartColors.info
                    ],
                    borderColor: "#ffffff",
                    borderWidth: 3,
                    hoverOffset: 10
                }]
            },
            options: {
                ...getCommonChartOptions(),
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
            }
        });

    } else {
        //更新処理
        bytesByDirectionChartData.data.labels = labels;
        bytesByDirectionChartData.data.datasets[0].data = values;
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

    const labels = data.map(row => labelMap[row.direction]);
    const values = data.map(row => row.totalPackets);

    if (!packetsByDirectionChartData) {
        packetsByDirectionChartData = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    label: "パケット数",
                    data: values,
                    backgroundColor: [
                        chartColors.primaryLight,
                        chartColors.secondaryLight,
                        chartColors.accentLight,
                        chartColors.infoLight
                    ],
                    borderColor: "#ffffff",
                    borderWidth: 3,
                    hoverOffset: 10
                }]
            },
            options: {
                ...getCommonChartOptions(),
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
            }
        });

    } else {
        //更新処理
        packetsByDirectionChartData.data.labels = labels;
        packetsByDirectionChartData.data.datasets[0].data = values;
        packetsByDirectionChartData.update();
    }
}


let realtimePacketsChartData = null;

function realtimePacketsChart(data) {
    const canvas = document.getElementById("realtimePackets");
    
    if (!canvas) {
        console.error("not found <canvas> in html");
        return;
    }

    // データをMB単位に変換
    const labels = data.map(row => {
        const date = new Date(row.timestamp * 1000);
        return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    });
    const bytesData = data.map(row => parseFloat((row.total_bytes / (1024 * 1024)).toFixed(2))); // MB単位

    if (!realtimePacketsChartData) {
        const ctx = canvas.getContext("2d");
        const gradient = createGradient(ctx, chartColors.gradient1[0], chartColors.gradient1[1]);

        realtimePacketsChartData = new Chart(canvas, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "データ量 (MB)",
                    data: bytesData,
                    backgroundColor: gradient,
                    borderColor: chartColors.primary,
                    borderWidth: 2,
                    borderRadius: {
                        topLeft: 6,
                        topRight: 6
                    },
                    borderSkipped: false,
                }]
            },
            options: {
                ...getCommonChartOptions(),
                plugins: {
                    ...getCommonChartOptions().plugins,
                    tooltip: {
                        ...getCommonChartOptions().plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                return "データ量: " + context.parsed.y.toFixed(2) + " MB";
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        ...getCommonChartOptions().scales.y,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "データ量 (MB)",
                            font: {
                                size: 13,
                                weight: "600"
                            },
                            color: isDarkTheme() ? "#F1F5F9" : "#374151"
                        }
                    },
                    x: {
                        ...getCommonChartOptions().scales.x,
                        title: {
                            display: true,
                            text: "時刻",
                            font: {
                                size: 13,
                                weight: "600"
                            },
                            color: isDarkTheme() ? "#F1F5F9" : "#374151"
                        }
                    }
                },
                animation: {
                    duration: 0 // リアルタイム更新のためアニメーションを無効化
                }
            }
        });
    } else {
        // 更新処理
        realtimePacketsChartData.data.labels = labels;
        realtimePacketsChartData.data.datasets[0].data = bytesData;
        realtimePacketsChartData.update('none'); // アニメーションなしで更新
    }
}

let timerId;
//ページが読み込まれたらloadFlowsを実行する
//これをしたらindex.htmlを開いただけで自動的にfetchが走る
window.addEventListener("DOMContentLoaded", () => {
    loadFlows();

    //予約関数setInterval...「○ミリ秒ごとに、この関数を呼び続けて」ってお願いする
    //setInterval() を呼ぶと、ブラウザ側が「このタイマーはID=1ね」みたいに番号をくれて、その番号が timerId に入る。
    timerId = setInterval(loadFlows, 5000); //ms単位（5秒ごとに更新）
});