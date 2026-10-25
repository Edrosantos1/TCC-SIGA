/* =============================================
   notificacoes_user.js
   Sistema de notificações do ALUNO
   Sininho do topo: lista, abrir/fechar e idioma.
   Os textos vêm de dashboardTranslations (painel_user.js).
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

  function idiomaAtual() {
    return typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'pt';
  }

  function traduzir(chave) {
    const dicionarios = typeof dashboardTranslations !== 'undefined' ? dashboardTranslations : {};
    const dic = dicionarios[idiomaAtual()] || dicionarios.pt || {};
    return dic[chave] || '';
  }

  function formatarData(data) {
    const d = new Date(data);
    const diff = Math.floor((new Date() - d) / 1000);

    if (diff < 60) return traduzir('time_now');
    if (diff < 3600) return Math.floor(diff / 60) + ' ' + traduzir('time_min');
    if (diff < 86400) return Math.floor(diff / 3600) + traduzir('time_hour');
    if (diff < 172800) return traduzir('time_yesterday');

    const local = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }[idiomaAtual()] || 'pt-BR';
    return d.toLocaleDateString(local) + ' ' +
           d.toLocaleTimeString(local, { hour: '2-digit', minute: '2-digit' });
  }

  // ========== RENDER ==========
  function renderizarDropdownNotificacoes() {
    const lista = document.getElementById('notification-list-dropdown');
    if (!lista) return;

    const notificacoes = Array.isArray(window.notificacoesData) ? window.notificacoesData : [];
    const formLer = document.getElementById('mark-read-form');
    if (formLer) formLer.hidden = !notificacoes.some(n => !Number(n.lida));

    if (notificacoes.length === 0) {
      lista.innerHTML = `
        <div class="empty-notifications">
          <i class="far fa-bell-slash"></i>
          <p>${traduzir('notif_empty')}</p>
        </div>`;
      return;
    }

    lista.innerHTML = notificacoes.slice(0, 10).map(n => {
      const isPendencia = n.tipo === 'pendencia';
      const corIcon = isPendencia ? '#e67e22' : '#0b4b9b';
      const icone = isPendencia ? 'fa-exclamation-triangle' : 'fa-info-circle';
      const label = isPendencia ? traduzir('notif_pendency') : traduzir('notif_notice');

      return `
        <div class="notification-item${Number(n.lida) ? ' is-read' : ''}">
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

    // Troca de idioma: redesenha a lista com os textos novos
    document.addEventListener('siga:idioma', renderizarDropdownNotificacoes);
    renderizarDropdownNotificacoes();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();