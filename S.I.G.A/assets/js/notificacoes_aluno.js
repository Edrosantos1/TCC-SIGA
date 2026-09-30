/* =============================================
   notificacoes_aluno.js
   Sistema de notificações do ALUNO
   Intercepta o clique na fase de CAPTURA
   para evitar conflito com dashboard_aluno.js
   ============================================= */

(function () {
  'use strict';

  // ========== AUXILIARES ==========
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
    return d.toLocaleDateString('pt-BR') + ' ' +
           d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  // ========== RENDER ==========
  function renderizarDropdownNotificacoes() {
    const lista = document.getElementById('notification-list-dropdown');
    if (!lista) return;

    const notificacoes = Array.isArray(window.notificacoesData) ? window.notificacoesData : [];

    if (notificacoes.length === 0) {
      lista.innerHTML = `
        <div class="empty-notifications">
          <i class="far fa-bell-slash"></i>
          <p>Nenhuma notificação por aqui</p>
        </div>`;
      return;
    }

    lista.innerHTML = notificacoes.slice(0, 10).map(n => {
      const isPendencia = n.tipo === 'pendencia';
      const corIcon = isPendencia ? '#e67e22' : '#0b4b9b';
      const icone = isPendencia ? 'fa-exclamation-triangle' : 'fa-info-circle';
      const label = isPendencia ? 'Pendência' : 'Aviso';

      return `
        <div class="notification-item">
          <div class="notification-icon" style="color: ${corIcon};">
            <i class="fas ${icone}"></i>
          </div>
          <div class="notification-content">
            <div class="notification-message">
              <strong style="color: ${corIcon};">${label}</strong><br>
              ${escapeHtml(n.mensagem)}
            </div>
            <div class="notification-footer">
              <span class="notification-date">${formatarData(n.criado_em)}</span>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  // ========== CLIQUE NO SININHO ==========
  // Fase de captura (true) + stopImmediatePropagation()
  // → garante que SOMENTE este handler controle o dropdown
  function handleBellClick(e) {
    const btn = e.target.closest('#notification-btn');
    if (!btn) return;

    const dropdown = document.getElementById('notification-dropdown');
    if (!dropdown) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const vaiAbrir = !dropdown.classList.contains('show');
    dropdown.classList.toggle('show', vaiAbrir);

    if (vaiAbrir) {
      renderizarDropdownNotificacoes();
    }
  }

  // ========== FECHA AO CLICAR FORA ==========
  function handleOutside(e) {
    const dropdown = document.getElementById('notification-dropdown');
    const btn = document.getElementById('notification-btn');
    if (!dropdown || !btn) return;
    if (!dropdown.classList.contains('show')) return;
    if (dropdown.contains(e.target) || btn.contains(e.target)) return;
    dropdown.classList.remove('show');
  }

  // ========== FECHA COM ESC ==========
  function handleEsc(e) {
    if (e.key !== 'Escape') return;
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) dropdown.classList.remove('show');
  }

  // ========== INIT ==========
  function init() {
    document.addEventListener('click', handleBellClick, true);  // capture
    document.addEventListener('click', handleOutside, false);
    document.addEventListener('keydown', handleEsc, false);

    renderizarDropdownNotificacoes();
    console.log('🔔 notificacoes_aluno.js carregado');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();