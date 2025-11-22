console.log("script.js loaded");

let flowsChart = null;

//これでawaitが使えるようになる
//データを取りに行って、描画用の関数に渡す係
async function loadFlows() {
    try {
        //resが帰ってくるまで待つ
        const res = await fetch("/api/flows?metric=bytes&direction=desc&limit=10");
        
        //.okで成功かどうかチェック。ステータスコードが404や500などの場合false
        if(!res.ok) {
            
            //throwはエラーを投げる=中断する命令 try→catchを探す
            throw new Error("HTTP error" + res.status);
        }

        //json形式→jsオブジェクト形式に解凍 jsonパース
        const data = await res.json();
        console.log("flows:", data);

        //グラフ描画関数
        renderFlowsChart(data);
        
        //ここから先の場所でdataを使ってhtmlに表示やグラフ化する

    } catch (err) {
        console.error(err);
    }
}

//chart.jsにデータと座標を渡して描画してもらう
//canvas...どこに描くか
//labels/values...何を書くのか
function renderFlowsChart(data) {

    //htmlのid=flowsChartのタグを取ってくる
    const canvas = document.getElementById("top10FlowsByBytes");   //場所指定
    console.log("canvas:", canvas);

    if(!canvas){
        console.error("flowChartのcanvasが見つからない")
        return;
    }



    //ラベル用配列...どの項目を並べるか(名前たち)
    //値用配列...その項目の値はいくつか(数字たち)　を作る

    //.mapでdataというjsの配列を新しい配列にする
    //例) [1,2,3].map(x => x * 2);    →   [2,4,6]
    const labels = data.map(row => `${row.src_ip} → ${row.dst_ip}`);
    const values = data.map(row => row.bytes);

    // flowsChartがない場合新しく作る
    if (!flowsChart) {

        flowsChart = new Chart(canvas, {
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
        flowsChart.data.labels = labels;
        flowsChart.data.datasets[0].data = values;
        flowsChart.update();
    }
}

//ページが読み込まれたらloadFlowsを実行する
//これをしたらindex.htmlを開いただけで自動的にfetchが走る
window.addEventListener("DOMContentLoaded", () => {
    loadFlows();
});