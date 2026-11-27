/**
 * GarmentDetails owns visual-zone metadata, transparent-pixel rejection and the inspection
 * UI. MotionExperience supplies immutable records and routes pointer/layout events here.
 * It never changes catalogue selection, playback preference or stored image bytes.
 * One active alpha mask is decoded asynchronously; stale results are discarded by token.
 * Zones are approximate garment bands, not segmentation of skin, fabric or accessories.
 */
class GarmentDetails {
  /**
   * Bind persistent annotation controls once; callers next call update(record).
   * State: active record, bands, pinned selection, normalized pointer and one alpha mask.
   * Dependencies: root DOM with the documented detail hooks; Image and 2D Canvas APIs.
   * DOM listeners are released by destroy(); a failed mask disables pointer hit testing,
   * while explicit garment buttons continue to provide the product information.
   */
  constructor(root) {
    this.root = root;
    this.controls = root.querySelector('#garment-switch');
    this.summary = root.querySelector('#detail-summary');
    this.callout = root.querySelector('#garment-callout');
    this.pin = root.querySelector('#garment-pin');
    this.line = root.querySelector('#garment-line');
    this.path = root.querySelector('#callout-path');
    this.hint = root.querySelector('#detail-hint');
    this.announcement = root.querySelector('#detail-announcement');
    this.record = null;
    this.zones = [];
    this.active = null;
    this.pinned = false;
    this.point = null;
    this.mask = null;
    this.maskRequest = 0;
    this.destroyed = false;
    this.listeners = new AbortController();
    this.controls.addEventListener('click', event => {
      const button = event.target.closest('button[data-zone]');
      if (!button || button.hidden) return;
      const zone = this.zones.find(item => item.key === button.dataset.zone);
      if (!zone) return;
      if (this.pinned && this.active?.key === zone.key) this.clear();
      else this.show(zone, null, true);
    }, { signal: this.listeners.signal });
    // These visual descriptions and bands are preserved from the independently checked V6 map.
    // Primary zone, companion description, garment split/hem, bottom hem; normalized image space.
    this.looks=Object.freeze({
      M01:['top','Dark trousers',.49,.94],M02:['top','Dark trousers',.49,.94],M03:['top','Beige trousers',.49,.94],M04:['top','Grey trousers',.49,.94],M05:['top','Black trousers',.49,.94],M06:['top','Beige trousers',.49,.94],M07:['top','Navy trousers',.49,.94],M08:['top','Beige trousers',.49,.94],M09:['top','Beige trousers',.49,.94],M10:['top','Navy trousers',.49,.94],M11:['top','Beige trousers',.51,.94],M12:['top','Dark trousers',.51,.94],M13:['bottom','Crew-neck tee',.49,.94],M14:['bottom','Crew-neck tee',.49,.94],M15:['bottom','Hoodie',.51,.94],M16:['top','Beige trousers',.51,.94],M17:['top','Beige trousers',.51,.94],M18:['top','Beige trousers',.51,.94],M19:['top','Beige trousers',.51,.94],M20:['top','Dark trousers',.51,.94],M21:['bottom','Crew-neck tee',.49,.68],M22:['bottom','Crew-neck tee',.49,.69],M23:['bottom','Crew-neck tee',.49,.69],M24:['bottom','Polo shirt',.49,.69],M25:['bottom','Crew-neck tee',.49,.64],M26:['bottom','Crew-neck tee',.49,.67],M27:['bottom','Crew-neck tee',.49,.94],M28:['bottom','Polo shirt',.49,.94],M29:['bottom','Crew-neck tee',.49,.94],M30:['bottom','Crew-neck tee',.49,.94],M31:['top','Grey trousers',.49,.94],M32:['top','Navy shorts',.49,.67],M33:['bottom','Crew-neck tee',.49,.94],M34:['bottom','Crew-neck tee',.49,.67],
      L01:['top','Navy trousers',.49,.94],L02:['top','Dark trousers',.49,.94],L03:['top','Beige trousers',.49,.94],L04:['top','Grey trousers',.49,.94],L05:['top','Cream trousers',.49,.94],L06:['top','Beige trousers',.49,.94],L07:['top','Beige trousers',.49,.94],L08:['top','Wide-leg trousers',.40,.94],L09:['top','Navy trousers',.51,.94],L10:['top','Dark trousers',.51,.94],L11:['top','Navy trousers',.49,.94],L12:['top','Black trousers',.47,.94],L13:['top','Beige trousers',.49,.94],L14:['top','Denim jeans',.52,.94],L15:['top','Denim jeans',.51,.94],L16:['top','White trousers',.61,.94],L17:['bottom','Sweatshirt',.51,.94],L18:['bottom','Crew-neck tee',.42,.65],L19:['bottom','Crew-neck tee',.42,.64],L20:['bottom','Crew-neck tee',.44,.65],L21:['bottom','Crew-neck tee',.44,.64],L22:['bottom','Blouse',.48,.93],L23:['bottom','Sweatshirt',.50,.94],L24:['bottom','Short-sleeve top',.43,.94],L25:['bottom','Crew-neck tee',.40,.79],L26:['bottom','Crew-neck tee',.39,.65],L27:['one',null,.79],L28:['one',null,.80],L29:['one',null,.80],
      K01:['top','Beige trousers',.49,.92],K02:['top','Navy trousers',.49,.92],K03:['top','Navy trousers',.49,.92],K04:['top','Cargo shorts',.49,.70],K05:['top','Dark trousers',.52,.92],K06:['top','Navy trousers',.52,.92],K07:['bottom','Tank top',.49,.70],K08:['bottom','Color-block tee',.50,.72],K09:['bottom','Pocket tee',.50,.69],K10:['bottom','Rashguard top',.49,.68],K11:['bottom','Graphic tee',.49,.92],K12:['bottom','Crew-neck tee',.48,.92],K13:['top','Denim shorts',.46,.66],K14:['top','Pink shorts',.46,.66],K15:['top','Sport shorts',.48,.66],K16:['bottom','Hoodie',.49,.92],K17:['bottom','Crew-neck tee',.43,.67],K18:['bottom','Short-sleeve top',.43,.65],K19:['bottom','Printed top',.44,.66],K20:['one',null,.72],K21:['one',null,.67],K22:['bottom','Printed shirt',.43,.67],K23:['top','Denim shorts',.44,.65],K24:['top','Navy joggers',.49,.92],K25:['one',null,.70],K26:['top','Blue shorts',.55,.75],K27:['bottom','Striped polo',.58,.77],K28:['one',null,.76]
    });
    // New assets retain their full native portrait canvas. The final value is the
    // observed shoulder/product start in that canvas; original91 bands stay frozen.
    // Whole outfits and unworn products expose one band, with no invented companion.
    this.expandedLooks = Object.freeze({
      K29:['top','Navy straight trousers',.53,.92,.18],
      K30:['bottom','Light grey crew-neck tee',.42,.92,.18],
      K31:['one',null,.92,null,.20],
      K32:['top','Grey straight trousers',.52,.92,.19],
      K33:['top','Charcoal straight trousers',.52,.93,.18],
      K34:['one',null,.93,null,.17],
      K35:['top','Navy swim shorts',.52,.66,.19],
      K36:['one',null,.94,null,.17],
      K37:['bottom','White crew-neck tee',.40,.93,.18],
      K38:['one',null,.79,null,.29],
      K39:['top','Navy straight trousers',.53,.94,.18],
      K40:['bottom','Ivory crew-neck tee',.40,.92,.19],
      K41:['top','Navy straight trousers',.53,.92,.20],
      K42:['top','Navy straight trousers',.54,.94,.17],
      K43:['one',null,.94,null,.18],
      K44:['bottom','Light blue polo',.40,.70,.17],
      K45:['top','Navy swim shorts',.52,.70,.18],
      K46:['one',null,.94,null,.17],
      K47:['top','Navy straight trousers',.54,.92,.18],
      K48:['one',null,.78,null,.25],
      K49:['one',null,.742,null,.245],
      K50:['one',null,.86,null,.294],
      K51:['bottom','White T-shirt',.45,.92,.24],
      K52:['top','Cream trousers',.58,.94,.24],
      K53:['top','Grey trousers',.58,.93,.22],
      K54:['one',null,.99,null,.24],
      K55:['one',null,.97,null,.05],
      K56:['one',null,.93,null,.23],
      K57:['one',null,.73,null,.235],
      K58:['one',null,.808,null,.247]
    });
  }

