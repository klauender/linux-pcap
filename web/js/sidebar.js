// sidebar-toggleボタンをクリックしたら、sidebarにcollapsedクラスを付け外しする

document.addEventListener("DOMContentLoaded", () => {
    //documentは今表示しているhtmlページ全体
    // classが.sidebarの要素を取得
    //HTMLの中の <div class="sidebar">...</div> をJavaScript側で触れるように変数に保存してる
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    // 同じように.sidebar-toggleの要素を変数に格納
    const sidebarToggleBtn = document.querySelector(".sidebar-toggle");
    const themeToggleBtn = document.querySelector(".theme-toggle");
    const searchForm = document.querySelector(".search-form");

    if (!sidebarToggleBtn || !themeToggleBtn) return;

    const themeIcon = themeToggleBtn.querySelector(".theme-icon");
    if (!themeIcon) return;

    //アイコン更新
    const updateThemeIcon = () => {
        const isDark = document.body.classList.contains("dark-theme");
        themeIcon.textContent = sidebar.classList.contains("collapsed") ? (isDark ? "light_mode" : "dark_mode") : "dark_mode";
    };

    // サイドバーの折りたたみ状態を復元
    const savedSidebarState = localStorage.getItem("sidebarCollapsed");
    if (savedSidebarState === "true") {
        sidebar.classList.add("collapsed");
    }

    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);

    document.body.classList.toggle("dark-theme", shouldUseDarkTheme);

    updateThemeIcon();

    //要素.に対して実行する(アクションの種類, 実行内容)
    // .toggleは、指定したクラスがあれば外し、なければ付ける動作をする
    sidebarToggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        // サイドバーの状態を保存
        localStorage.setItem("sidebarCollapsed", sidebar.classList.contains("collapsed"));
        updateThemeIcon();
    });

    // 検索フォームが存在する場合のみイベントリスナーを追加
    if (searchForm) {
        searchForm.addEventListener("click", () => {
            if(sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");
                const input = searchForm.querySelector("input");
                if (input) {
                    input.focus();
                }
            }
        });
    }

    //isDarkにはtrue/falseが入る
    //localStorageはブラウザにデータを永続保存できる場所。ページを閉じても残るキー:値ペア
    //setItem(キー:値)として保存
    //(theme : dark/light)として保存
    themeToggleBtn.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-theme");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        updateThemeIcon();
        // グラフのテーマを更新
        if (typeof window.updateChartsTheme === "function") {
            // 少し遅延させて、DOMの更新を確実にする
            setTimeout(() => {
                window.updateChartsTheme();
            }, 10);
        }
    });
});