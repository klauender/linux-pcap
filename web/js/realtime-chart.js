console.log("realtime-chart.js loaded");

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
    danger: "#ff006e",
    dangerLight: "#ff4d94",
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

// 現在の時間幅（分）
let currentTimeRangeMinutes = 10;

// 時間幅に応じた集約間隔（秒）を取得
function getAggregationInterval(minutes) {
    if (minutes <= 10) return 5;         // 10分: 5秒ごと (120本)
    if (minutes === 60) return 30;       // 1時間: 30秒ごと (120本)
    if (minutes === 1440) return 600;    // 24時間: 10分ごと (144本)
    if (minutes === 10080) return 3600;  // 1週間: 1時間ごと (168本)
    if (minutes === 40320) return 21600; // 4週間: 6時間ごと (112本)
    return 86400;                         // 1年: 24時間ごと (365本)
}

// 時間幅に応じたデータポイント数を計算
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

// 横軸のラベルを生成（データがなくても固定、キリのいい時刻）
function generateTimeLabels(minutes) {
    const labels = [];
    const now = new Date();
    const dataPoints = getDataPointCount(minutes);
    const interval = getAggregationInterval(minutes);
    
    // 現在時刻をインターバルに合わせて切り捨て
    const baseTime = floorToInterval(now, interval);
    
    for (let i = dataPoints - 1; i >= 0; i--) {
        const time = new Date(baseTime.getTime() - i * interval * 1000);
        if (minutes <= 10) {
            labels.push(time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } else if (minutes >= 525600) {
            // 1年: 月/日
            labels.push(time.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }));
        } else if (minutes >= 40320) {
            // 4週間: 日付のみ
            labels.push(time.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }));
        } else if (minutes >= 10080) {
            // 1週間: 日付と時刻
            labels.push(time.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }) + ' ' + 
                       time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
        } else {
            labels.push(time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
        }
    }
    return labels;
}

// データをタイムスタンプでマッピング・集約（送信/受信別）
function mapDataToLabels(data, minutes) {
    const dataPoints = getDataPointCount(minutes);
    const interval = getAggregationInterval(minutes);
    // 基準時刻をインターバルに合わせて切り捨て（ラベルと同期）
    const baseTime = floorToInterval(new Date(), interval);
    const nowSeconds = Math.floor(baseTime.getTime() / 1000);
    const result = {
        inBytes: new Array(dataPoints).fill(0),
        outBytes: new Array(dataPoints).fill(0),
        inPackets: new Array(dataPoints).fill(0),
        outPackets: new Array(dataPoints).fill(0)
    };
    
    // データをタイムスタンプでインデックスに変換（集約）
    data.forEach(row => {
        const secondsAgo = nowSeconds - row.timestamp;
        const index = dataPoints - 1 - Math.floor(secondsAgo / interval);
        if (index >= 0 && index < dataPoints) {
            // 送信/受信別に集計
            result.inBytes[index] += parseFloat(((row.in_bytes || 0) / (1024 * 1024)).toFixed(4));
            result.outBytes[index] += parseFloat(((row.out_bytes || 0) / (1024 * 1024)).toFixed(4));
            result.inPackets[index] += row.in_packets || 0;
            result.outPackets[index] += row.out_packets || 0;
        }
    });
    
    // 小数点以下を整理
    result.inBytes = result.inBytes.map(v => parseFloat(v.toFixed(2)));
    result.outBytes = result.outBytes.map(v => parseFloat(v.toFixed(2)));
    
    return result;
}

// 時間幅に応じた必要なレコード数を取得（DBは5秒間隔で保存）
function getRequiredRecordCount(minutes) {
    return minutes * 12; // 1分 = 12レコード（5秒間隔）
}

// リアルタイムデータを取得
async function loadRealtimeData() {
    try {
        // DBから必要な全レコードを取得（5秒間隔のデータ）
        const limit = getRequiredRecordCount(currentTimeRangeMinutes);
        const res = await fetch(`/api/realtimePackets?limit=${limit}`);
        
        if (!res.ok) {
            throw new Error("HTTP error" + res.status);
        }
        
        const data = await res.json();
        const labels = generateTimeLabels(currentTimeRangeMinutes);
        const mappedData = mapDataToLabels(data, currentTimeRangeMinutes);
        
        realtimeBytesChart(labels, mappedData.inBytes, mappedData.outBytes);
        realtimePacketsChart(labels, mappedData.inPackets, mappedData.outPackets);
        
    } catch (err) {
        console.error(err);
    }
}

let realtimeBytesChartData = null;