  /**
   * Switch to an immutable record, clear stale inspection and load its alpha mask.
   * Persistent buttons prevent loss of keyboard focus during manual slide changes.
   * Missing category annotations throw instead of displaying an invented garment name.
   */
  update(record) {
    this.clear();
    const specification = this.looks[record.id] || this.expandedLooks[record.id];
    if (!specification) throw new Error('Missing garment annotation: ' + record.id);
    this.record = record;
    const [primary, companion, split, end] = specification;
    const start = specification[4] ?? (record.group === 'baby' ? .29 : ['boys', 'girls'].includes(record.group) ? .19 : .17);
    this.zones = primary === 'one'
      ? [{ key: 'one', kind: record.presentation === 'product' ? 'Product' : 'Garment', name: record.name, primary: true, start, end: split }]
      : [
        { key: 'top', kind: 'Top', name: primary === 'top' ? record.name : companion, primary: primary === 'top', start, end: split },
        { key: 'bottom', kind: 'Bottom', name: primary === 'bottom' ? record.name : companion, primary: primary === 'bottom', start: split, end }
      ];
    const previouslyFocused = this.root.ownerDocument.activeElement;
    for (const button of this.controls.querySelectorAll('button[data-zone]')) {
      const zone = this.zones.find(item => item.key === button.dataset.zone);
      button.hidden = !zone;
      button.setAttribute('aria-pressed', 'false');
      if (button.dataset.zone === 'one') button.textContent = zone?.kind || 'Garment';
      if (zone) button.setAttribute('aria-label', 'Inspect ' + zone.kind.toLowerCase() + ': ' + zone.name);
    }
    if (previouslyFocused && this.controls.contains(previouslyFocused) && previouslyFocused.hidden) {
      this.controls.querySelector('button:not([hidden])')?.focus({ preventScroll: true });
    }
    this.maskPromise = this.prepareMask(record);
  }

