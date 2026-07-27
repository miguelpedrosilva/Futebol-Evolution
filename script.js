/* ==========================================================================
   FUTEBOL EVOLUTION - SCRIPT COMPLETO E ATUALIZADO
   ========================================================================== */

// 1. CONFIGURAÇÃO GRATUITA DO FIREBASE (NUVEM COMPATÍVEL)
const firebaseConfig = {
    apiKey: "AIzaSy_SUA_CHAVE_GRATUITA_AQUI",
    authDomain: "futebol-evolution.firebaseapp.com",
    projectId: "futebol-evolution",
    storageBucket: "futebol-evolution.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};

// Inicializa Firebase se configurado, senão usa localStorage
let firebaseEnabled = false;
try {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
        firebase.initializeApp(firebaseConfig);
        firebaseEnabled = true;
    }
} catch (e) {
    console.log("Firebase rodando em modo fallback (localStorage).");
}

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------------------
    // ESTADO GLOBAL & LOCALSTORAGE
    // ----------------------------------------------------------------------
    let db = {
        users: JSON.parse(localStorage.getItem('fe_users')) || [],
        config: JSON.parse(localStorage.getItem('fe_config')) || {
            resetBtnEnabled: false,
            craqueDaSemanaId: null,
            globalAnnouncement: "Bem-vindo ao Futebol Evolution!"
        },
        privateMessages: JSON.parse(localStorage.getItem('fe_private_msg')) || {}
    };

    let currentUser = JSON.parse(localStorage.getItem('fe_current_user')) || null;
    let radarChartInstance = null;

    function saveData() {
        localStorage.setItem('fe_users', JSON.stringify(db.users));
        localStorage.setItem('fe_config', JSON.stringify(db.config));
        localStorage.setItem('fe_private_msg', JSON.stringify(db.privateMessages));
        if (currentUser) {
            localStorage.setItem('fe_current_user', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('fe_current_user');
        }
    }

    function showNotification(msg) {
        const banner = document.getElementById('notification-banner');
        banner.textContent = msg;
        banner.className = 'notification-banner bg-primary';
        banner.classList.remove('hidden');
        setTimeout(() => banner.classList.add('hidden'), 3500);
    }

    function calculateAge(dobString) {
        if (!dobString || dobString.length !== 10) return 15;
        const [day, month, year] = dobString.split('/').map(Number);
        const today = new Date();
        let age = today.getFullYear() - year;
        const m = today.getMonth() + 1 - month;
        if (m < 0 || (m === 0 && today.getDate() < day)) age--;
        return age > 0 ? age : 15;
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // ----------------------------------------------------------------------
    // 2. RADAR CHART (CHART.JS) - HABILIDADES DO JOGADOR
    // ----------------------------------------------------------------------
    function renderRadarChart(stats) {
        const ctx = document.getElementById('radarChartCanvas').getContext('2d');

        if (radarChartInstance) {
            radarChartInstance.destroy();
        }

        radarChartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['PAS', 'RIT', 'FIN', 'DRI', 'DEF', 'FIS'],
                datasets: [{
                    label: 'Atributos',
                    data: [stats.PAS, stats.RIT, stats.FIN, stats.DRI, stats.DEF, stats.FIS],
                    backgroundColor: 'rgba(245, 158, 11, 0.25)',
                    borderColor: '#f59e0b',
                    pointBackgroundColor: '#f59e0b',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' },
                        pointLabels: { color: '#f8fafc', font: { size: 12, weight: 'bold' } },
                        ticks: { display: false },
                        suggestedMin: 40,
                        suggestedMax: 100
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // ----------------------------------------------------------------------
    // 3. GERADOR REAL DE PDF SCOUT (HTML2PDF.JS)
    // ----------------------------------------------------------------------
    document.getElementById('btn-download-scout-pdf').addEventListener('click', () => {
        if (!currentUser || !currentUser.pdfUnlocked) return;

        // Preencher dados no template do PDF
        document.getElementById('pdf-player-name').textContent = currentUser.name.toUpperCase();
        document.getElementById('pdf-player-age').textContent = `${currentUser.age} anos`;
        document.getElementById('pdf-player-pos').textContent = currentUser.position;
        document.getElementById('pdf-player-ovr').textContent = currentUser.overall || 70;

        const stats = currentUser.stats || { PAS: 70, RIT: 70, FIN: 70, DRI: 70, DEF: 70, FIS: 70 };
        document.getElementById('pdf-stat-pas').textContent = stats.PAS;
        document.getElementById('pdf-stat-rit').textContent = stats.RIT;
        document.getElementById('pdf-stat-fin').textContent = stats.FIN;
        document.getElementById('pdf-stat-dri').textContent = stats.DRI;
        document.getElementById('pdf-stat-def').textContent = stats.DEF;
        document.getElementById('pdf-stat-fis').textContent = stats.FIS;

        const pdfElement = document.getElementById('pdf-scout-template');
        pdfElement.classList.remove('hidden');

        const opt = {
            margin:       10,
            filename:     `Scout_Oficial_${currentUser.name.replace(/\s+/g, '_')}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(pdfElement).save().then(() => {
            pdfElement.classList.add('hidden');
            showNotification("Relatório Scout em PDF gerado e baixado!");
        });
    });

    // ----------------------------------------------------------------------
    // 4. AUTENTICAÇÃO E RENDERIZAÇÃO
    // ----------------------------------------------------------------------
    const modalAuth = document.getElementById('modal-athlete-auth');
    const modalAdminLogin = document.getElementById('modal-admin-login');

    document.getElementById('btn-login-modal').addEventListener('click', () => modalAuth.classList.remove('hidden'));
    document.getElementById('btn-admin-modal').addEventListener('click', () => modalAdminLogin.classList.remove('hidden'));
    document.getElementById('btn-logout').addEventListener('click', () => {
        currentUser = null;
        saveData();
        renderApp();
    });

    document.querySelectorAll('.modal-close-btn').forEach(b => {
        b.addEventListener('click', () => document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden')));
    });

    // Login Admin Miguel Prime (Senha 3020)
    document.getElementById('form-admin-login').addEventListener('submit', (e) => {
        e.preventDefault();
        if (document.getElementById('admin-input-password').value === '3020') {
            currentUser = { role: 'admin', name: 'Miguel Prime' };
            saveData();
            modalAdminLogin.classList.add('hidden');
            renderApp();
        } else {
            alert("Senha incorreta!");
        }
    });

    function renderApp() {
        const welcomeSec = document.getElementById('welcome-section');
        const portalSec = document.getElementById('athlete-portal');
        const adminSec = document.getElementById('admin-panel');

        welcomeSec.classList.add('hidden');
        portalSec.classList.add('hidden');
        adminSec.classList.add('hidden');

        if (!currentUser) {
            welcomeSec.classList.remove('hidden');
        } else if (currentUser.role === 'admin') {
            adminSec.classList.remove('hidden');
        } else {
            portalSec.classList.remove('hidden');
            renderAthletePortal();
        }
    }

    function renderAthletePortal() {
        const stats = currentUser.stats || { PAS: 70, RIT: 70, FIN: 70, DRI: 70, DEF: 70, FIS: 70 };
        document.getElementById('card-overall-value').textContent = currentUser.overall || 70;
        document.getElementById('card-player-name').textContent = currentUser.name.toUpperCase();
        document.getElementById('card-player-photo').src = currentUser.photo || 'https://via.placeholder.com/150';

        // Atualizar Canvas e Radar Chart
        renderRadarChart(stats);

        // Status PDF
        const btnPdf = document.getElementById('btn-download-scout-pdf');
        if (currentUser.pdfUnlocked) {
            btnPdf.disabled = false;
            btnPdf.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Baixar Relatório Scout PDF';
        }
    }

    renderApp();
});