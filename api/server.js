//expressとsqliteを読み込む
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const session = require("express-session"); // ← セッション用（npm install express-session）

//データベースを変数に格納
const db = new sqlite3.Database(path.join(__dirname, "../flow.db"));

//アプリケーション本体を作る
const app = express();
const PORT = 3000;  //ポート番号

// フォームの値を受け取るための設定（POSTのrole/passwordを読む）
app.use(express.urlencoded({ extended: false }));

// セッションの設定（ログイン状態を覚える）
app.use(
    session({
        secret: "change-this-secret-key", // 適当な長い文字列に変えてOK
        resave: false,
        saveUninitialized: false,
    })
);

//__dirname = 今動いているserver.jsの絶対パス そこに相対パス"../web"を組み合わせる。これが公開範囲の絶対パス
app.use(express.static(path.join(__dirname, "../web")));


// =====================
//  ログイン関連のルート
// =====================

// GET /login : ログイン画面を表示
app.get("/login", (req, res) => {
    // すでにログイン済みなら /index へ飛ばす（お好みで）
    if (req.session.loggedIn) {
        return res.redirect("/index");
    }

    res.sendFile(path.join(__dirname, "../web/login.html"));
});

// POST /login : ログイン処理（DBのloginテーブルと照合）
app.post("/login", (req, res) => {
    const role = req.body.role;
    const password = req.body.password;

    // 空欄チェックも同じエラー扱いでいいならまとめてOK
    if (!role || !password) {
        return res.redirect("/login?error=1");
    }

    const sql = "SELECT password FROM login WHERE role = ?";

    db.get(sql, [role], (err, row) => {
        if (err) {
            console.error("DB error:", err);
            // サーバー側のエラーだけ別コードにしたいなら error=2 とかでもOK
            return res.status(500).send("サーバーエラーが発生しました");
        }

        // 該当roleなし or パスワード不一致
        if (!row || row.password !== password) {
            return res.redirect("/login?error=1");
        }

        // 認証成功
        req.session.loggedIn = true;
        req.session.role = role;

        return res.redirect("/index");
    });
});


// GET /logout : ログアウト（セッション破棄して/loginへ）
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

// GET /index : ログイン必須ページの例
// ここでは index.html を返す前にセッション確認を入れてる
app.get("/index", (req, res) => {
    //req.session.loggedInを見てセッション確認
    //ない→/login  ある→/index
    if (!req.session.loggedIn) {
        return res.redirect("/login");
    }

    res.sendFile(path.join(__dirname, "../web/index.html"));
});

// GET /settings : 設定ページ（adminのみ）
app.get("/settings", (req, res) => {
    // ログイン確認
    if (!req.session.loggedIn) {
        return res.redirect("/login");
    }
    
    // viewerはアクセス不可
    if (req.session.role === "viewer") {
        return res.redirect("/index");
    }

    res.sendFile(path.join(__dirname, "../web/settings.html"));
});

// GET /realtime : リアルタイムページ
app.get("/realtime", (req, res) => {
    // ログイン確認
    if (!req.session.loggedIn) {
        return res.redirect("/login");
    }

    res.sendFile(path.join(__dirname, "../web/realtime.html"));
});

// GET /security : セキュリティページ
app.get("/security", (req, res) => {
    // ログイン確認
    if (!req.session.loggedIn) {
        return res.redirect("/login");
    }

    res.sendFile(path.join(__dirname, "../web/security.html"));
});

// GET /packet : パケットページ
app.get("/packet", (req, res) => {
    // ログイン確認
    if (!req.session.loggedIn) {
        return res.redirect("/login");
    }

    res.sendFile(path.join(__dirname, "../web/packet.html"));
});

// GET /network : ネットワークページ
app.get("/network", (req, res) => {
    // ログイン確認
    if (!req.session.loggedIn) {
        return res.redirect("/login");
    }

    res.sendFile(path.join(__dirname, "../web/network.html"));
});


// =====================
//  ここから下は既存API
// =====================

// GET /api/healthにリクエストが来たらこの関数を実行する
//req: リクエスト情報 req.url などで情報を取得できる
//res: レスポンス情報
app.get("/api/health", (req, res) => {
    //json形式でレスポンスを返す
    res.json({status: "ok"});
});

// ログイン中ユーザー情報を返すAPI
app.get("/api/session", (req, res) => {
    if (!req.session || !req.session.loggedIn) {
        return res.status(401).json({ loggedIn: false });
    }

    res.json({
        loggedIn: true,
        role: req.session.role,
    });
});

