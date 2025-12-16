// sidebar-toggleボタンをクリックしたら、sidebarにcollapsedクラスを付け外しする

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    const sidebarToggleBtn = document.querySelector(".sidebar-toggle");
    const themeToggleBtn = document.querySelector(".theme-toggle");
    const unitToggleBtn = document.querySelector(".unit-toggle");
    const searchForm = document.querySelector(".search-form");

    if (!sidebarToggleBtn || !themeToggleBtn) return;

    const themeIcon = themeToggleBtn.querySelector(".theme-icon");
    if (!themeIcon) return;

    // ログインセッション確認・ユーザー状態表示
    const statusEl = document.getElementById("login-status-footer");
    if (statusEl) {
        fetch("/api/session")
            .then((res) => {
                if (!res.ok) return null;
                return res.json();
            })
            .then((data) => {
                if (!data || !data.loggedIn) return;

                let roleLabel = "";
                if (data.role === "admin") {
                    roleLabel = "admin";
                } else if (data.role === "viewer") {
                    roleLabel = "viewer";
                    // viewerの場合は設定リンクを非表示
                    const settingsLink = document.querySelector('a[href="/settings"]');
                    if (settingsLink) {
                        settingsLink.style.display = 'none';
                    }
                } else {
                    roleLabel = data.role;
                }

                statusEl.textContent = roleLabel + " がログイン中";
            })
            .catch((err) => {
                console.error("session取得エラー:", err);
            });
    }

    // 初期読み込み時はトランジションを無効化
    sidebar.style.transition = "none";

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

    // 単位の状態を復元
    const savedUnit = localStorage.getItem("displayUnit") || "mb";
    const updateUnitDisplay = (unit) => {
        if (!unitToggleBtn) return;
        const unitIcon = unitToggleBtn.querySelector(".unit-icon");
        const unitText = unitToggleBtn.querySelector(".unit-text");
        if (unit === "pkt") {
            unitToggleBtn.classList.add("pkt-mode");
            if (unitIcon) unitIcon.textContent = "inventory_2";
            if (unitText) unitText.textContent = "Packets";
        } else {
            unitToggleBtn.classList.remove("pkt-mode");
            if (unitIcon) unitIcon.textContent = "scale";
            if (unitText) unitText.textContent = "Bytes";
        }
    };
    updateUnitDisplay(savedUnit);
    // グローバルに単位を公開
    window.currentDisplayUnit = savedUnit;

    // 少し待ってからトランジションを有効化
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            sidebar.style.transition = "";
        });
    });

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

    // 単位切り替えボタンのイベント
    if (unitToggleBtn) {
        unitToggleBtn.addEventListener("click", () => {
            const isPkt = !unitToggleBtn.classList.contains("pkt-mode");
            const newUnit = isPkt ? "pkt" : "mb";
            updateUnitDisplay(newUnit);
            localStorage.setItem("displayUnit", newUnit);
            window.currentDisplayUnit = newUnit;
            
            // グラフの単位を更新
            if (typeof window.onUnitChange === "function") {
                window.onUnitChange(newUnit);
            }
        });
    }

    // 時間範囲選択の状態を復元・管理
    const timeRangeControls = document.querySelectorAll('input[name="time-range"]');
    if (timeRangeControls.length > 0) {
        const savedTimeRange = localStorage.getItem("timeRange") || "10";
        window.currentTimeRange = parseInt(savedTimeRange);

        // 保存された値を選択
        timeRangeControls.forEach(radio => {
            if (radio.value === savedTimeRange) {
                radio.checked = true;
            }
            
            // 変更イベント
            radio.addEventListener("change", (e) => {
                const newValue = e.target.value;
                localStorage.setItem("timeRange", newValue);
                window.currentTimeRange = parseInt(newValue);
                
                // グラフの時間範囲を更新
                if (typeof window.onTimeRangeChange === "function") {
                    window.onTimeRangeChange(parseInt(newValue));
                }
            });
        });
    }
});