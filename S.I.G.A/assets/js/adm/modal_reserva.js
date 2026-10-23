document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalReserva');
    const form = document.getElementById('formNovaReserva');
    const openButton = document.getElementById('btn-nova-reserva');
    const closeButton = document.getElementById('modalCloseBtn');
    const cancelButton = document.getElementById('modalCancelBtn');
    const saveButton = document.getElementById('modalSaveBtn');

    const studentInput = document.getElementById('buscaAluno');
    const studentSuggestions = document.getElementById('alunoSuggestions');
    const selectedStudent = document.getElementById('alunoSelecionado');
    const selectedStudentName = document.getElementById('alunoNomeSelecionado');
    const selectedStudentSeries = document.getElementById('alunoMatriculaSelecionada');
    const selectedStudentAvatar = document.getElementById('alunoAvatar');
    const selectedStudentIdInput = document.getElementById('idAlunoSelecionado');
    const removeStudentButton = document.getElementById('removerAluno');

    const materialInput = document.getElementById('materialReserva');
    const materialSuggestions = document.getElementById('materialSuggestions');
    const selectedCatalogIdInput = document.getElementById('idCatalogoSelecionado');
    const materialTypeInput = document.getElementById('tipoMaterial');
    const dueDateInput = document.getElementById('dataLimite');

    if (!modal || !form || !openButton || !closeButton || !cancelButton || !saveButton) {
        console.error('Elementos do modal de reserva manual não encontrados.');
        return;
    }

    const students = typeof alunosData !== 'undefined' ? alunosData : [];
    const materials = typeof materiaisData !== 'undefined' ? materiaisData : [];
    let selectedStudentId = null;
    let materialsById = new Map();

    function showToast(message, type = 'info') {
        const container = document.querySelector('.toast-container');
        if (!container) {
            console.error('Contêiner de notificações não encontrado:', message);
            return;
        }

        container.querySelectorAll('.toast-custom').forEach(toast => toast.remove());
        const toast = document.createElement('div');
        toast.className = `toast-custom toast-${type}`;
        const text = document.createElement('div');
        text.className = 'toast-message';
        text.textContent = message;
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'toast-close';
        close.setAttribute('aria-label', 'Fechar aviso');
        close.textContent = '×';
        close.addEventListener('click', () => toast.remove());
        toast.append(text, close);
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    function updateFormState() {
        const valid = Number(selectedStudentId) > 0
            && Number(selectedCatalogIdInput?.value) > 0
            && Boolean(dueDateInput?.value);
        saveButton.disabled = !valid;
        return valid;
    }

    function closeSuggestions() {
        studentSuggestions?.classList.remove('active');
        materialSuggestions?.classList.remove('active');
    }

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (materialInput) materialInput.value = '';
        if (selectedCatalogIdInput) selectedCatalogIdInput.value = '';
        if (materialTypeInput) materialTypeInput.value = '';
        if (studentInput) studentInput.value = '';
        closeSuggestions();
        clearSelectedStudent();

        if (dueDateInput) {
            const today = new Date();
            dueDateInput.min = [
                today.getFullYear(),
                String(today.getMonth() + 1).padStart(2, '0'),
                String(today.getDate()).padStart(2, '0')
            ].join('-');
            today.setDate(today.getDate() + 7);
            dueDateInput.value = [
                today.getFullYear(),
                String(today.getMonth() + 1).padStart(2, '0'),
                String(today.getDate()).padStart(2, '0')
            ].join('-');
        }
        updateFormState();
        studentInput?.focus();
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        closeSuggestions();
    }

    function renderStudents(term) {
        if (!studentSuggestions) return;
        const normalizedTerm = term.toLocaleLowerCase('pt-BR');
        const matches = students
            .filter(student => student.nome_aluno
                && student.nome_aluno.toLocaleLowerCase('pt-BR').includes(normalizedTerm))
            .slice(0, 8);

        if (!matches.length) {
            studentSuggestions.innerHTML = '<div class="suggestion-empty">Nenhum aluno encontrado</div>';
        } else {
            studentSuggestions.innerHTML = matches.map(student => `
                <button type="button" class="suggestion-item" role="option" data-id="${escapeHtml(student.id_aluno)}">
                    <span class="nome">${escapeHtml(student.nome_aluno)}</span>
                    <span class="info">${escapeHtml(student.serie_aluno || '')}</span>
                </button>
            `).join('');
        }
        studentSuggestions.classList.add('active');
    }

    function selectStudent(student) {
        const id = Number(student?.id_aluno);
        if (!Number.isInteger(id) || id <= 0) {
            showToast('Aluno inválido. Faça a busca novamente.', 'error');
            return;
        }

        selectedStudentId = id;
        if (selectedStudentIdInput) selectedStudentIdInput.value = String(id);
        if (selectedStudentName) selectedStudentName.textContent = student.nome_aluno || 'Nome não disponível';
        if (selectedStudentSeries) {
            selectedStudentSeries.textContent = student.serie_aluno ? `Série: ${student.serie_aluno}` : 'Sem série';
        }
        if (selectedStudentAvatar) {
            selectedStudentAvatar.textContent = (student.nome_aluno || '?').trim().charAt(0).toUpperCase();
        }
        selectedStudent?.classList.add('active');
        studentSuggestions?.classList.remove('active');
        if (studentInput) studentInput.value = '';
        updateFormState();
    }

    function clearSelectedStudent() {
        selectedStudentId = null;
        if (selectedStudentIdInput) selectedStudentIdInput.value = '';
        selectedStudent?.classList.remove('active');
        updateFormState();
    }

    function renderMaterials(materials) {
        if (!materialSuggestions) return;
        materialsById = new Map(materials.map(material => [String(material.id_catalogo), material]));

        if (!materials.length) {
            materialSuggestions.innerHTML = '<div class="suggestion-empty">Nenhum material disponível encontrado</div>';
        } else {
            materialSuggestions.innerHTML = materials.map(material => `
                <button type="button" class="suggestion-item" role="option" data-id="${escapeHtml(material.id_catalogo)}">
                    <span class="material-info">
                        <span class="nome">${escapeHtml(material.titulo)}</span>
                        <span class="autor">${escapeHtml(material.autor || 'Autor não informado')} · ${escapeHtml(material.tipo)}</span>
                    </span>
                    <span class="disponibilidade">${escapeHtml(material.disponiveis)} disponível(is)</span>
                </button>
            `).join('');
        }
        materialSuggestions.classList.add('active');
    }

    function searchMaterials(term) {
        if (!materialSuggestions) return;
        const termoNormalizado = term.toLocaleLowerCase('pt-BR');
        const resultados = materials
            .filter(material => [material.titulo, material.autor, material.isbn]
                .some(valor => String(valor || '').toLocaleLowerCase('pt-BR').includes(termoNormalizado)))
            .slice(0, 8);

        renderMaterials(resultados);
    }

    function selectMaterial(material) {
        if (!material || !material.id_catalogo) {
            showToast('Material inválido. Faça a busca novamente.', 'error');
            return;
        }
        if (materialInput) materialInput.value = material.titulo;
        if (selectedCatalogIdInput) selectedCatalogIdInput.value = material.id_catalogo;
        if (materialTypeInput) materialTypeInput.value = material.tipo;
        materialSuggestions?.classList.remove('active');
        updateFormState();
    }

    openButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    removeStudentButton?.addEventListener('click', event => {
        event.preventDefault();
        clearSelectedStudent();
    });

    modal.addEventListener('click', event => {
        if (event.target === modal) closeModal();
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    studentInput?.addEventListener('input', () => {
        const term = studentInput.value.trim();
        if (!term) {
            studentSuggestions?.classList.remove('active');
            return;
        }
        renderStudents(term);
    });

    studentInput?.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        event.stopPropagation();
        studentSuggestions?.querySelector('.suggestion-item')?.click();
    });

    studentSuggestions?.addEventListener('click', event => {
        const option = event.target.closest('.suggestion-item');
        if (!option) return;
        const student = students.find(item => Number(item.id_aluno) === Number(option.dataset.id));
        if (student) selectStudent(student);
    });

    materialInput?.addEventListener('input', () => {
        const term = materialInput.value.trim();
        if (selectedCatalogIdInput) selectedCatalogIdInput.value = '';
        if (materialTypeInput) materialTypeInput.value = '';
        updateFormState();
        if (!term) {
            materialSuggestions?.classList.remove('active');
            return;
        }
        searchMaterials(term);
    });

    materialInput?.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        event.stopPropagation();
        materialSuggestions?.querySelector('.suggestion-item')?.click();
    });

    materialSuggestions?.addEventListener('click', event => {
        const option = event.target.closest('.suggestion-item');
        if (!option) return;
        selectMaterial(materialsById.get(option.dataset.id));
    });

    document.addEventListener('click', event => {
        if (!studentSuggestions?.contains(event.target) && event.target !== studentInput) {
            studentSuggestions?.classList.remove('active');
        }
        if (!materialSuggestions?.contains(event.target) && event.target !== materialInput) {
            materialSuggestions?.classList.remove('active');
        }
    });

    dueDateInput?.addEventListener('change', updateFormState);

    form.addEventListener('submit', event => {
        if (!updateFormState()) {
            event.preventDefault();
            showToast('Selecione um aluno e um material disponível no catálogo, e informe a data limite.', 'error');
        }
    });
});

function escapeHtml(value) {
    const element = document.createElement('span');
    element.textContent = String(value ?? '');
    return element.innerHTML;
}
