(function () {
  'use strict';

  const form = document.getElementById('formPreferencias');
  const dialog = document.getElementById('unsaved-changes-dialog');
  if (!form || !dialog) return;

  const saveButton = form.querySelector('button[type="submit"][name="salvar"]');
  const saveAndLeave = dialog.querySelector('[data-unsaved-action="save"]');
  const discardAndLeave = dialog.querySelector('[data-unsaved-action="discard"]');
  const stay = dialog.querySelector('[data-unsaved-action="stay"]');
  if (!saveButton || !saveAndLeave || !discardAndLeave || !stay) return;

  const redirectField = document.createElement('input');
  redirectField.type = 'hidden';
  redirectField.name = 'redirect_apos_salvar';
  form.appendChild(redirectField);

  let initialState = readFormState();
  let pendingDestination = null;
  let allowUnload = false;
  let returnFocus = null;

  function readFormState() {
    return JSON.stringify(Array.from(form.elements)
      .filter(element => element.name && element.name !== 'csrf' && element.name !== 'redirect_apos_salvar' && element.type !== 'submit')
      .map(element => [
        element.name,
        element.type === 'checkbox' || element.type === 'radio' ? element.checked : element.value
      ]));
  }

  function hasUnsavedChanges() {
    return readFormState() !== initialState;
  }

  function openDialog(destination) {
    pendingDestination = destination;
    returnFocus = document.activeElement;
    dialog.hidden = false;
    stay.focus();
  }

  function closeDialog() {
    dialog.hidden = true;
    pendingDestination = null;
    if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
  }

  function isSamePage(url) {
    return url.pathname === window.location.pathname
      && url.search === window.location.search
      && url.hash === window.location.hash;
  }

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!anchor || anchor.target && anchor.target !== '_self' || anchor.hasAttribute('download')) return;

    const destination = new URL(anchor.href, window.location.href);
    if (destination.origin !== window.location.origin || isSamePage(destination)) return;
    if (!hasUnsavedChanges()) return;

    event.preventDefault();
    openDialog(destination);
  }, true);

  saveAndLeave.addEventListener('click', () => {
    if (!pendingDestination) return;
    redirectField.value = pendingDestination.pathname + pendingDestination.search + pendingDestination.hash;
    allowUnload = true;
    form.requestSubmit(saveButton);
  });

  discardAndLeave.addEventListener('click', () => {
    if (!pendingDestination) return;
    const destination = pendingDestination.href;
    allowUnload = true;
    window.location.assign(destination);
  });

  stay.addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
      return;
    }

    if (event.key === 'Tab') {
      const actions = [saveAndLeave, discardAndLeave, stay];
      const first = actions[0];
      const last = actions[actions.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  form.addEventListener('submit', () => {
    allowUnload = true;
    initialState = readFormState();
  });

  window.addEventListener('beforeunload', event => {
    if (!allowUnload && hasUnsavedChanges()) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
})();
