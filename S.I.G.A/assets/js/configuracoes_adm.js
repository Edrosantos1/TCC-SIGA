// =============================================
// configuracoes_adm.js — Configurações do Admin
// =============================================

// ========== VARIÁVEIS GLOBAIS ==========
let notificacoes = [];

// ========== FUNÇÕES AUXILIARES PARA NOTIFICAÇÕES ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatarData(data) {
    const d = new Date(data);
    const agora = new Date();
    const diff = Math.floor((agora - d) / 1000);
    
    if (diff < 60) return 'Agora pouco';
    if (diff < 3600) return Math.floor(diff / 60) + ' min atrás';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h atrás';
    if (diff < 172800) return 'Ontem';
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
}

function renderizarDropdownNotificacoes() {
    const lista = document.getElementById('notification-list-dropdown');
    if (!lista) return;

    if (!notificacoes || notificacoes.length === 0) {
        lista.innerHTML = `
            <div class="empty-notifications">
                <i class="far fa-bell-slash"></i>
                <p>Nenhuma notificação enviada</p>
            </div>
        `;
        return;
    }

    lista.innerHTML = notificacoes.slice(0, 10).map(notificacao => {
        const isPendencia = notificacao.tipo === 'pendencia';
        const corIcon = isPendencia ? '#e67e22' : '#0b4b9b';
        const icone = isPendencia ? 'fa-exclamation-triangle' : 'fa-info-circle';
        const label = isPendencia ? 'Pendência' : 'Aviso';
        
        const totalAlunos = parseInt(notificacao.total_alunos, 10) || 0;
        const textoAlunos = totalAlunos === 1 ? '1 aluno' : totalAlunos + ' alunos';
        
        return `
            <div class="notification-item">
                <div class="notification-icon" style="color: ${corIcon};">
                    <i class="fas ${icone}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-message">
                        <strong style="color: ${corIcon};">${label}</strong><br>
                        ${escapeHtml(notificacao.mensagem)}
                    </div>
                    <div class="notification-footer">
                        <span class="notification-date">${formatarData(notificacao.criado_em)}</span>
                        <span class="notification-destinatarios">
                            <i class="fas fa-users"></i> ${textoAlunos}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', function() {

    // ========== CARREGAR NOTIFICAÇÕES ==========
    if (typeof notificacoesData !== 'undefined') {
        notificacoes = notificacoesData;
        console.log(`🔔 ${notificacoes.length} notificações carregadas.`);
    }

    // ========== SELECIONAR OPÇÃO VISUALMENTE ==========
    const opcoes = document.querySelectorAll('.opcao-card');

    opcoes.forEach(opcao => {
        opcao.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                const nome = radio.name;
                const grupo = document.querySelectorAll(`input[name="${nome}"]`);
                grupo.forEach(input => {
                    input.checked = false;
                    input.closest('.opcao-card').classList.remove('active');
                });

                radio.checked = true;
                this.classList.add('active');
            }
        });
    });

    // ========== SIDEBAR COLLAPSE ==========
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('collapseBtn');

    if (sidebar && collapseBtn) {
        if (localStorage.getItem('adm_sidebarCollapsed') === 'true') {
            sidebar.classList.add('collapsed');
        }

        collapseBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('adm_sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
    }

    // ========== PERFIL DROPDOWN ==========
    const profileBtn = document.getElementById('admin-profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileBtn.classList.toggle('open');
            profileDropdown.classList.toggle('show');
        });

        document.addEventListener('click', function(e) {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileBtn.classList.remove('open');
                profileDropdown.classList.remove('show');
            }
        });
    }

    // ========== NOTIFICAÇÕES (SININHO) - SEM AJAX ==========
    const notifBtn = document.getElementById('notification-btn');
    const notifDropdown = document.getElementById('notification-dropdown');

    if (notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notifDropdown.classList.toggle('show');
            if (notifDropdown.classList.contains('show')) {
                renderizarDropdownNotificacoes();
            }
        });

        document.addEventListener('click', function(e) {
            if (!notifBtn.contains(e.target) && !notifDropdown.contains(e.target)) {
                notifDropdown.classList.remove('show');
            }
        });
    }

    // ========== RENDERIZAR NOTIFICAÇÕES AO CARREGAR ==========
    renderizarDropdownNotificacoes();

    // ========== AUTO FECHAR MENSAGENS FLASH ==========
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(msg => {
        setTimeout(() => {
            msg.style.opacity = '0';
            msg.style.transform = 'translateY(-10px)';
            msg.style.transition = 'all 0.4s ease';
            setTimeout(() => {
                if (msg.parentNode) {
                    msg.remove();
                }
            }, 400);
        }, 4000);
    });

    console.log('✅ Configurações do Administrador carregado!');
});