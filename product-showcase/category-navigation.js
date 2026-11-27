/**
 * Product disclosure navigation. CategoryNavigation owns only the six controls,
 * a bounded product flyout, its focus/pointer lifecycle and open-state notifications.
 * The immutable catalogue supplies text; MotionExperience alone selects and plays.
 * This owner performs no image work, URL routing, persistence or parent messaging.
 */
class CategoryNavigation {
  /**
   * Bind an empty navigation shell, validated catalogue and controller callbacks.
   * start() installs one listener scope; destroy() cancels all listeners/timers.
   * Invalid group/item requests are ignored rather than inventing a choice.
   */
  constructor(root, catalogue, options = {}) {
    this.root = root;
    this.catalogue = catalogue;
    this.controls = root.querySelector('#collection-controls');
    this.panel = root.querySelector('#collection-panel');
    this.list = root.querySelector('#collection-list');
    this.title = root.querySelector('#collection-panel-title');
    this.browse = root.querySelector('#browse-collection');
    this.events = new AbortController();
    this.desktop = matchMedia('(min-width: 701px) and (hover: hover)');
    this.buttons = new Map();
    this.openGroup = null;
    this.selected = null;
    this.closeTimer = 0;
    this.pointerInside = false;
    this.pinned = false;
    this.restoringFocus = false;
    this.started = false;
    this.destroyed = false;
    this.onSelect = options.onSelect;
    this.onOpenChange = options.onOpenChange;
    this.labels = Object.freeze({all:'All', men:"Men's", ladies:"Ladies'", boys:'Boys', girls:'Girls', baby:'Baby'});
  }

  /** Read-only hold state; the controller combines it with its other pause reasons. */
  get isOpen() { return this.openGroup !== null; }

  /** Scope each listener to this navigation's lifetime. */
  listen(target, type, handler, options = {}) {
    target.addEventListener(type, handler, {...options, signal:this.events.signal});
  }

  /**
   * Return reviewed garment families in original catalogue order. All is
   * grouped by the actual five collections, independently of slideshow ordering.
   */
  sections(group) {
    if (group === 'all') return Object.keys(this.labels).filter(key => key !== 'all').map(key => ({
      label:this.labels[key], items:this.catalogue.items(key)
    }));
    const families = {
      men:[['Tops & layers',1,12], ['Joggers',13,15], ['Shirts',16,20], ['Shorts & trousers',21,30], ['Activewear',31,34]],
      ladies:[['Tops & layers',1,11], ['Shirts & blouses',12,16], ['Bottoms',17,26], ['Dresses',27,29]],
      boys:[['Tops & layers',1,6], ['Shorts',7,10], ['Joggers & track pants',11,12], ['Shirts & trousers',29,31], ['Knitwear & jackets',32,33], ['Activewear & swimwear',34,35], ['Sleepwear',36,36], ['Denim',37,37], ['Underwear',38,38]],
      girls:[['Tops',13,15], ['Bottoms',16,19], ['Dresses & skirts',20,22], ['Tanks & sweatshirts',23,24], ['Blouses & trousers',39,40], ['Knitwear & jackets',41,42], ['Jumpsuits',43,43], ['Activewear & swimwear',44,45], ['Sleepwear',46,46], ['Hoodies',47,47], ['Underwear',48,48]],
      baby:[['Baby basics',25,28], ['Rompers & dungarees',49,50], ['Trousers',51,51], ['Knitwear & jackets',52,53], ['Sleepwear',54,56], ['Swimwear',57,57], ['Nappy covers',58,58]]
    };
    if (!families[group]) return [];
    const items = this.catalogue.items(group);
    return families[group].map(([label, first, last]) => ({
      label, items:items.filter(item => Number(item.id.slice(1)) >= first && Number(item.id.slice(1)) <= last)
    }));
  }

