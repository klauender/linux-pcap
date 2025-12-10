document.addEventListener("DOMContentLoaded", () => {
    const passwordModal = document.getElementById("password-modal");
    const changePasswordBtn = document.getElementById("change-password-btn");
    const passwordCloseBtn = document.getElementById("password-modal-close-btn");
    const passwordCancelBtn = document.getElementById("password-cancel-btn");
    const form = document.getElementById("password-change-form");
    const errorMsg = document.getElementById("password-error");
    const successMsg = document.getElementById("password-success");

    if (!passwordModal) return;

    // パスワード変更モーダルを開く関数
    const openPasswordModal = () => {
        passwordModal.classList.add("show");
        // フォームをリセット
        if (form) {
            form.reset();
        }
        if (errorMsg) {
            errorMsg.textContent = "";
        }
        if (successMsg) {
            successMsg.textContent = "";
        }
    };

    // パスワード変更モーダルを閉じる関数
    const closePasswordModal = () => {
        passwordModal.classList.remove("show");
        if (form) {
            form.reset();
        }
        if (errorMsg) {
            errorMsg.textContent = "";
        }
        if (successMsg) {
            successMsg.textContent = "";
        }
    };

    // パスワード変更ボタンでパスワード変更モーダルを開く
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener("click", openPasswordModal);
    }

    // パスワード変更モーダルを閉じる
    if (passwordCloseBtn) {
        passwordCloseBtn.addEventListener("click", closePasswordModal);
    }

    if (passwordCancelBtn) {
        passwordCancelBtn.addEventListener("click", closePasswordModal);
    }

    // モーダル外をクリックで閉じる
    passwordModal.addEventListener("click", (e) => {
        if (e.target === passwordModal) {
            closePasswordModal();
        }
    });

    // フォーム送信処理
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            errorMsg.textContent = "";
            successMsg.textContent = "";

            const targetRole = document.getElementById("target-role").value;
            const oldPassword = document.getElementById("old-password").value;
            const newPassword = document.getElementById("new-password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            // バリデーション
            if (!targetRole || !oldPassword || !newPassword || !confirmPassword) {
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
                        targetRole: targetRole,
                        oldPassword: oldPassword,
                        newPassword: newPassword,
                    }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    if (successMsg) {
                        successMsg.textContent = data.message || "パスワードが正常に変更されました";
                    }
                    // フォームをリセット
                    if (form) {
                        form.reset();
                    }
                } else {
                    if (errorMsg) {
                        errorMsg.textContent = data.error || "パスワードの変更に失敗しました";
                    }
                }
            } catch (err) {
                console.error("パスワード変更エラー:", err);
                errorMsg.textContent = "エラーが発生しました。もう一度お試しください";
            }
        });
    }
});

