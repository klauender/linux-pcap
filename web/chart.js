console.log("script.js loaded");

//これでawaitが使えるようになる
//データを取りに行って、描画用の関数に渡す係
async function loadFlows() {

    try {
        //resが帰ってくるまで待つ
        const [flowsByBytesRes, flowsByPacketsRes, bytesByDirectionRes] = await Promise.all([
            fetch("/api/flows?metric=bytes&direction=desc&limit=10"),
            fetch("/api/flows?metric=packets&direction=desc&limit=10"),
            fetch("/api/bytesByDirection"),
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

        //json形式→jsオブジェクト形式に解凍 jsonパース
        const [flowsByBytesData, flowsByPacketsData, bytesByDirectionData] = await Promise.all([
            flowsByBytesRes.json(),
            flowsByPacketsRes.json(),
            bytesByDirectionRes.json()
        ]);

        //グラフ描画関数
        flowsByBytesChart(flowsByBytesData);
        flowsByPacketsChart(flowsByPacketsData);
        bytesByDirectionChart(bytesByDirectionData)
        
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

        flowsByBytesChartData = new Chart(canvas, {
            type: "bar",    //棒グラフ

            data: {
                //ラベル
                labels: labels,   //横向きラベル

                //データ
                datasets: [{
                    label: "MB",
                    data: values,
                }]
            },
            options: {
            indexAxis: "y", //横棒グラフ
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "MB"
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Flow"
                        }
                    }
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

        flowsByPacketsChartData = new Chart(canvas, {
            type: "bar",    //棒グラフ

            data: {
                //ラベル
                labels: labels,   //横向きラベル

                //データ
                datasets: [{
                    label: "Packets",
                    data: values,
                }]
            },
            options: {
            indexAxis: "y", //横棒グラフ
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Packets"
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Flow"
                        }
                    }
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
    const values = data.map(row => row.totalBytes);

    if (!bytesByDirectionChartData) {

        bytesByDirectionChartData = new Chart(canvas, {
            type: "pie",    //円グラフ

            data: {
                labels: labels,
                datasets: [{
                    label: "Bytes",
                    data: values,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom",
                    },
                },
            }
        });

    } else {
        //すでにchartがある場合は中身入れ替えて更新
        bytesByDirectionChartData.data.labels = labels;
        bytesByDirectionChartData.data.datasets[0].data = values;
        bytesByDirectionChartData.update();
    }
}


let timerId;

//ページが読み込まれたらloadFlowsを実行する
//これをしたらindex.htmlを開いただけで自動的にfetchが走る
window.addEventListener("DOMContentLoaded", () => {
    loadFlows();

    //予約関数setInterval...「○ミリ秒ごとに、この関数を呼び続けて」ってお願いする
    //setInterval() を呼ぶと、ブラウザ側が「このタイマーはID=1ね」みたいに番号をくれて、その番号が timerId に入る。
    timerId = setInterval(loadFlows, 5000); //ms単位
});