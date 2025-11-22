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
const db = new sqlite3.Database(path.join(__dirname, "../flow.db"));

// GET /api/healthにリクエストが来たらこの関数を実行する
//req: リクエスト情報 req.url などで情報を取得できる
//res: レスポンス情報
app.get("/api/health", (req, res) => {
    //json形式でレスポンスを返す
    res.json({status: "ok"});
});

app.get("/api/flowsByBytes", (req, res) => {
    
    let sql = `
        select src_ip, dst_ip, direction, bytes
        from flows
        order by bytes desc
        limit 10
        ;
    `
    db.all(sql, [], (err, rows) => {

        //エラーがなければerrにnullが入る
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({error: "database error"});
        }
        
        res.json(rows);
    });
});

app.get("/api/flowsByPackets", (req, res) => {
    
    let sql = `
        select src_ip, dst_ip, direction, packets
        from flows
        order by packets desc
        limit 10
        ;
    `
    db.all(sql, [], (err, rows) => {

        //エラーがなければerrにnullが入る
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({error: "database error"});
        }
        
        res.json(rows);
    });
});

app.get("/api/bytesByDirection", (req, res) => {
    
    let sql = `
        select direction,
        sum(bytes) as totalBytes
        from flows
        group by direction
        ;
    `
    db.all(sql, [], (err, rows) => {

        //エラーがなければerrにnullが入る
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({error: "database error"});
        }
        
        res.json(rows);
    });
});

//これがjsがサーバーと認識する決めて。
//listenでポート番号を開いてreq来いって待ってる状態
//サーバーを起動する
app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}/index.html`);
});