const sqlite3 = require("sqlite3").verbose();

//express本体を読み込む
const express = require("express");

//アプリケーション本体を作る
const app = express();

//このサーバーが使うポート番号
const PORT = 3000;

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
    const metricParam = req.query.metric;   //packetsやbytesなど
    let sortColumn;

    if(metricParam === "packets") {
        sortColumn = "packets";
    } 
    else if (metricParam === "bytes") {
        sortColumn = "bytes";
    }
    else {
        sortColumn = "bytes";
    };

    //昇順 or 降順
    const orderParam = (req.query.order || "").toLowerCase(); // asc,desc期待
    let sortDirection;

    if (orderParam === "asc") {
        sortDirection = "ASC";
    }
    else if (orderParam === "desc") {
        sortDirection = "DESC";
    }
    else {
        sortDirection = "DESC"
    }

    //urlの?limit=10の部分がreq.queryに入る
    //Number()は文字→数値変換。何も指定なしだとNaNになる
    const limit = Number(req.query.limit) || 20;

    const sql = `
        select *
        from flows
        order by ${sortColumn} ${sortDirection}
        limit ?
        ;
    `;

    //db.allはselect文を実行して、結果の全行をいっぺんに配列で撮ってくる
    //db.runはinsert, update, deleteしたいときに使う
    //db.getは一行だけほしいとき
    //第一引数はsql
    //第二引数はsqlに渡す ?の部分
    //第三引数はコールバック関数
    //errにはエラーがあればその情報、なければnullが入る
    //rowsにはselectの結果が配列で入る
    //まず第一引数、第二引数によってsqlが実行され、その結果がerr,rowsに格納される
    //その後にコールバック関数が実行される
    db.all(sql, [limit], (err, rows) => {

        //エラーチェック
        if (err) {
            console.error("DB error:", err);
            //エラーとして返す
            //returnはここでこの関数は終わり。これ以降は実行しないでの意味
            return res.status(500).json({error: "database error"});
        }

        //エラーがなければrowsを返す
        res.json(rows);
    });
});

//サーバーを起動する
app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}/api/flows`);
});