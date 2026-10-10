/* VESA-UNIFORM-UI-v1: one app-neutral workspace shell. */
(function (global) {
  'use strict';

  const MENU_ORDER = Object.freeze(['Home', 'File', 'Edit', 'View', 'Tools', 'Help']);
  const SAVE_STATES = Object.freeze({ saving: 'Saving…', saved: 'Saved on this device', unsaved: 'Unsaved changes', failed: 'Could not save — download a saved copy' });
  const text = value => String(value == null ? '' : value);
  const escape = value => text(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  function descriptor(input) {
    const value = input || {};
    if (!text(value.id).trim() || !text(value.name).trim()) throw new TypeError('A workspace descriptor needs an id and name.');
    return Object.freeze({ id: text(value.id).trim(), name: text(value.name).trim(), route: text(value.route || '/apps/'), logo: text(value.logo || '/assets/vesa-logo-black.png'), savedState: text(value.savedState || SAVE_STATES.saved), userLabel: text(value.userLabel || ''), menuLabels: Object.freeze({ ...(value.menuLabels || {}) }) });
  }

  class VesaWorkspaceShell {
    constructor(options) {
      const config = options || {};
      if (!config.root || !config.root.ownerDocument) throw new TypeError('A workspace root is required.');
      this.root = config.root;
      this.document = config.root.ownerDocument;
      this.descriptor = descriptor(config.descriptor);
      this.callbacks = config.callbacks || {};
      this._mounted = false;
      this._onClick = event => this._handleClick(event);
      this._onResize = () => this.measure();
    }

    mount() {
      if (this._mounted) return this.element;
      if (this.root.querySelector('.vesa-workspace')) throw new Error('A VESA workspace shell is already mounted in this root.');
      const nav = MENU_ORDER.map(name => `<button type="button" class="vesa-workspace__menu" data-vesa-menu="${name}" aria-label="${escape(this.descriptor.menuLabels[name] || name)}">${escape(this.descriptor.menuLabels[name] || name)}</button>`).join('');
      const element = this.document.createElement('header');
      element.className = 'vesa-workspace';
      element.setAttribute('data-vesa-workspace', this.descriptor.id);
      element.setAttribute('data-menu-open', 'false');
      element.innerHTML = `<a class="vesa-workspace__brand" href="/" aria-label="VESA home"><img src="${escape(this.descriptor.logo)}" alt="VESA"></a><a class="vesa-workspace__app" href="${escape(this.descriptor.route)}"><small>App Centre ›</small><span>${escape(this.descriptor.name)}</span></a><button type="button" class="vesa-workspace__mobile-menu" data-vesa-mobile-menu aria-expanded="false">Menu</button><nav class="vesa-workspace__nav" aria-label="VESA workspace menu">${nav}</nav><div class="vesa-workspace__user"><span class="vesa-workspace__saved" data-vesa-saved>${escape(this.descriptor.savedState)}</span>${this.descriptor.userLabel ? `<span>${escape(this.descriptor.userLabel)}</span>` : ''}<button type="button" data-vesa-user>Settings</button></div>`;
      this.root.prepend(element);
      this.element = element;
      this._mounted = true;
      this.element.addEventListener('click', this._onClick);
      global.addEventListener?.('resize', this._onResize, { passive: true });
      this.measure();
      return element;
    }

    measure() {
      if (!this.element) return 0;
      const height = Math.ceil(this.element.getBoundingClientRect().height || this.element.offsetHeight || 0);
      this.root.style.setProperty('--vesa-workspace-height', `${height}px`);
      return height;
    }

    setSavedState(state) {
      const value = SAVE_STATES[state] || text(state);
      const target = this.element?.querySelector('[data-vesa-saved]');
      if (target) target.textContent = value;
      return value;
    }

    _handleClick(event) {
      const menu = event.target.closest?.('[data-vesa-menu]');
      if (menu) return this.callbacks.menu?.(menu.dataset.vesaMenu, this.descriptor);
      if (event.target.closest?.('[data-vesa-user]')) return this.callbacks.settings?.(this.descriptor);
      const mobile = event.target.closest?.('[data-vesa-mobile-menu]');
      if (mobile) {
        const open = this.element.dataset.menuOpen !== 'true';
        this.element.dataset.menuOpen = String(open);
        mobile.setAttribute('aria-expanded', String(open));
        if (open) this.element.querySelector('[data-vesa-menu]')?.focus();
      }
    }

    destroy() {
      if (!this._mounted) return;
      this.element.removeEventListener('click', this._onClick);
      global.removeEventListener?.('resize', this._onResize);
      this.element.remove();
      this._mounted = false;
      this.element = null;
    }
  }

  global.VesaWorkspaceShell = Object.freeze({ MENU_ORDER, SAVE_STATES, descriptor, VesaWorkspaceShell });
}(window));
