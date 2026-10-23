(() => {
    const controls = document.querySelector('.admin-appearance-controls');
    if (!controls || !document.body) return;

    const button = controls.querySelector('[data-admin-appearance-toggle]');
    if (!button) return;

    const appearances = ['claro', 'escuro', 'alto_contraste'];
    const appearanceClasses = ['tema-claro', 'tema-escuro', 'tema-alto_contraste'];

    function currentAppearance() {
        if (document.body.classList.contains('tema-alto_contraste')) return 'alto_contraste';
        if (document.body.classList.contains('tema-escuro')) return 'escuro';
        return 'claro';
    }

    function updateButton(appearance) {
        const currentIndex = appearances.indexOf(appearance);
        const nextAppearance = appearances[(currentIndex + 1) % appearances.length];
        const labels = {
            claro: 'claro',
            escuro: 'escuro',
            alto_contraste: 'alto contraste'
        };
        const label = `Tema atual: ${labels[appearance]}. Próximo: ${labels[nextAppearance]}.`;
        button.setAttribute('aria-label', label);
        button.title = label;
    }

    function setAppearance(appearance) {
        document.body.classList.remove(...appearanceClasses);
        if (appearance !== 'claro') document.body.classList.add(`tema-${appearance}`);
        updateButton(appearance);

        const secure = location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `siga_admin_appearance=${appearance}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
        document.dispatchEvent(new CustomEvent('admin:appearancechange', { detail: { appearance } }));
    }

    updateButton(currentAppearance());

    button.addEventListener('click', () => {
        const currentIndex = appearances.indexOf(currentAppearance());
        setAppearance(appearances[(currentIndex + 1) % appearances.length]);
    });
})();
