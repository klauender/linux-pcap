//expressとsqliteを読み込む
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

//アプリケーション本体を作る
const app = express();

//設定
const PORT = 3000;  //ポート番号

//app.use expressにミドルウェアという処理を登録している
//express.static 静的ファイル(ただファイルを渡す)として配信するミドルウェアを作る
//path.join... フォルダの公開範囲を絶対パスで設定。__dirname=今動いているserver.jsの絶対パス そこに相対パス"../web"を組み合わせる。これが公開範囲の絶対パス
app.use(express.static(path.join(__dirname, "../web")));

//データベースを変数に格納
const db = new sqlite3.Database("../flow.db");

// GET /api/healthにリクエストが来たらこの関数を実行する
//req: リクエスト情報 req.url などで情報を取得できる
//res: レスポンス情報
app.get("/api/health", (req, res) => {
    //json形式でレスポンスを返す
    res.json({status: "ok"});
});

app.get("/api/flows", (req, res) => {

    //ソートの指標
    const metricParam = (req.query.metric || "packets").toLowerCase();   //packetsやbytesなど
    let metric;

    if(metricParam === "packets") {
        metric = "packets";
    } 
    else if (metricParam === "bytes") {
        metric = "bytes";
    }
    else {
        metric = "bytes";
    };

    //昇順 or 降順
    const directionParam = (req.query.direction || "desc").toLowerCase(); // asc,desc期待
    let direction;

    if (directionParam === "asc") {
        direction = "ASC";
    }
    else if (directionParam === "desc") {
        direction = "DESC";
    }
    else {
        direction = "DESC"
    }



    //urlの?limit=10の部分がreq.queryに入る
    //Number()は文字→数値変換。何も指定なしだとNaNになる

    //値は?
    //sqlは${}
    let sql = `
        select *
        from flows
        order by ${metric} ${direction}
    `;

    //プレースホルダ用配列
    const params = [];

    const limit = Number(req.query.limit);

    //isFinite 有限か無限か
    if(Number.isFinite(limit) && limit > 0) {
        sql += " limit ?";
        params.push(limit);
    }

    sql += ";";

    //db.allはselect文を実行してその結果をjsのオブジェクト配列に変換したものをrows変数に入れる
    //db.runはinsert, update, deleteしたいときに使う。db.getは一行だけほしいとき
    //rowsにはselectの結果がjsのオブジェクト配列で入る
    //まず第一引数、第二引数によってsqlが実行され、その結果がerr,rowsに格納される
    db.all(sql, params, (err, rows) => {

        //エラーがなければerrにnullが入る
        if (err) {
            console.error("DB error:", err);
            //エラーとして返す
            //returnはここでこの関数は終わり。これ以降は実行しないでの意味
            return res.status(500).json({error: "database error"});
        }

        //res.の形でレスポンスする
        //送信のためにjsのオブジェクト配列をjson形式にして返す。それをクライアント側がまたオブジェクト配列に戻して使う
        //js配列 → json形式 → 送信 → json形式 → js配列
        res.json(rows);
    });
});

//これがjsがサーバーと認識する決めて。
//listenでポート番号を開いてreq来いって待ってる状態
//サーバーを起動する
app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}/api/flows`);
});