// リアルタイム データ量（MB単位）グラフ - 送信/受信別
function realtimeBytesChart(labels, inBytesData, outBytesData) {
    const canvas = document.getElementById("realtimeBytes");
    
    if (!canvas) {
        console.error("not found <canvas id='realtimeBytes'> in html");
        return;
    }

    // データの最大値を計算し、その4/3倍をY軸の最大値に設定（最低1MB）
    const maxDataValue = Math.max(...inBytesData, ...outBytesData);
    const yAxisMax = Math.max(maxDataValue * (4/3), 1);

    if (!realtimeBytesChartData) {
        realtimeBytesChartData = new Chart(canvas, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "IN",
                        data: inBytesData,
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
                        data: outBytesData,
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
                                return context.dataset.label + ": " + context.parsed.y.toFixed(2) + " MB";
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
                animation: {
                    duration: 0
                }
            }
        });
    } else {
        // 更新処理
        realtimeBytesChartData.data.labels = labels;
        realtimeBytesChartData.data.datasets[0].data = inBytesData;
        realtimeBytesChartData.data.datasets[1].data = outBytesData;
        realtimeBytesChartData.options.scales.y.max = yAxisMax;
        realtimeBytesChartData.update('none');
    }
}

let realtimePacketsChartData = null;

// リアルタイム パケット数グラフ - 送信/受信別
function realtimePacketsChart(labels, inPacketsData, outPacketsData) {
    const canvas = document.getElementById("realtimePackets");
    
    if (!canvas) {
        console.error("not found <canvas id='realtimePackets'> in html");
        return;
    }

    // データの最大値を計算し、その4/3倍をY軸の最大値に設定（最低1000パケット）
    const maxDataValue = Math.max(...inPacketsData, ...outPacketsData);
    const yAxisMax = Math.max(maxDataValue * (4/3), 1000);

    if (!realtimePacketsChartData) {
        realtimePacketsChartData = new Chart(canvas, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "IN",
                        data: inPacketsData,
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
                        data: outPacketsData,
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
                                return context.dataset.label + ": " + context.parsed.y.toLocaleString() + " パケット";
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
                animation: {
                    duration: 0
                }
            }
        });
    } else {
        // 更新処理
        realtimePacketsChartData.data.labels = labels;
        realtimePacketsChartData.data.datasets[0].data = inPacketsData;
        realtimePacketsChartData.data.datasets[1].data = outPacketsData;
        realtimePacketsChartData.options.scales.y.max = yAxisMax;
        realtimePacketsChartData.update('none');
    }
}

// キャプチャ状態をチェックしてインジケーターを更新
async function checkCaptureStatus() {
    try {
        const res = await fetch("/api/captureStatus");
        if (!res.ok) return;
        
        const data = await res.json();
        
        // グラフタイトルのインジケーター
        const titles = document.querySelectorAll('.chart-title');
        titles.forEach(title => {
            if (data.active) {
                title.classList.remove('stopped');
                title.classList.add('running');
            } else {
                title.classList.remove('running');
                title.classList.add('stopped');
            }
        });
        
        // サイドバーのLinaPタイトルのインジケーター
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle) {
            if (data.active) {
                headerTitle.classList.remove('stopped');
                headerTitle.classList.add('running');
            } else {
                headerTitle.classList.remove('running');
                headerTitle.classList.add('stopped');
            }
        }
    } catch (err) {
        console.error("Failed to check capture status:", err);
    }
}

let timerId;
let statusTimerId;

// 時間幅変更時にグラフをリセットして再描画
function onTimeRangeChange(minutes) {
    currentTimeRangeMinutes = minutes;
    
    // グラフをリセット
    if (realtimeBytesChartData) {
        realtimeBytesChartData.destroy();
        realtimeBytesChartData = null;
    }
    if (realtimePacketsChartData) {
        realtimePacketsChartData.destroy();
        realtimePacketsChartData = null;
    }
    
    // 再読み込み
    loadRealtimeData();
}

// ページが読み込まれたらloadRealtimeDataを実行する
window.addEventListener("DOMContentLoaded", () => {
    // 時間幅ラジオボタンのイベントリスナー
    const timeRangeRadios = document.querySelectorAll('input[name="time-range"]');
    timeRangeRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            onTimeRangeChange(parseInt(e.target.value));
        });
    });
    
    loadRealtimeData();
    checkCaptureStatus();
    // 5秒ごとに更新
    timerId = setInterval(loadRealtimeData, 5000);
    statusTimerId = setInterval(checkCaptureStatus, 5000);
});
