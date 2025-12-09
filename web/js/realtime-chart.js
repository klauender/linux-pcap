console.log("realtime-chart.js loaded");

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

// チャートのテーマを更新するヘルパー関数
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
            if (chartData.options.scales.x.title) {
                chartData.options.scales.x.title.color = textColor;
            }
        }
        if (chartData.options.scales.y) {
            chartData.options.scales.y.grid.color = commonOptions.scales.y.grid.color;
            chartData.options.scales.y.grid.borderColor = commonOptions.scales.y.grid.borderColor;
            chartData.options.scales.y.ticks.color = textColor;
            if (chartData.options.scales.y.title) {
                chartData.options.scales.y.title.color = textColor;
            }
        }
    }
    chartData.update();
}

// テーマ変更時にグラフを更新（グローバルスコープに公開）
window.updateChartsTheme = function updateChartsTheme() {
    updateChartTheme(realtimeBytesChartData);
    updateChartTheme(realtimePacketsChartData);
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

// リアルタイムデータを取得
async function loadRealtimeData() {
    try {
        const res = await fetch("/api/realtimePackets?limit=60");
        
        if (!res.ok) {
            throw new Error("HTTP error" + res.status);
        }
        
        const data = await res.json();
        realtimeBytesChart(data);
        realtimePacketsChart(data);
        
    } catch (err) {
        console.error(err);
    }
}

let realtimeBytesChartData = null;

// リアルタイム データ量（MB単位）グラフ
function realtimeBytesChart(data) {
    const canvas = document.getElementById("realtimeBytes");
    
    if (!canvas) {
        console.error("not found <canvas id='realtimeBytes'> in html");
        return;
    }

    // データをMB単位に変換
    const labels = data.map(row => {
        const date = new Date(row.timestamp * 1000);
        return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    });
    const bytesData = data.map(row => parseFloat((row.total_bytes / (1024 * 1024)).toFixed(2))); // MB単位

    if (!realtimeBytesChartData) {
        const ctx = canvas.getContext("2d");
        const gradient = createGradient(ctx, chartColors.gradient1[0], chartColors.gradient1[1]);

        realtimeBytesChartData = new Chart(canvas, {
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
        realtimeBytesChartData.data.labels = labels;
        realtimeBytesChartData.data.datasets[0].data = bytesData;
        realtimeBytesChartData.update('none'); // アニメーションなしで更新
    }
}

let realtimePacketsChartData = null;

// リアルタイム パケット数グラフ
function realtimePacketsChart(data) {
    const canvas = document.getElementById("realtimePackets");
    
    if (!canvas) {
        console.error("not found <canvas id='realtimePackets'> in html");
        return;
    }

    // ラベルとパケット数データ
    const labels = data.map(row => {
        const date = new Date(row.timestamp * 1000);
        return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    });
    const packetsData = data.map(row => row.total_packets);

    if (!realtimePacketsChartData) {
        const ctx = canvas.getContext("2d");
        const gradient = createGradient(ctx, chartColors.gradient2[0], chartColors.gradient2[1]);

        realtimePacketsChartData = new Chart(canvas, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "パケット数",
                    data: packetsData,
                    backgroundColor: gradient,
                    borderColor: chartColors.secondary,
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
                                return "パケット数: " + context.parsed.y.toLocaleString() + " パケット";
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
                            text: "パケット数",
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
        realtimePacketsChartData.data.datasets[0].data = packetsData;
        realtimePacketsChartData.update('none'); // アニメーションなしで更新
    }
}

let timerId;
// ページが読み込まれたらloadRealtimeDataを実行する
window.addEventListener("DOMContentLoaded", () => {
    loadRealtimeData();
    // 5秒ごとに更新
    timerId = setInterval(loadRealtimeData, 5000);
});
