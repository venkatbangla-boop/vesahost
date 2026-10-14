(function () {
  'use strict';

  function mountNextAppShell(callbacks = {}) {
    if (!window.VesaWorkspaceShell) throw new Error('The shared VESA workspace shell is required.');
    const session = window.VesaAuth?.session?.() || {};
    const shell = new VesaWorkspaceShell.VesaWorkspaceShell({
      root: document.body,
      descriptor: {
        id: 'next-app',
        name: 'Next VESA App',
        route: '/apps/next-app/',
        contentTarget: '#nextAppMain',
        userLabel: session.name || '',
        userRole: session.role || ''
      },
      callbacks: {
        menu: name => callbacks.menu?.(name),
        settings: () => callbacks.settings?.()
      }
    });
    shell.mount();
    document.querySelector('.app-user-bar')?.after(shell.element);
    return shell;
  }

  window.VesaNextAppStarter = Object.freeze({ mountNextAppShell });
})();
