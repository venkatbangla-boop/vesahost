/* VESA-UNIFIED-PAGE-SHELL-v2: one app-neutral authenticated workspace shell. */
(function (global) {
  'use strict';

  const MENU_ORDER = Object.freeze(['Home', 'File', 'Edit', 'View', 'Tools', 'Help']);
  const SAVE_STATES = Object.freeze({ saving: 'Saving…', saved: 'Saved on this device', unsaved: 'Unsaved changes', failed: 'Could not save — download a saved copy' });
  const text = value => String(value == null ? '' : value);
  const escape = value => text(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  function descriptor(input) {
    const value = input || {};
    if (!text(value.id).trim() || !text(value.name).trim()) throw new TypeError('A workspace descriptor needs an id and name.');
    return Object.freeze({ id: text(value.id).trim(), name: text(value.name).trim(), route: text(value.route || '/apps/'), appCentreRoute: text(value.appCentreRoute || '/apps/'), logo: text(value.logo || '/assets/vesa-logo-black.png'), savedState: text(value.savedState || SAVE_STATES.saved), userLabel: text(value.userLabel || ''), userRole: text(value.userRole || ''), menuLabels: Object.freeze({ ...(value.menuLabels || {}) }) });
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
      this._settingsDialog = null;
      this._settingsReturnFocus = null;
      this._onClick = event => this._handleClick(event);
      this._onKeydown = event => this._handleKeydown(event);
      this._onDocumentClick = event => this._handleDocumentClick(event);
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
      element.innerHTML = `<a class="vesa-workspace__brand" href="/" aria-label="VESA home"><img src="${escape(this.descriptor.logo)}" alt="VESA"></a><div class="vesa-workspace__breadcrumb" aria-label="Current VESA workspace"><a class="vesa-workspace__app-centre" href="${escape(this.descriptor.appCentreRoute)}">App Centre</a><span aria-hidden="true">›</span><a class="vesa-workspace__app vesa-workspace__app-current" href="${escape(this.descriptor.route)}">${escape(this.descriptor.name)}</a></div><button type="button" class="vesa-workspace__mobile-menu" data-vesa-mobile-menu aria-expanded="false" aria-controls="vesaWorkspaceDrawer">Menu</button><div class="vesa-workspace__drawer" id="vesaWorkspaceDrawer"><nav class="vesa-workspace__nav" aria-label="VESA workspace menu">${nav}</nav><div class="vesa-workspace__user"><span class="vesa-workspace__saved" data-vesa-saved>${escape(this.descriptor.savedState)}</span>${this.descriptor.userLabel ? `<span class="vesa-workspace__user-label">${escape(this.descriptor.userLabel)}</span>` : ''}<button type="button" data-vesa-user>Settings</button>${this.descriptor.userRole === 'admin' ? '<a href="/admin/" data-vesa-admin>Admin</a>' : ''}<button type="button" data-vesa-logout>Logout</button></div></div>`;
      const legacyAuthBar = this.root.querySelector(':scope > .app-user-bar');
      legacyAuthBar?.remove();
      this.document.documentElement?.style.removeProperty('--vesa-auth-bar-height');
      this.root.prepend(element);
      this.element = element;
      this._mounted = true;
      this.element.addEventListener('click', this._onClick);
      this.element.addEventListener('keydown', this._onKeydown);
      this.document.addEventListener('click', this._onDocumentClick);
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

    /** Open the platform-owned language/theme controls without exposing app data to the shell. */
    openSettings() {
      if (!global.VesaPrefs?.controls || !this.document?.body) return this.callbacks.settings?.(this.descriptor);
      if (!this._settingsDialog) {
        const dialog = this.document.createElement('dialog');
        dialog.className = 'vesa-settings-dialog';
        dialog.setAttribute('data-vesa-settings', 'true');
        dialog.setAttribute('aria-labelledby', 'vesaSettingsTitle');
        dialog.innerHTML = `<form method="dialog"><header><div><p class="vesa-settings-kicker">VESA</p><h2 id="vesaSettingsTitle">Settings</h2><p>Language and appearance apply to this browser. Saved records and entered values are unchanged.</p></div><button type="submit" aria-label="Close settings">×</button></header><div class="vesa-settings-body">${global.VesaPrefs.controls()}</div><footer><button type="submit">Close</button></footer></form>`;
        this.document.body.append(dialog);
        global.VesaPrefs.wire?.(dialog);
        dialog.addEventListener('close', () => {
          const target = this._settingsReturnFocus;
          this._settingsReturnFocus = null;
          if (target?.isConnected) target.focus({ preventScroll: true });
        });
        this._settingsDialog = dialog;
      }
      this._settingsReturnFocus = this.element?.querySelector('[data-vesa-user]') || this.element;
      this._settingsDialog.querySelector('[data-pref-language]')?.focus({ preventScroll: true });
      if (!this._settingsDialog.open) this._settingsDialog.showModal();
      return this._settingsDialog;
    }

    _handleClick(event) {
      const menu = event.target.closest?.('[data-vesa-menu]');
      if (menu) return this.callbacks.menu?.(menu.dataset.vesaMenu, this.descriptor);
      if (event.target.closest?.('[data-vesa-user]')) return this.openSettings();
      if (event.target.closest?.('[data-vesa-logout]')) {
        if (this.callbacks.logout) return this.callbacks.logout(this.descriptor);
        global.VesaAuth?.logout?.();
        if (global.location) global.location.href = '/login/';
        return;
      }
      const mobile = event.target.closest?.('[data-vesa-mobile-menu]');
      if (mobile) {
        const open = this.element.dataset.menuOpen !== 'true';
        this.element.dataset.menuOpen = String(open);
        mobile.setAttribute('aria-expanded', String(open));
        if (open) this.element.querySelector('[data-vesa-menu]')?.focus();
      }
    }

    _handleDocumentClick(event) {
      const fromDialog = event.composedPath?.().some(node => node?.matches?.('dialog,[role="dialog"]'));
      if (!this.element || this.element.dataset.menuOpen !== 'true' || this.element.contains(event.target) || fromDialog) return;
      this._closeMobileMenu(false);
    }

    _closeMobileMenu(returnFocus) {
      if (!this.element) return;
      this.element.dataset.menuOpen = 'false';
      const mobile = this.element.querySelector('[data-vesa-mobile-menu]');
      mobile?.setAttribute('aria-expanded', 'false');
      if (returnFocus) mobile?.focus();
    }

    _handleKeydown(event) {
      if (event.key !== 'Escape' || this.element.dataset.menuOpen !== 'true') return;
      event.preventDefault();
      this._closeMobileMenu(true);
    }

    destroy() {
      if (!this._mounted) return;
      this.element.removeEventListener('click', this._onClick);
      this.element.removeEventListener('keydown', this._onKeydown);
      this.document.removeEventListener('click', this._onDocumentClick);
      global.removeEventListener?.('resize', this._onResize);
      this._settingsDialog?.remove();
      this._settingsDialog = null;
      this.element.remove();
      this._mounted = false;
      this.element = null;
    }
  }

  global.VesaWorkspaceShell = Object.freeze({ MENU_ORDER, SAVE_STATES, descriptor, VesaWorkspaceShell });
}(window));
