// 多言語対応（i18n）

const translations = {
    ja: {
        // サイドバー
        dashboard: "ダッシュボード",
        packets: "パケット",
        flows: "フロー",
        realtime: "リアルタイム",
        security: "セキュリティ",
        network: "ネットワーク",
        settings: "設定",
        logout: "ログアウト",
        darkMode: "Dark Mode",
        
        // ダッシュボード
        totalInbound: "総受信データ",
        totalOutbound: "総送信データ",
        totalFlows: "総フロー数",
        totalPackets: "総パケット数",
        captureStatus: "キャプチャ状態",
        lastUpdate: "最終更新",
        trafficByDirection: "方向別トラフィック",
        trafficByProtocol: "プロトコル別トラフィック",
        quickLinks: "クイックアクセス",
        realtimeMonitoring: "リアルタイム監視",
        flowAnalysis: "フロー分析",
        packetList: "パケット一覧",
        securityAlerts: "セキュリティ",
        
        // ログインページ
        login: "ログイン",
        role: "権限",
        password: "パスワード",
        passwordPlaceholder: "パスワードを入力",
        
        // 設定ページ
        settingsTitle: "設定",
        settingsSubtitle: "アカウントとセキュリティの設定",
        changePassword: "パスワード変更",
        language: "言語",
        languageSettings: "言語設定",
        
        // パスワード変更モーダル
        passwordChangeTitle: "パスワード変更",
        targetRole: "変更する権限",
        currentPassword: "現在のパスワード",
        newPassword: "新しいパスワード",
        confirmPassword: "新しいパスワード（確認）",
        change: "変更",
        cancel: "キャンセル",
        
        // グラフタイトル
        top10Flows: "Top 10 フロー",
        direction: "通信方向",
        protocol: "プロトコル",
        tcpFlags: "TCPフラグ",
        realtimeTraffic: "リアルタイム",
        
        // その他
        displayPeriod: "表示期間",
    },
    en: {
        // サイドバー
        dashboard: "Dashboard",
        packets: "Packets",
        flows: "Flows",
        realtime: "Realtime",
        security: "Security",
        network: "Network",
        settings: "Settings",
        logout: "Logout",
        darkMode: "Dark Mode",
        
        // ダッシュボード
        totalInbound: "Total Inbound",
        totalOutbound: "Total Outbound",
        totalFlows: "Total Flows",
        totalPackets: "Total Packets",
        captureStatus: "Capture Status",
        lastUpdate: "Last Update",
        trafficByDirection: "Traffic by Direction",
        trafficByProtocol: "Traffic by Protocol",
        quickLinks: "Quick Access",
        realtimeMonitoring: "Realtime Monitoring",
        flowAnalysis: "Flow Analysis",
        packetList: "Packet List",
        securityAlerts: "Security",
        
        // ログインページ
        login: "Login",
        role: "Role",
        password: "Password",
        passwordPlaceholder: "Enter password",
        
        // 設定ページ
        settingsTitle: "Settings",
        settingsSubtitle: "Account and Security Settings",
        changePassword: "Change Password",
        language: "Language",
        languageSettings: "Language Settings",
        
        // パスワード変更モーダル
        passwordChangeTitle: "Change Password",
        targetRole: "Target Role",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmPassword: "Confirm New Password",
        change: "Change",
        cancel: "Cancel",
        
        // グラフタイトル
        top10Flows: "Top 10 Flows",
        direction: "Direction",
        protocol: "Protocol",
        tcpFlags: "TCP Flags",
        realtimeTraffic: "Realtime",
        
        // その他
        displayPeriod: "Display Period",
    },
    fr: {
        // サイドバー
        dashboard: "Tableau de bord",
        packets: "Paquets",
        flows: "Flux",
        realtime: "Temps réel",
        security: "Sécurité",
        network: "Réseau",
        settings: "Paramètres",
        logout: "Déconnexion",
        darkMode: "Mode sombre",
        
        // ダッシュボード
        totalInbound: "Données entrantes",
        totalOutbound: "Données sortantes",
        totalFlows: "Total des flux",
        totalPackets: "Total des paquets",
        captureStatus: "État de capture",
        lastUpdate: "Dernière MAJ",
        trafficByDirection: "Trafic par direction",
        trafficByProtocol: "Trafic par protocole",
        quickLinks: "Accès rapide",
        realtimeMonitoring: "Surveillance temps réel",
        flowAnalysis: "Analyse des flux",
        packetList: "Liste des paquets",
        securityAlerts: "Sécurité",
        
        // ログインページ
        login: "Connexion",
        role: "Rôle",
        password: "Mot de passe",
        passwordPlaceholder: "Entrer le mot de passe",
        
        // 設定ページ
        settingsTitle: "Paramètres",
        settingsSubtitle: "Paramètres du compte et de la sécurité",
        changePassword: "Changer le mot de passe",
        language: "Langue",
        languageSettings: "Paramètres de langue",
        
        // パスワード変更モーダル
        passwordChangeTitle: "Changer le mot de passe",
        targetRole: "Rôle cible",
        currentPassword: "Mot de passe actuel",
        newPassword: "Nouveau mot de passe",
        confirmPassword: "Confirmer le nouveau mot de passe",
        change: "Changer",
        cancel: "Annuler",
        
        // グラフタイトル
        top10Flows: "Top 10 Flux",
        direction: "Direction",
        protocol: "Protocole",
        tcpFlags: "Drapeaux TCP",
        realtimeTraffic: "Temps réel",
        
        // その他
        displayPeriod: "Période d'affichage",
    },
    zh: {
        // サイドバー
        dashboard: "仪表板",
        packets: "数据包",
        flows: "流量",
        realtime: "实时",
        security: "安全",
        network: "网络",
        settings: "设置",
        logout: "退出登录",
        darkMode: "深色模式",
        
        // ダッシュボード
        totalInbound: "入站总数据",
        totalOutbound: "出站总数据",
        totalFlows: "总流量数",
        totalPackets: "总数据包数",
        captureStatus: "捕获状态",
        lastUpdate: "最后更新",
        trafficByDirection: "按方向流量",
        trafficByProtocol: "按协议流量",
        quickLinks: "快速访问",
        realtimeMonitoring: "实时监控",
        flowAnalysis: "流量分析",
        packetList: "数据包列表",
        securityAlerts: "安全",
        
        // ログインページ
        login: "登录",
        role: "角色",
        password: "密码",
        passwordPlaceholder: "输入密码",
        
        // 設定ページ
        settingsTitle: "设置",
        settingsSubtitle: "账户和安全设置",
        changePassword: "修改密码",
        language: "语言",
        languageSettings: "语言设置",
        
        // パスワード変更モーダル
        passwordChangeTitle: "修改密码",
        targetRole: "目标角色",
        currentPassword: "当前密码",
        newPassword: "新密码",
        confirmPassword: "确认新密码",
        change: "修改",
        cancel: "取消",
        
        // グラフタイトル
        top10Flows: "Top 10 流量",
        direction: "方向",
        protocol: "协议",
        tcpFlags: "TCP标志",
        realtimeTraffic: "实时",
        
        // その他
        displayPeriod: "显示周期",
    },
    ko: {
        // サイドバー
        dashboard: "대시보드",
        packets: "패킷",
        flows: "플로우",
        realtime: "실시간",
        security: "보안",
        network: "네트워크",
        settings: "설정",
        logout: "로그아웃",
        darkMode: "다크 모드",
        
        // ダッシュボード
        totalInbound: "총 수신 데이터",
        totalOutbound: "총 송신 데이터",
        totalFlows: "총 플로우 수",
        totalPackets: "총 패킷 수",
        captureStatus: "캡처 상태",
        lastUpdate: "마지막 업데이트",
        trafficByDirection: "방향별 트래픽",
        trafficByProtocol: "프로토콜별 트래픽",
        quickLinks: "빠른 액세스",
        realtimeMonitoring: "실시간 모니터링",
        flowAnalysis: "플로우 분석",
        packetList: "패킷 목록",
        securityAlerts: "보안",
        
        // ログインページ
        login: "로그인",
        role: "역할",
        password: "비밀번호",
        passwordPlaceholder: "비밀번호 입력",
        
        // 設定ページ
        settingsTitle: "설정",
        settingsSubtitle: "계정 및 보안 설정",
        changePassword: "비밀번호 변경",
        language: "언어",
        languageSettings: "언어 설정",
        
        // パスワード変更モーダル
        passwordChangeTitle: "비밀번호 변경",
        targetRole: "대상 역할",
        currentPassword: "현재 비밀번호",
        newPassword: "새 비밀번호",
        confirmPassword: "새 비밀번호 확인",
        change: "변경",
        cancel: "취소",
        
        // グラフタイトル
        top10Flows: "Top 10 플로우",
        direction: "방향",
        protocol: "프로토콜",
        tcpFlags: "TCP 플래그",
        realtimeTraffic: "실시간",
        
        // その他
        displayPeriod: "표시 기간",
    },
    tr: {
        // サイドバー
        dashboard: "Gösterge Paneli",
        packets: "Paketler",
        flows: "Akışlar",
        realtime: "Gerçek Zamanlı",
        security: "Güvenlik",
        network: "Ağ",
        settings: "Ayarlar",
        logout: "Çıkış",
        darkMode: "Karanlık Mod",
        
        // ダッシュボード
        totalInbound: "Toplam Gelen Veri",
        totalOutbound: "Toplam Giden Veri",
        totalFlows: "Toplam Akış",
        totalPackets: "Toplam Paket",
        captureStatus: "Yakalama Durumu",
        lastUpdate: "Son Güncelleme",
        trafficByDirection: "Yöne Göre Trafik",
        trafficByProtocol: "Protokole Göre Trafik",
        quickLinks: "Hızlı Erişim",
        realtimeMonitoring: "Gerçek Zamanlı İzleme",
        flowAnalysis: "Akış Analizi",
        packetList: "Paket Listesi",
        securityAlerts: "Güvenlik",
        
        // ログインページ
        login: "Giriş",
        role: "Rol",
        password: "Şifre",
        passwordPlaceholder: "Şifre girin",
        
        // 設定ページ
        settingsTitle: "Ayarlar",
        settingsSubtitle: "Hesap ve Güvenlik Ayarları",
        changePassword: "Şifre Değiştir",
        language: "Dil",
        languageSettings: "Dil Ayarları",
        
        // パスワード変更モーダル
        passwordChangeTitle: "Şifre Değiştir",
        targetRole: "Hedef Rol",
        currentPassword: "Mevcut Şifre",
        newPassword: "Yeni Şifre",
        confirmPassword: "Yeni Şifreyi Onayla",
        change: "Değiştir",
        cancel: "İptal",
        
        // グラフタイトル
        top10Flows: "Top 10 Akış",
        direction: "Yön",
        protocol: "Protokol",
        tcpFlags: "TCP Bayrakları",
        realtimeTraffic: "Gerçek Zamanlı",
        
        // その他
        displayPeriod: "Görüntüleme Süresi",
    },
    my: {
        // サイドバー
        dashboard: "ဒက်ရှ်ဘုတ်",
        packets: "ပက်ကတ်များ",
        flows: "စီးဆင်းမှုများ",
        realtime: "အချိန်နှင့်တပြေးညီ",
        security: "လုံခြုံရေး",
        network: "ကွန်ယက်",
        settings: "ဆက်တင်များ",
        logout: "ထွက်မည်",
        darkMode: "အမှောင်မုဒ်",
        
        // ダッシュボード
        totalInbound: "စုစုပေါင်း အဝင်ဒေတာ",
        totalOutbound: "စုစုပေါင်း အထွက်ဒေတာ",
        totalFlows: "စုစုပေါင်း စီးဆင်းမှု",
        totalPackets: "စုစုပေါင်း ပက်ကတ်",
        captureStatus: "ဖမ်းယူမှု အခြေအနေ",
        lastUpdate: "နောက်ဆုံး အပ်ဒိတ်",
        trafficByDirection: "ဦးတည်ချက်အလိုက် အသွားအလာ",
        trafficByProtocol: "ပရိုတိုကောအလိုက် အသွားအလာ",
        quickLinks: "အမြန်ဝင်ရောက်",
        realtimeMonitoring: "အချိန်နှင့်တပြေးညီ စောင့်ကြည့်ခြင်း",
        flowAnalysis: "စီးဆင်းမှု ခွဲခြမ်းစိတ်ဖြာ",
        packetList: "ပက်ကတ် စာရင်း",
        securityAlerts: "လုံခြုံရေး",
        
        // ログインページ
        login: "ဝင်ရောက်ရန်",
        role: "အခန်းကဏ္ဍ",
        password: "စကားဝှက်",
        passwordPlaceholder: "စကားဝှက် ထည့်ပါ",
        
        // 設定ページ
        settingsTitle: "ဆက်တင်များ",
        settingsSubtitle: "အကောင့်နှင့် လုံခြုံရေး ဆက်တင်များ",
        changePassword: "စကားဝှက် ပြောင်းရန်",
        language: "ဘာသာစကား",
        languageSettings: "ဘာသာစကား ဆက်တင်များ",
        
        // パスワード変更モーダル
        passwordChangeTitle: "စကားဝှက် ပြောင်းရန်",
        targetRole: "ပစ်မှတ် အခန်းကဏ္ဍ",
        currentPassword: "လက်ရှိ စကားဝှက်",
        newPassword: "စကားဝှက် အသစ်",
        confirmPassword: "စကားဝှက် အသစ် အတည်ပြုရန်",
        change: "ပြောင်းရန်",
        cancel: "ပယ်ဖျက်ရန်",
        
        // グラフタイトル
        top10Flows: "ထိပ်တန်း ၁၀",
        direction: "ဦးတည်ရာ",
        protocol: "ပရိုတိုကော",
        tcpFlags: "TCP အလံများ",
        realtimeTraffic: "အချိန်နှင့်တပြေးညီ",
        
        // その他
        displayPeriod: "ပြသရန် ကာလ",
    }
};