  /**
   * Build persistent buttons once, then attach disclosure-only interactions.
   * Pointer hover/focus opens without selecting; tap/click pins or toggles it.
   */
  start() {
    if (this.started || this.destroyed) return;
    this.started = true;
    for (const [group, label] of Object.entries(this.labels)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'collection-trigger';
      button.dataset.group = group;
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', this.panel.id);
      const name = document.createElement('span');
      name.textContent = label;
      const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      chevron.setAttribute('viewBox', '0 0 16 16');
      chevron.setAttribute('class', 'collection-chevron');
      chevron.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'm4 6 4 4 4-4');
      chevron.append(path);
      button.append(name, chevron);
      this.controls.append(button);
      this.buttons.set(group, button);
      this.listen(button, 'pointerenter', event => {
        if (event.pointerType === 'mouse' && this.desktop.matches) this.open(group, 'hover');
      });
      this.listen(button, 'focus', () => {
        if (!this.restoringFocus && this.desktop.matches && button.matches(':focus-visible')) this.open(group, 'focus');
      });
      this.listen(button, 'click', () => {
        if (this.openGroup === group && this.pinned) this.close();
        else { this.open(group, 'click'); this.pinned = true; }
      });
    }
    this.listen(this.root, 'pointerenter', () => {
      this.pointerInside = true;
      this.cancelClose();
    });
    this.listen(this.root, 'pointerleave', event => {
      this.pointerInside = false;
      if (event.pointerType === 'mouse') this.scheduleClose();
    });
    this.listen(this.root, 'focusin', () => this.cancelClose());
    this.listen(this.root, 'focusout', () => {
      queueMicrotask(() => {
        if (!this.destroyed && !this.root.contains(document.activeElement) && !this.pointerInside) this.close();
      });
    });
    this.listen(this.root, 'keydown', event => this.onKeyDown(event));
    this.listen(this.list, 'click', event => this.choose(event));
    this.listen(this.browse, 'click', () => {
      const group = this.openGroup;
      if (!group) return;
      this.close();
      this.onSelect?.(group, null);
    });
    this.listen(this.root.querySelector('#close-collection'), 'click', () => this.close(true));
    this.listen(document, 'pointerdown', event => {
      if (this.isOpen && !this.root.contains(event.target)) this.close();
    }, {capture:true});
    this.listen(document, 'keydown', event => {
      if (event.key !== 'Escape' || !this.isOpen) return;
      event.preventDefault();
      event.stopPropagation();
      this.close(true);
    }, {capture:true});
    this.listen(this.desktop, 'change', () => this.close());
    this.listen(window, 'resize', () => this.positionPanel(), {passive:true});
  }

  /**
   * Open a validated collection without touching active stage selection.
   * Repeated hover keeps the existing list and keyboard focus intact.
   */
  open(group, reason = 'click') {
    if (this.destroyed || !this.buttons.has(group)) return false;
    this.cancelClose();
    const wasOpen = this.isOpen;
    if (this.openGroup !== group) {
      this.openGroup = group;
      this.pinned = reason === 'click';
      this.renderList(group);
    }
    this.panel.hidden = false;
    this.root.dataset.open = 'true';
    this.positionPanel();
    for (const [key, button] of this.buttons) button.setAttribute('aria-expanded', String(key === group));
    if (!wasOpen) this.onOpenChange?.(true);
    return true;
  }

  /**
   * Keep the invoking control inside the horizontal pointer bridge, including the
   * rightmost Girls/Baby buttons. Clamp to the navigation bounds after CSS chooses
   * panel width; compact layouts remain full-width. Runs only on open/resize.
   */
  positionPanel() {
    if (!this.isOpen || this.destroyed) return;
    if (window.innerWidth <= 700) { this.panel.style.left = '0px'; return; }
    const trigger = this.buttons.get(this.openGroup).getBoundingClientRect();
    const bounds = this.root.getBoundingClientRect();
    const width = this.panel.getBoundingClientRect().width;
    const desired = trigger.left - bounds.left + trigger.width / 2 - width / 2;
    this.panel.style.left = Math.max(0, Math.min(bounds.width - width, desired)) + 'px';
  }

  /** Safely render exact source names; family headings never imply availability. */
  renderList(group) {
    this.title.textContent = group === 'all' ? 'All collections' : this.labels[group];
    this.browse.textContent = group === 'all' ? 'View all collections' : 'View collection';
    this.list.replaceChildren();
    const columns = document.createElement('div');
    columns.className = 'collection-list-columns';
    this.list.append(columns);
    for (const section of this.sections(group)) {
      const family = document.createElement('section');
      family.className = 'collection-family';
      const heading = document.createElement('h3');
      heading.textContent = section.label;
      const items = document.createElement('ul');
      for (const item of section.items) {
        const row = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'collection-product';
        button.dataset.item = item.id;
        button.textContent = item.name;
        button.setAttribute('aria-label', item.name + ', ' + this.labels[item.group] + ', ' + item.id);
        if (this.selected?.item === item.id) button.setAttribute('aria-current', 'true');
        row.append(button);
        items.append(row);
      }
      family.append(heading, items);
      columns.append(family);
    }
    this.list.scrollTop = 0;
  }

  /** Select one existing item through the controller after closing transient UI. */
  choose(event) {
    const button = event.target.closest('button[data-item]');
    if (!button || !this.list.contains(button) || !this.isOpen) return;
    const record = this.catalogue.get(button.dataset.item);
    const group = this.openGroup;
    if (!record || (group !== 'all' && record.group !== group)) return;
    this.close();
    this.onSelect?.(group, record.id);
  }

  /**
   * Keep native Tab/Enter behavior. Optional arrows move among the six controls
   * or product choices; ArrowDown from a disclosure enters its first result.
   */
  onKeyDown(event) {
    const trigger = event.target.closest('.collection-trigger');
    if (trigger) {
      const entries = [...this.buttons.values()];
      const index = entries.indexOf(trigger);
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? entries.length - 1 :
          (index + (event.key === 'ArrowRight' ? 1 : -1) + entries.length) % entries.length;
        entries[next].focus();
        this.open(entries[next].dataset.group, 'focus');
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        this.open(trigger.dataset.group, 'focus');
        const choices = [...this.list.querySelectorAll('button[data-item]')];
        (event.key === 'ArrowUp' ? choices.at(-1) : choices[0])?.focus();
      }
      return;
    }
    if (!this.isOpen || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const choices = [...this.list.querySelectorAll('button[data-item]')];
    const index = choices.indexOf(event.target);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1 :
      (index + (event.key === 'ArrowDown' ? 1 : -1) + choices.length) % choices.length;
    choices[next].focus();
  }

  /** Mirror controller selection without opening a disclosure or moving focus. */
  syncSelection(selection) {
    this.selected = selection;
    for (const [group, button] of this.buttons) {
      const current = group === selection.group;
      button.classList.toggle('active', current);
      if (current) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    }
    for (const button of this.list.querySelectorAll('button[data-item]')) {
      if (button.dataset.item === selection.item) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    }
  }

  /** Cancel the single pending close, including when entering the flyout bridge. */
  cancelClose() { clearTimeout(this.closeTimer); this.closeTimer = 0; }

  /** A short bridge preserves hover entry; focus and explicit pinning take priority. */
  scheduleClose() {
    this.cancelClose();
    if (this.pinned || this.root.contains(document.activeElement)) return;
    this.closeTimer = window.setTimeout(() => {
      this.closeTimer = 0;
      if (!this.pointerInside && !this.root.contains(document.activeElement)) this.close();
    }, 220);
  }

  /**
   * Close idempotently. Escape/Close can restore the invoking button without
   * reopening it through its focus handler. Outside clicks retain their target.
   */
  close(restoreFocus = false) {
    this.cancelClose();
    if (!this.isOpen) return;
    const trigger = this.buttons.get(this.openGroup);
    this.openGroup = null;
    this.pinned = false;
    this.panel.hidden = true;
    delete this.root.dataset.open;
    for (const button of this.buttons.values()) button.setAttribute('aria-expanded', 'false');
    this.onOpenChange?.(false);
    if (restoreFocus && trigger) {
      this.restoringFocus = true;
      trigger.focus({preventScroll:true});
      this.restoringFocus = false;
    }
  }

  /** Release timers/listeners once; the immutable catalogue and controller survive. */
  destroy() {
    if (this.destroyed) return;
    this.close();
    this.destroyed = true;
    this.events.abort();
    this.buttons.clear();
    this.onSelect = null;
    this.onOpenChange = null;
  }
}
