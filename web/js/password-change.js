document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("password-modal");
    const openBtn = document.getElementById("change-password-btn");
    const closeBtn = document.querySelector(".password-modal-close");
    const cancelBtn = document.querySelector(".cancel-btn");
    const form = document.getElementById("password-change-form");
    const errorMsg = document.getElementById("password-error");
    const successMsg = document.getElementById("password-success");

    // モーダルを開く
    if (openBtn) {
        openBtn.addEventListener("click", () => {
            modal.classList.add("show");
            // フォームをリセット
            form.reset();
            errorMsg.textContent = "";
            successMsg.textContent = "";
        });
    }

    // モーダルを閉じる
    const closeModal = () => {
        modal.classList.remove("show");
        form.reset();
        errorMsg.textContent = "";
        successMsg.textContent = "";
    };

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", closeModal);
    }

    // モーダル外をクリックで閉じる
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // フォーム送信処理
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            errorMsg.textContent = "";
            successMsg.textContent = "";

            const oldPassword = document.getElementById("old-password").value;
            const newPassword = document.getElementById("new-password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            // バリデーション
            if (!oldPassword || !newPassword || !confirmPassword) {
                errorMsg.textContent = "すべてのフィールドを入力してください";
                return;
            }

            if (newPassword !== confirmPassword) {
                errorMsg.textContent = "新しいパスワードと確認用パスワードが一致しません";
                return;
            }

            if (oldPassword === newPassword) {
                errorMsg.textContent = "新しいパスワードは現在のパスワードと異なる必要があります";
                return;
            }

            // APIリクエスト
            try {
                const response = await fetch("/api/change-password", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        oldPassword: oldPassword,
                        newPassword: newPassword,
                    }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    successMsg.textContent = data.message || "パスワードが正常に変更されました";
                    // 3秒後にモーダルを閉じる
                    setTimeout(() => {
                        closeModal();
                    }, 2000);
                } else {
                    errorMsg.textContent = data.error || "パスワードの変更に失敗しました";
                }
            } catch (err) {
                console.error("パスワード変更エラー:", err);
                errorMsg.textContent = "エラーが発生しました。もう一度お試しください";
            }
        });
    }
});