const languageNames = {
    ja: "日本語",
    en: "English",
    fr: "Français",
    zh: "中文",
    ko: "한국어",
    tr: "Türkçe",
    my: "မြန်မာဘာသာ"
};

// 現在の言語を取得
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'ja';
}

// 言語を設定
function setLanguage(lang) {
    localStorage.setItem('language', lang);
    applyTranslations();
    updateLanguageOptions();
    updateCurrentLanguageDisplay();
}

// 翻訳を適用
function applyTranslations() {
    const lang = getCurrentLanguage();
    const t = translations[lang];
    
    // data-i18n属性を持つ要素を翻訳
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });
    
    // data-i18n-placeholder属性を持つ要素を翻訳
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) {
            el.placeholder = t[key];
        }
    });
}

// 言語オプションの状態を更新
function updateLanguageOptions() {
    const lang = getCurrentLanguage();
    document.querySelectorAll('.language-option').forEach(option => {
        if (option.getAttribute('data-lang') === lang) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

// 現在の言語表示を更新
function updateCurrentLanguageDisplay() {
    const lang = getCurrentLanguage();
    const display = document.getElementById('current-language-display');
    if (display) {
        display.textContent = languageNames[lang] || lang;
    }
}

// 言語モーダルを開く
function openLanguageModal() {
    const modal = document.getElementById('language-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// 言語モーダルを閉じる
function closeLanguageModal() {
    const modal = document.getElementById('language-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // 言語設定ボタンのイベントリスナー
    const languageBtn = document.getElementById('language-settings-btn');
    if (languageBtn) {
        languageBtn.addEventListener('click', openLanguageModal);
    }
    
    // 言語モーダル閉じるボタン
    const closeBtn = document.getElementById('language-modal-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLanguageModal);
    }
    
    // 言語モーダル背景クリックで閉じる
    const modal = document.getElementById('language-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeLanguageModal();
            }
        });
    }
    
    // 言語オプションのイベントリスナー
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.getAttribute('data-lang');
            setLanguage(lang);
            closeLanguageModal();
        });
    });
    
    // 初期状態を適用
    applyTranslations();
    updateLanguageOptions();
    updateCurrentLanguageDisplay();
});

