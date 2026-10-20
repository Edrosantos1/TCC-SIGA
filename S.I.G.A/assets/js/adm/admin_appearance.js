(() => {
    const controls = document.querySelector('.admin-appearance-controls');
    if (!controls || !document.body) return;

    const buttons = [...controls.querySelectorAll('[data-admin-appearance]')];
    const appearanceClasses = ['tema-claro', 'tema-escuro', 'tema-alto_contraste'];

    function currentAppearance() {
        if (document.body.classList.contains('tema-alto_contraste')) return 'alto_contraste';
        if (document.body.classList.contains('tema-escuro')) return 'escuro';
        return 'claro';
    }

    function updateButtons(appearance) {
        buttons.forEach(button => {
            const active = button.dataset.adminAppearance === appearance;
            const label = button.dataset.adminAppearance === 'escuro' ? 'modo escuro' : 'alto contraste';
            const action = active ? 'Desativar' : 'Ativar';
            button.setAttribute('aria-pressed', String(active));
            button.setAttribute('aria-label', `${action} ${label}`);
            button.title = `${action} ${label}`;
        });
    }

    function setAppearance(appearance) {
        document.body.classList.remove(...appearanceClasses);
        if (appearance !== 'claro') document.body.classList.add(`tema-${appearance}`);
        updateButtons(appearance);

        const secure = location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `siga_admin_appearance=${appearance}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
        document.dispatchEvent(new CustomEvent('admin:appearancechange', { detail: { appearance } }));
    }

    updateButtons(currentAppearance());

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const selected = button.dataset.adminAppearance;
            setAppearance(currentAppearance() === selected ? 'claro' : selected);
        });
    });
})();
