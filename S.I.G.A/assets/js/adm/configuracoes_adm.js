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
        const corIcon = isPendencia ? '#e67e22' : '#0035ff';
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

function inicializarBuscaAlunos() {
    const input = document.getElementById('search-input');
    const resultados = document.getElementById('search-results');
    if (!input || !resultados) return;

    const alunos = Array.isArray(window.alunosBuscaData) ? window.alunosBuscaData : [];

    function abrirDestino(aluno) {
        const temReservas = Number(aluno.tem_reservas) === 1 || aluno.tem_reservas === true;
        const temEmprestimos = Number(aluno.tem_emprestimos) === 1 || aluno.tem_emprestimos === true;
        if (temReservas && temEmprestimos) {
            window.location.href = `perfil_aluno.php?id=${encodeURIComponent(aluno.id_aluno)}`;
        } else if (temReservas) {
            window.location.href = `reservas_adm.php?aluno_id=${encodeURIComponent(aluno.id_aluno)}`;
        } else if (temEmprestimos) {
            window.location.href = `pendencias_adm.php?aluno_id=${encodeURIComponent(aluno.id_aluno)}`;
        } else {
            window.alert(`O aluno ${aluno.nome_aluno} não possui reservas ou empréstimos ativos.`);
        }
    }

    input.addEventListener('input', function() {
        const termo = input.value.trim().toLocaleLowerCase('pt-BR');
        resultados.replaceChildren();
        if (!termo) {
            resultados.style.display = 'none';
            return;
        }

        const encontrados = alunos
            .filter(aluno => aluno.nome_aluno && aluno.nome_aluno.toLocaleLowerCase('pt-BR').includes(termo))
            .slice(0, 8);

        if (encontrados.length === 0) {
            const vazio = document.createElement('div');
            vazio.className = 'search-empty';
            vazio.textContent = 'Nenhum aluno encontrado';
            resultados.appendChild(vazio);
            resultados.style.display = 'block';
            return;
        }

        encontrados.forEach(aluno => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.tabIndex = 0;
            item.setAttribute('role', 'button');

            const avatar = document.createElement('div');
            avatar.className = 'search-avatar';
            avatar.textContent = aluno.nome_aluno.trim().charAt(0).toLocaleUpperCase('pt-BR');

            const info = document.createElement('div');
            info.className = 'search-info';
            const nome = document.createElement('div');
            nome.className = 'search-name';
            nome.textContent = aluno.nome_aluno;
            const serie = document.createElement('div');
            serie.className = 'search-detail';
            serie.textContent = aluno.serie_aluno || 'Aluno';
            info.append(nome, serie);
            item.append(avatar, info);
            item.addEventListener('click', () => abrirDestino(aluno));
            item.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    abrirDestino(aluno);
                }
            });
            resultados.appendChild(item);
        });
        resultados.style.display = 'block';
    });

    document.addEventListener('click', event => {
        if (!input.contains(event.target) && !resultados.contains(event.target)) {
            resultados.style.display = 'none';
        }
    });
    input.addEventListener('keydown', event => {
        if (event.key === 'Escape') resultados.style.display = 'none';
    });
}

document.addEventListener('DOMContentLoaded', function() {
    inicializarBuscaAlunos();

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
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    });

    const formPreferencias = document.getElementById('formPreferencias');
    if (formPreferencias) {
        const avisoNaoSalvo = document.getElementById('avisoNaoSalvo');
        const btnRestaurar = document.getElementById('btnRestaurar');
        const preferenciaClasses = {
            tamanho_fonte: 'fonte-',
            daltonismo: 'daltonismo-',
            espacamento: 'espacamento-'
        };
        const padroes = {
            tamanho_fonte: 'medio',
            daltonismo: 'normal',
            espacamento: 'normal',
            reduzir_animacoes: false
        };
        function lerPreferencias() {
            const dados = {};
            Object.keys(preferenciaClasses).forEach(campo => {
                const radio = formPreferencias.querySelector(`input[name="${campo}"]:checked`);
                dados[campo] = radio ? radio.value : padroes[campo];
            });
            dados.reduzir_animacoes = formPreferencias.elements.reduzir_animacoes.checked;
            return dados;
        }

        function aplicarPreferencias(dados) {
            Object.entries(preferenciaClasses).forEach(([campo, prefixo]) => {
                [...document.body.classList]
                    .filter(classe => classe.startsWith(prefixo))
                    .forEach(classe => document.body.classList.remove(classe));
                document.body.classList.add(prefixo + dados[campo]);
            });
            document.body.classList.toggle('reduzir-animacoes', dados.reduzir_animacoes);
        }

        function sincronizarOpcoes() {
            opcoes.forEach(opcao => {
                const radio = opcao.querySelector('input[type="radio"]');
                if (radio) opcao.classList.toggle('active', radio.checked);
            });
        }

        const preferenciasIniciais = JSON.stringify(lerPreferencias());
        function atualizarPreferencias() {
            sincronizarOpcoes();
            const dados = lerPreferencias();
            aplicarPreferencias(dados);
            if (avisoNaoSalvo) {
                avisoNaoSalvo.hidden = JSON.stringify(dados) === preferenciasIniciais;
            }
        }

        formPreferencias.addEventListener('change', atualizarPreferencias);
        if (btnRestaurar) {
            btnRestaurar.addEventListener('click', function() {
                Object.entries(padroes).forEach(([campo, valor]) => {
                    if (campo === 'reduzir_animacoes') {
                        formPreferencias.elements.reduzir_animacoes.checked = valor;
                    } else {
                        const radio = formPreferencias.querySelector(`input[name="${campo}"][value="${valor}"]`);
                        if (radio) radio.checked = true;
                    }
                });
                atualizarPreferencias();
            });
        }

    }

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