  /** Decode only the active record into a read-only alpha mask; stale/failed work returns false. */
  async prepareMask(record) {
    const request = ++this.maskRequest;
    this.mask = null;
    try {
      const image = new Image();
      image.src = record.image;
      await image.decode();
      if (this.destroyed || request !== this.maskRequest) return false;
      const canvas = this.root.ownerDocument.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return false;
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const alpha = new Uint8Array(canvas.width * canvas.height);
      for (let index = 0; index < alpha.length; index++) alpha[index] = pixels[index * 4 + 3];
      this.mask = { id: record.id, width: canvas.width, height: canvas.height, alpha };
      return true;
    } catch {
      // Explicit controls remain usable if browser image/canvas support fails.
      if (request === this.maskRequest) this.mask = null;
      return false;
    }
  }

  /** Read-only state used by the controller to suspend automatic slide changes. */
  get inspecting() { return this.active !== null; }

  /**
   * Return the contained image pixels' client rectangle, excluding letterbox space.
   * The CSS contract is object-fit:contain, object-position:center bottom, no rotation.
   * A still-decoding or stale scene returns null; it cannot receive pointer inspection.
   */
  imageRect() {
    const image = this.root.querySelector('.cast.active .hero img');
    if (!image || !image.complete || !image.naturalWidth || image.parentElement.dataset.id !== this.record?.id) return null;
    const box = image.getBoundingClientRect();
    const scale = Math.min(box.width / image.naturalWidth, box.height / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const left = box.left + (box.width - width) / 2;
    const top = box.bottom - height;
    return { left, top, width, height, right: left + width, bottom: top + height };
  }

  /** Return active-mask alpha for normalized coordinates, or zero outside known pixels. */
  alphaAt(x, y) {
    const mask = this.mask;
    if (!mask || mask.id !== this.record?.id || x < 0 || y < 0 || x >= 1 || y >= 1) return 0;
    return mask.alpha[Math.floor(y * mask.height) * mask.width + Math.floor(x * mask.width)];
  }

  /**
   * Identify an approximate garment band only over a sufficiently opaque model pixel.
   * Transparent holes and image margins never count as a garment. Skin/fabric boundaries
   * remain approximate; the explicit Top/Bottom/Garment controls are the precise selector.
   */
  hit(clientX, clientY) {
    const rectangle = this.imageRect();
    if (!rectangle || !rectangle.width || !rectangle.height) return null;
    const x = (clientX - rectangle.left) / rectangle.width;
    const y = (clientY - rectangle.top) / rectangle.height;
    if (x < .13 || x > .87 || this.alphaAt(x, y) < 96) return null;
    return this.zones.find(zone => y >= zone.start && y < zone.end) || null;
  }

  /** Follow a mouse over a settled model; pinned and non-mouse pointers stay unchanged. */
  hover(event) {
    if (this.pinned || event.pointerType !== 'mouse') return;
    const zone = this.hit(event.clientX, event.clientY);
    if (zone) this.show(zone, { x: event.clientX, y: event.clientY }, false);
    else this.clear();
  }

  /** Pin one garment from a click/tap; the same zone or blank space dismisses inspection. */
  tap(event) {
    const zone = this.hit(event.clientX, event.clientY);
    if (!zone || this.pinned && this.active?.key === zone.key) this.clear();
    else this.show(zone, { x: event.clientX, y: event.clientY }, true);
  }

  /**
   * Set selected region and label. Client coordinates are normalized so scroll/resize
   * does not detach the pin from its garment. Text is inserted safely with textContent.
   */
  show(zone, point, pinned) {
    const changed = this.active?.key !== zone.key;
    this.active = zone;
    this.pinned = pinned;
    const rectangle = this.imageRect();
    this.point = point && rectangle
      ? { x: (point.x - rectangle.left) / rectangle.width, y: (point.y - rectangle.top) / rectangle.height }
      : null;
    if (changed) {
      const role = zone.kind === 'Product' ? 'Unworn view' : zone.primary ? 'Product' : 'Styled with';
      for (const prefix of ['detail', 'callout']) {
        this.root.querySelector('#' + prefix + '-kind').textContent = zone.kind;
        this.root.querySelector('#' + prefix + '-name').textContent = zone.name;
        this.root.querySelector('#' + prefix + '-role').textContent = role;
      }
      for (const button of this.controls.querySelectorAll('button[data-zone]')) {
        button.setAttribute('aria-pressed', String(button.dataset.zone === zone.key));
      }
      if (this.announcement) this.announcement.textContent = zone.kind + ': ' + zone.name + '. ' + role + '.';
    }
    if (this.hint) this.hint.hidden = true;
    this.position();
  }

  /** Pick an opaque anchor near the center of the selected band; do not mark a leg gap. */
  anchor() {
    const y = (this.active.start + this.active.end) / 2;
    for (const x of [.52, .48, .56, .44, .60, .40, .64, .36, .68, .32]) {
      if (this.alphaAt(x, y) >= 96) return { x, y };
    }
    return { x: .52, y };
  }

  /**
   * Position on pointer/layout events, not every frame. Desktop callouts sit outside
   * the model's pixel rectangle when space allows; narrow layouts use the reserved
   * readout below the controls. A missing image keeps the readable summary available.
   */
  position() {
    if (!this.active) return;
    const rectangle = this.imageRect();
    this.summary.hidden = false;
    this.callout.hidden = true;
    this.pin.hidden = true;
    this.line.hidden = true;
    if (!rectangle) return;
    const host = this.root.getBoundingClientRect();
    const local = this.point || this.anchor();
    const x = rectangle.left - host.left + rectangle.width * local.x;
    const y = rectangle.top - host.top + rectangle.height * local.y;
    this.pin.hidden = false;
    this.pin.style.left = x + 'px';
    this.pin.style.top = y + 'px';
    if (host.width <= 700) return;

    // Prefer outside-right placement. If neither side fits, use the in-flow detail panel.
    this.callout.hidden = false;
    const width = this.callout.offsetWidth;
    const height = this.callout.offsetHeight;
    const right = rectangle.right - host.left + 20;
    const left = rectangle.left - host.left - width - 20;
    const copy = this.root.querySelector('#copy').getBoundingClientRect();
    let position = null;
    if (right + width <= host.width - 16) position = right;
    else if (left >= copy.right - host.left + 20) position = left;
    if (position === null) {
      this.callout.hidden = true;
      return;
    }
    this.summary.hidden = true;
    const header = this.root.querySelector('.masthead').getBoundingClientRect();
    const footer = this.root.querySelector('.control-zone').getBoundingClientRect();
    const top = Math.max(header.bottom - host.top + 10, Math.min(footer.top - host.top - height - 12, y - height / 2));
    this.callout.style.left = position + 'px';
    this.callout.style.top = top + 'px';
    const endX = position > x ? position : position + width;
    const endY = top + height / 2;
    this.path.setAttribute('d', 'M ' + x + ' ' + y + ' L ' + ((x + endX) / 2) + ' ' + y + ' L ' + endX + ' ' + endY);
    this.line.hidden = false;
  }

  /** Dismiss transient inspection without removing controls or changing the current record. */
  clear() {
    this.active = null;
    this.pinned = false;
    this.point = null;
    this.callout.hidden = true;
    this.summary.hidden = true;
    this.pin.hidden = true;
    this.line.hidden = true;
    if (this.hint) this.hint.hidden = false;
    if (this.announcement) this.announcement.textContent = '';
    for (const button of this.controls.querySelectorAll('button[data-zone]')) button.setAttribute('aria-pressed', 'false');
  }

  /** Release owned listeners/mask and invalidate asynchronous work before removing a section. */
  destroy() {
    this.destroyed = true;
    this.maskRequest++;
    this.listeners.abort();
    this.clear();
    this.mask = null;
  }
}
