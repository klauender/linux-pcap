document.addEventListener("DOMContentLoaded", () => {
    // テーマ設定を適用
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    document.body.classList.toggle("dark-theme", shouldUseDarkTheme);

    // エラーメッセージの処理
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    const errorBox = document.getElementById("error-message");
    if (!errorBox) return;

    if (error === "1") {
        errorBox.textContent = "権限またはパスワードが違います";
    } else {
        // 念のため、エラーがないときは空にしておく
        errorBox.textContent = "";
    }
});
