console.log("script.js loaded");

//これでawaitが使えるようになる
//データを取りに行って、描画用の関数に渡す係
async function loadFlows() {
    try {
        //resが帰ってくるまで待つ
        const [flowsByBytesRes, flowsByPacketsRes] = await Promise.all([
            fetch("/api/flows?metric=bytes&direction=desc&limit=10"),
            fetch("/api/flows?metric=packets&direction=desc&limit=10"),
        ]);

        
        //.okで成功かどうかチェック。ステータスコードが404や500などの場合false
        if(!flowsByBytesRes.ok) {  
            //throwはエラーを投げる=中断する命令 try→catchを探す
            throw new Error("HTTP error" + resFlowsByBytes.status);
        }

        if(!flowsByPacketsRes.ok) {  
            throw new Error("HTTP error" + resFlowsByPackets.status);
        }

        //json形式→jsオブジェクト形式に解凍 jsonパース
        const [flowsByBytesData, flowsByPacketsData] = await Promise.all([
            flowsByBytesRes.json(),
            flowsByPacketsRes.json(),
        ]);

        //グラフ描画関数
        flowsByBytesChart(flowsByBytesData);
        flowsByPacketsChart(flowsByPacketsData);
        
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
        console.error("flowChartのcanvasが見つからない")
        return;
    }

    //ラベルと値を設定
    //.mapでdata配列を新しい配列にする
    //例) [1,2,3].map(x => x * 2);    →   [2,4,6]
    const labels = data.map(row => `${row.src_ip} → ${row.dst_ip}`);
    const values = data.map(row => row.bytes);

    // flowsByBytesChartがない場合新しく作る
    if (!flowsByBytesChartData) {

        flowsByBytesChartData = new Chart(canvas, {
            type: "bar",    //棒グラフ

            data: {
                //ラベル
                labels: labels,   //横向きラベル

                //データ
                datasets: [{
                    label: "Bytes",
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
                            text: "Bytes"
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
        console.error("flowChartのcanvasが見つからない")
        return;
    }

    const labels = data.map(row => `${row.src_ip} → ${row.dst_ip}`);
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

//ページが読み込まれたらloadFlowsを実行する
//これをしたらindex.htmlを開いただけで自動的にfetchが走る
window.addEventListener("DOMContentLoaded", () => {
    loadFlows();
});