// パスワード変更API（adminのみ、権限別にパスワード変更可能）
app.post("/api/change-password", (req, res) => {
    // ログイン確認
    if (!req.session || !req.session.loggedIn) {
        return res.status(401).json({ success: false, error: "ログインが必要です" });
    }

    // adminのみ実行可能
    if (req.session.role !== "admin") {
        return res.status(403).json({ success: false, error: "管理者権限が必要です" });
    }

    const targetRole = req.body.targetRole;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    // 入力チェック
    if (!targetRole || !oldPassword || !newPassword) {
        return res.status(400).json({ success: false, error: "すべてのフィールドを入力してください" });
    }

    // 対象権限の検証
    if (targetRole !== "admin" && targetRole !== "viewer") {
        return res.status(400).json({ success: false, error: "無効な権限です" });
    }

    // 現在のパスワードを確認
    const checkSql = "SELECT password FROM login WHERE role = ?";
    db.get(checkSql, [targetRole], (err, row) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ success: false, error: "データベースエラーが発生しました" });
        }

        if (!row || row.password !== oldPassword) {
            return res.status(400).json({ success: false, error: "現在のパスワードが正しくありません" });
        }

        // パスワードを更新
        const updateSql = "UPDATE login SET password = ? WHERE role = ?";
        db.run(updateSql, [newPassword, targetRole], (updateErr) => {
            if (updateErr) {
                console.error("DB error:", updateErr);
                return res.status(500).json({ success: false, error: "パスワードの更新に失敗しました" });
            }

            res.json({ success: true, message: `${targetRole}のパスワードが正常に変更されました` });
        });
    });
});

app.get("/api/flowsByBytes", (req, res) => {
    
    const sql = `
        select src_ip, dst_ip, direction, bytes
        from flows
        order by bytes desc
        limit 10
        ;
    `;
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
    
    const sql = `
        select src_ip, dst_ip, direction, packets
        from flows
        order by packets desc
        limit 10
        ;
    `;
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
    
    const sql = `
        select direction,
        sum(bytes) as totalBytes
        from flows
        group by direction
        ;
    `;
    db.all(sql, [], (err, rows) => {

        //エラーがなければerrにnullが入る
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({error: "database error"});
        }
        
        res.json(rows);
    });
});

app.get("/api/packetsByDirection", (req, res) => {
    
    const sql = `
        select direction,
        sum(packets) as totalPackets
        from flows
        group by direction
        ;
    `;
    db.all(sql, [], (err, rows) => {

        //エラーがなければerrにnullが入る
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({error: "database error"});
        }
        
        res.json(rows);
    });
});

app.get("/api/bytesByProtocol", (req, res) => {
    
    const sql = `
        select protocol,
        sum(bytes) as totalBytes
        from flows
        group by protocol
        ;
    `;
    db.all(sql, [], (err, rows) => {

        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({error: "database error"});
        }
        
        res.json(rows);
    });
});

app.get("/api/packetsByProtocol", (req, res) => {
    
    const sql = `
        select protocol,
        sum(packets) as totalPackets
        from flows
        group by protocol
        ;
    `;
    db.all(sql, [], (err, rows) => {

        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({error: "database error"});
        }
        
        res.json(rows);
    });
});

const fs = require("fs");

const PID_FILE = "/tmp/flow.pid";

// プロセスが実行中かチェック（/procディレクトリを使用）
function isProcessRunning(pid) {
    try {
        // /proc/[pid]ディレクトリが存在すればプロセスは実行中
        return fs.existsSync(`/proc/${pid}`);
    } catch (e) {
        return false;
    }
}

// キャプチャ状態確認API
app.get("/api/captureStatus", (req, res) => {
    try {
        // PIDファイルが存在するかチェック
        if (!fs.existsSync(PID_FILE)) {
            return res.json({ active: false, pid: null });
        }
        
        // PIDファイルを読み取り
        const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim());
        
        if (isNaN(pid)) {
            return res.json({ active: false, pid: null });
        }
        
        // プロセスが実行中かチェック
        const isActive = isProcessRunning(pid);
        
        res.json({
            active: isActive,
            pid: isActive ? pid : null
        });
    } catch (err) {
        console.error("Error checking capture status:", err);
        res.json({ active: false, pid: null });
    }
});

// リアルタイムパケットデータ取得API（最新60件 = 5分間分）
app.get("/api/realtimePackets", (req, res) => {
    const limit = parseInt(req.query.limit) || 60; // デフォルト60件（5分間）
    
    const sql = `
        SELECT 
            timestamp,
            total_bytes,
            total_packets
        FROM realtime_packets
        ORDER BY timestamp DESC
        LIMIT ?
    `;
    
    db.all(sql, [limit], (err, rows) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({error: "database error"});
        }
        
        // 時系列順にソート（古い順）
        const sortedRows = rows.reverse();
        res.json(sortedRows);
    });
});

//これがjsがサーバーと認識する決めて。
//listenでポート番号を開いてreq来いって待ってる状態
//サーバーを起動する
app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}/index`);
});