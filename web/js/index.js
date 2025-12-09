document.addEventListener("DOMContentLoaded", () => {
    const statusEl = document.getElementById("login-status-footer");
    if (!statusEl) return;

    fetch("/api/session")
        .then((res) => {
            if (!res.ok) {
                // 未ログイン or エラー時は何も表示しない（/index自体はサーバー側で守ってる前提）
                return null;
            }
            return res.json();
        })
        .then((data) => {
            if (!data || !data.loggedIn) return;

            // roleに応じて表示文字を決める
            let roleLabel = "";
            if (data.role === "admin") {
                roleLabel = "admin（管理者）";
            } else if (data.role === "operator") {
                roleLabel = "operator（閲覧者）";
            } else {
                roleLabel = data.role;
            }

            statusEl.textContent = roleLabel + " がログイン中";
        })
        .catch((err) => {
            console.error("session取得エラー:", err);
        });
});