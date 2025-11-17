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