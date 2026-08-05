// ========== MODAL NOVA RESERVA (COM BUSCA LOCAL) ==========
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Verifica se os elementos existem
        const modal = document.getElementById('modalReserva');
        const btnAbrir = document.getElementById('btn-nova-reserva');
        const btnFechar = document.getElementById('modalCloseBtn');
        const btnCancelar = document.getElementById('modalCancelBtn');
        const btnSalvar = document.getElementById('modalSaveBtn');
        const formReserva = document.getElementById('formNovaReserva');
        
        // Verificação crítica
        if (!modal || !btnAbrir || !btnFechar || !btnCancelar || !btnSalvar || !formReserva) {
            console.error('❌ Elementos do modal não encontrados!');
            return;
        }
        
        // Elementos da busca
        const buscaAlunoInput = document.getElementById('buscaAluno');
        const suggestions = document.getElementById('alunoSuggestions');
        const alunoSelecionado = document.getElementById('alunoSelecionado');
        const alunoNome = document.getElementById('alunoNomeSelecionado');
        const alunoMatricula = document.getElementById('alunoMatriculaSelecionada');
        const alunoAvatar = document.getElementById('alunoAvatar');
        const idAlunoSelecionado = document.getElementById('idAlunoSelecionado');
        const removerAluno = document.getElementById('removerAluno');
        
        // Dados dos alunos (injetados pelo PHP)
        const todosAlunos = typeof alunosData !== 'undefined' ? alunosData : [];
        console.log('📚 Total de alunos carregados:', todosAlunos.length);
        console.log('📋 Primeiro aluno:', todosAlunos[0]); // Verificar estrutura
        
        let alunoSelecionadoId = null;
        
        // ========== SISTEMA DE TOAST ==========
        function showToast(mensagem, tipo = 'info') {
            try {
                // Remove toasts antigos
                const oldToasts = document.querySelectorAll('.toast-custom');
                oldToasts.forEach(t => t.remove());
                
                const container = document.querySelector('.toast-container') || (() => {
                    const c = document.createElement('div');
                    c.className = 'toast-container';
                    document.body.appendChild(c);
                    return c;
                })();

                const toast = document.createElement('div');
                toast.className = `toast-custom toast-${tipo}`;
                
                const icons = {
                    success: '✅',
                    error: '❌',
                    info: 'ℹ️',
                    warning: '⚠️'
                };
                
                toast.innerHTML = `
                    <div class="toast-icon">${icons[tipo] || 'ℹ️'}</div>
                    <div class="toast-message">${mensagem}</div>
                    <button class="toast-close">&times;</button>
                `;
                container.appendChild(toast);

                // Fechar ao clicar no botão
                toast.querySelector('.toast-close').addEventListener('click', () => {
                    toast.remove();
                });

                // Fechar ao clicar no toast
                toast.addEventListener('click', () => {
                    toast.remove();
                });

                // Auto-fechar após 4 segundos
                setTimeout(() => {
                    if (toast.parentNode) toast.remove();
                }, 4000);
                
                console.log('✅ Toast exibido:', mensagem, tipo);
            } catch (error) {
                console.error('❌ Erro ao exibir toast:', error);
                // Fallback: alert
                alert(mensagem);
            }
        }

        // ========== ABRIR MODAL ==========
        function abrirModal() {
            try {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                const materialInput = document.getElementById('materialReserva');
                const tipoSelect = document.getElementById('tipoMaterial');
                const dataLimite = document.getElementById('dataLimite');
                
                if (materialInput) materialInput.value = '';
                if (tipoSelect) tipoSelect.value = 'Livro';
                
                const hoje = new Date();
                hoje.setDate(hoje.getDate() + 7);
                if (dataLimite) {
                    dataLimite.value = hoje.toISOString().split('T')[0];
                    dataLimite.min = new Date().toISOString().split('T')[0];
                }
                
                if (buscaAlunoInput) {
                    buscaAlunoInput.value = '';
                }
                if (suggestions) {
                    suggestions.classList.remove('active');
                }
                limparAlunoSelecionado();
                
                setTimeout(() => {
                    if (buscaAlunoInput) buscaAlunoInput.focus();
                }, 100);
                
                console.log('✅ Modal aberto');
            } catch (error) {
                console.error('❌ Erro ao abrir modal:', error);
            }
        }
        
        // ========== FECHAR MODAL ==========
        function fecharModal() {
            try {
                modal.classList.remove('active');
                document.body.style.overflow = '';
                if (suggestions) {
                    suggestions.classList.remove('active');
                }
                if (!btnSalvar.dataset.salvo) {
                    limparAlunoSelecionado();
                }
                btnSalvar.dataset.salvo = 'false';
                console.log('✅ Modal fechado');
            } catch (error) {
                console.error('❌ Erro ao fechar modal:', error);
            }
        }
        
        // ========== BUSCAR ALUNOS LOCALMENTE ==========
        function buscarAlunosLocal(termo) {
            try {
                if (termo.length < 1) {
                    if (suggestions) suggestions.classList.remove('active');
                    return;
                }
                
                const termoLower = termo.toLowerCase().trim();
                const resultados = todosAlunos.filter(aluno => 
                    aluno.nome_aluno && aluno.nome_aluno.toLowerCase().startsWith(termoLower)
                ).slice(0, 8);
                
                if (!suggestions) return;
                
                if (resultados.length === 0) {
                    suggestions.innerHTML = '<div class="suggestion-empty">Nenhum aluno encontrado</div>';
                    suggestions.classList.add('active');
                    return;
                }
                
                suggestions.innerHTML = resultados.map(aluno => {
                    // Garantir que o ID seja convertido para número
                    const id = parseInt(aluno.id_aluno) || 0;
                    return `
                        <div class="suggestion-item" data-id="${id}">
                            <span class="nome">${escapeHtml(aluno.nome_aluno)}</span>
                            <span class="info">${aluno.serie_aluno ? escapeHtml(aluno.serie_aluno) : ''}</span>
                        </div>
                    `;
                }).join('');
                
                suggestions.classList.add('active');
            } catch (error) {
                console.error('❌ Erro ao buscar alunos:', error);
            }
        }
        
        // ========== SELECIONAR ALUNO ==========
        function selecionarAluno(aluno) {
            try {
                console.log('✅ Aluno selecionado:', aluno);
                
                if (!aluno || !aluno.id_aluno) {
                    console.error('❌ Aluno inválido:', aluno);
                    return;
                }
                
                // Converter para número
                const id = parseInt(aluno.id_aluno);
                if (isNaN(id) || id <= 0) {
                    console.error('❌ ID de aluno inválido:', aluno.id_aluno);
                    return;
                }
                
                alunoSelecionadoId = id;
                if (idAlunoSelecionado) {
                    idAlunoSelecionado.value = id;
                }
                
                if (alunoNome) {
                    alunoNome.textContent = aluno.nome_aluno || 'Nome não disponível';
                }
                if (alunoMatricula) {
                    alunoMatricula.textContent = aluno.serie_aluno ? `Série: ${aluno.serie_aluno}` : 'Sem série';
                }
                if (alunoAvatar) {
                    alunoAvatar.textContent = (aluno.nome_aluno || '?').trim().charAt(0).toUpperCase();
                }
                
                if (alunoSelecionado) {
                    alunoSelecionado.classList.add('active');
                }
                if (suggestions) {
                    suggestions.classList.remove('active');
                }
                if (buscaAlunoInput) {
                    buscaAlunoInput.value = '';
                }
                
                console.log('🔍 ID do aluno selecionado:', id);
                validarFormulario();
            } catch (error) {
                console.error('❌ Erro ao selecionar aluno:', error);
            }
        }
        
        // ========== LIMPAR ALUNO SELECIONADO ==========
        function limparAlunoSelecionado() {
            try {
                alunoSelecionadoId = null;
                if (idAlunoSelecionado) {
                    idAlunoSelecionado.value = '';
                }
                if (alunoSelecionado) {
                    alunoSelecionado.classList.remove('active');
                }
                validarFormulario();
            } catch (error) {
                console.error('❌ Erro ao limpar aluno:', error);
            }
        }
        
        // ========== VALIDAR FORMULÁRIO ==========
        function validarFormulario() {
            try {
                const alunoValido = alunoSelecionadoId !== null && alunoSelecionadoId > 0;
                const materialInput = document.getElementById('materialReserva');
                const materialValido = materialInput && materialInput.value.trim().length > 0;
                const dataInput = document.getElementById('dataLimite');
                const dataValida = dataInput && dataInput.value.length > 0;
                
                const habilitado = alunoValido && materialValido && dataValida;
                if (btnSalvar) {
                    btnSalvar.disabled = !habilitado;
                }
                console.log('🔍 Validação:', { alunoValido, materialValido, dataValida, habilitado });
                return habilitado;
            } catch (error) {
                console.error('❌ Erro ao validar formulário:', error);
                return false;
            }
        }
        
        // ========== SALVAR RESERVA ==========
        function salvarReserva() {
            try {
                if (!validarFormulario()) {
                    showToast('Preencha todos os campos obrigatórios', 'error');
                    return;
                }
                if (formReserva) {
                    // Verificar se o ID do aluno está presente
                    const idAluno = idAlunoSelecionado ? idAlunoSelecionado.value : '';
                    if (!idAluno) {
                        showToast('Selecione um aluno válido', 'error');
                        return;
                    }
                    console.log('📤 Enviando reserva com ID do aluno:', idAluno);
                    formReserva.submit();
                }
            } catch (error) {
                console.error('❌ Erro ao salvar reserva:', error);
                showToast('Erro ao salvar reserva. Tente novamente.', 'error');
            }
        }
        
        // ========== EVENTOS ==========
        if (btnAbrir) {
            btnAbrir.addEventListener('click', abrirModal);
        }
        if (btnFechar) {
            btnFechar.addEventListener('click', fecharModal);
        }
        if (btnCancelar) {
            btnCancelar.addEventListener('click', fecharModal);
        }
        
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) fecharModal();
            });
        }
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
                fecharModal();
            }
        });
        
        // Busca em tempo real
        if (buscaAlunoInput) {
            buscaAlunoInput.addEventListener('input', function() {
                const termo = this.value.trim();
                if (termo.length < 1) {
                    if (suggestions) suggestions.classList.remove('active');
                    return;
                }
                buscarAlunosLocal(termo);
            });
            
            // Fechar sugestões ao perder foco
            buscaAlunoInput.addEventListener('blur', function() {
                setTimeout(() => {
                    if (suggestions && !suggestions.matches(':hover')) {
                        suggestions.classList.remove('active');
                    }
                }, 200);
            });
        }
        
        // ========== DELEGAÇÃO DE EVENTOS PARA SUGESTÕES ==========
        if (suggestions) {
            suggestions.addEventListener('click', function(e) {
                const item = e.target.closest('.suggestion-item');
                if (!item) return;
                
                const id = parseInt(item.dataset.id);
                console.log('🖱️ Clique no item com ID:', id, 'Tipo:', typeof id);
                
                // Buscar o aluno pelo ID (comparação numérica)
                const aluno = todosAlunos.find(a => parseInt(a.id_aluno) === id);
                
                if (aluno) {
                    console.log('✅ Aluno encontrado:', aluno);
                    selecionarAluno(aluno);
                } else {
                    console.error('❌ Aluno não encontrado para o ID:', id);
                    console.log('📋 Lista de alunos disponíveis:', todosAlunos.map(a => ({id: a.id_aluno, nome: a.nome_aluno})));
                    showToast('Aluno não encontrado. Tente novamente.', 'error');
                }
            });
        }
        
        if (removerAluno) {
            removerAluno.addEventListener('click', limparAlunoSelecionado);
        }
        
        const materialReserva = document.getElementById('materialReserva');
        if (materialReserva) {
            materialReserva.addEventListener('input', validarFormulario);
        }
        
        const dataLimite = document.getElementById('dataLimite');
        if (dataLimite) {
            dataLimite.addEventListener('change', validarFormulario);
        }
        
        // Salvar com Enter
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && modal && modal.classList.contains('active')) {
                const active = document.activeElement;
                if (active && (active.id === 'buscaAluno' || active.id === 'materialReserva' || active.id === 'dataLimite')) {
                    if (validarFormulario()) {
                        salvarReserva();
                    }
                }
            }
        });
        
        console.log('✅ Modal inicializado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro fatal ao inicializar modal:', error);
    }
});

// ========== FUNÇÃO AUXILIAR ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}