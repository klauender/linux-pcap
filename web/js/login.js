document.addEventListener("DOMContentLoaded", () => {
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
