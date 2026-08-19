// =============================================
// catalogo_adm.js — Interações do catálogo
// =============================================

// ========== VARIÁVEIS GLOBAIS ==========
let notificacoes = [];

// ========== FUNÇÕES AUXILIARES ==========
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

// ========== RENDERIZAR DROPDOWN DE NOTIFICAÇÕES ==========
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

// ========== ABRIR MODAL (novo/edição) ==========
function abrirModalEdicao(id = 0) {
    const overlay = document.getElementById('modal-overlay');
    const form = document.getElementById('modal-form');
    const title = document.getElementById('modal-title');

    if (id === 0) {
        title.innerHTML = '<i class="fas fa-plus-circle"></i> Novo Item';
        document.getElementById('edit_id').value = 0;
        form.reset();
        document.getElementById('titulo').value = '';
        document.getElementById('autor').value = '';
        document.getElementById('tipo').value = 'livro';
        document.getElementById('editora').value = '';
        document.getElementById('ano_publicacao').value = '';
        document.getElementById('isbn').value = '';
        document.getElementById('quantidade').value = 1;
        document.getElementById('localizacao').value = '';
        document.getElementById('capa_url').value = '';
        document.getElementById('descricao').value = '';
    } else {
        window.location.href = `catalogo_adm.php?action=edit&id=${id}`;
        return;
    }

    overlay.style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

function excluirItem(id, titulo) {
    if (confirm(`Tem certeza que deseja excluir o item "${titulo}"?`)) {
        window.location.href = `catalogo_adm.php?action=delete&id=${id}`;
    }
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    // Carregar notificações
    if (typeof notificacoesData !== 'undefined') {
        notificacoes = notificacoesData;
    }

    // Botão Novo Item
    const btnNovo = document.getElementById('btn-novo-item');
    if (btnNovo) {
        btnNovo.addEventListener('click', () => abrirModalEdicao(0));
    }

    // Fechar modal
    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('modal-cancel');
    const overlay = document.getElementById('modal-overlay');
    if (closeBtn) closeBtn.addEventListener('click', fecharModal);
    if (cancelBtn) cancelBtn.addEventListener('click', fecharModal);
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) fecharModal();
        });
    }

    // NOTIFICAÇÕES (SININHO)
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
});