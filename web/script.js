console.log("script.js loaded");
// sidebar-toggleボタンをクリックしたら、sidebarにcollapsedクラスを付け外しする

//documentは今表示しているhtmlページ全体
// classが.sidebarの要素を取得
//HTMLの中の <div class="sidebar">...</div> をJavaScript側で触れるように変数に保存してる
const sidebar = document.querySelector(".sidebar");

// 同じように.sidebar-toggleの要素を変数に格納
const sidebarToggleBtn = document.querySelector(".sidebar-toggle");
const themeToggleBtn = document.querySelector(".theme-toggle");
const themeIcon = themeToggleBtn.querySelector(".theme-icon");
const searchForm = document.querySelector(".search-form");


//アイコン更新
const updateThemeIcon = () => {
    const isDark = document.body.classList.contains("dark-theme");
    themeIcon.textContent =sidebar.classList.contains("collapsed") ? (isDark ? "light_mode" : "dark_mode") : "dark_mode";
};

const savedTheme = localStorage.getItem("theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark").matches;
const shouldUseDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);

document.body.classList.toggle("dark-theme", shouldUseDarkTheme);

updateThemeIcon();

//要素.に対して実行する(アクションの種類, 実行内容)
// .toggleは、指定したクラスがあれば外し、なければ付ける動作をする
sidebarToggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    updateThemeIcon();
});

searchForm.addEventListener("click", () => {
    if(sidebar.classList.contains("collapsed")) {
        sidebar.classList.remove("collapsed");
        searchForm.querySelector("input").focus();
    }
});

//isDarkにはtrue/falseが入る
//localStrageはブラウザにデータを永続保存できる場所。ページを閉じても残るキー:値ペア
//setItem(キー:値)として保存
//(theme : dark/light)として保存
themeToggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateThemeIcon();
});

//これでawaitが使えるようになる
//データを取りに行って、描画用の関数に渡す係
async function loadFlows() {
    try {
        //resが帰ってくるまで待つ
        const res = await fetch("/api/flows?metric=bytes&order=desc&limit=10");
        
        //.okで成功かどうかチェック。ステータスコードが404や500などの場合false
        if(!res.ok) {
            
            //throwはエラーを投げる=中断する命令 try→catchを探す
            throw new Error("HTTP error" + res.status);
        }

        //json形式→jsオブジェクト形式に解凍 jsonパース
        const data = await res.json();
        console.log("flows:", data);
        
        //ここから先の場所でdataを使ってhtmlに表示やグラフ化する

    } catch (err) {
        console.error(err);
    }
}

//ページが読み込まれたらloadFlowsを実行する
//これをしたらindex.htmlを開いただけで自動的にfetchが走る
window.addEventListener("DOMContentLoaded", () => {
    loadFlows();
});