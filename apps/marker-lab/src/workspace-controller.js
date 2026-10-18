/*
 * Marker Lab workspace controller.
 * Owner: VESA shell integration, iframe availability and optional scoped
 * offline-worker registration. It must not alter SVGnest's algorithm or read
 * sibling VESA domain records. SVG files are opened/downloaded by SVGnest.
 *
 * Entry point: new VesaMarkerLabWorkspace(document).mount().
 * State: one frame readiness flag per page; no business records or network API.
 * Failure: if the vendored engine is missing, show an explicit install warning.
 */
class VesaMarkerLabWorkspace {
  constructor(doc) {
    if (!doc?.getElementById('nestEditor')) throw new TypeError('The marker editor frame is required.');
    this.doc = doc;
    this.frame = doc.getElementById('nestEditor');
    this.status = doc.getElementById('markerState');
    this.ready = false;
    this.shell = null;
    this.copy = {
      en: {
        eyebrow:'OFFLINE EXPERIMENTAL WORKSPACE', title:'Marker & Fabric Utilization Lab',
        description:'Arrange SVG shapes to explore possible fabric or material utilization. Uses the open-source SVGnest engine locally in your browser.',
        warning:'Prototype only. NOT an approved garment cutting marker: grain, nap, checks, stripes and cut allowances require separate verification.',
        helpTitle:'Using the nesting lab', help:'Choose Demo, or Upload SVG with closed outlined shapes. Choose the material boundary, start optimization, then Download SVG. Files are processed in this browser.',
        loading:'Opening local nesting editor…', ready:'Local SVGnest editor is ready. Choose Demo or Upload SVG.',
        failed:'Editor assets are not installed yet. The approved source needs to be bundled and verified before this pilot can be used.'
      },
      bn: {
        eyebrow:'অফলাইন পরীক্ষামূলক ওয়ার্কস্পেস', title:'মার্কার ও ফ্যাব্রিক ব্যবহার ল্যাব',
        description:'SVG আকৃতি সাজিয়ে সম্ভাব্য ম্যাটেরিয়াল ব্যবহারের পরিমাণ যাচাই করুন। SVGnest ব্রাউজারেই চলে।',
        warning:'এটি পরীক্ষামূলক। গ্রেইন, ন্যাপ, চেক, স্ট্রাইপ ও কাটিং অ্যালাউন্স যাচাই ছাড়া ফ্যাক্টরি কাটিং মার্কার নয়।',
        helpTitle:'কীভাবে ব্যবহার করবেন', help:'Demo বা Upload SVG বেছে নিন। বাউন্ডারি নির্বাচন করে Start Nest চাপুন, পরে Download SVG করুন। ফাইল এই ব্রাউজারেই থাকে।',
        loading:'লোকাল এডিটর খুলছে…', ready:'লোকাল SVGnest প্রস্তুত। Demo বা Upload SVG বেছে নিন।',
        failed:'এডিটর ফাইল এখনো ইনস্টল হয়নি; যাচাইকৃত ফাইল প্রয়োজন।'
      },
      hi: {
        eyebrow:'ऑफ़लाइन प्रयोगात्मक वर्कस्पेस', title:'मार्कर और फैब्रिक उपयोग लैब',
        description:'SVG आकारों को रखकर सामग्री की संभावित बचत देखें। SVGnest ब्राउज़र में चलता है।',
        warning:'केवल प्रयोग। ग्रेन, नैप, चेक, स्ट्राइप और कटिंग अलाउंस की जाँच बिना फैक्ट्री कटिंग मार्कर नहीं है।',
        helpTitle:'कैसे इस्तेमाल करें', help:'Demo या Upload SVG चुनें। मटेरियल सीमा चुनकर Start Nest दबाएँ, फिर Download SVG करें। फ़ाइलें इसी ब्राउज़र में रहती हैं।',
        loading:'लोकल एडिटर खुल रहा है…', ready:'लोकल SVGnest तैयार है। Demo या Upload SVG चुनें।',
        failed:'एडिटर की फाइलें अभी इंस्टॉल नहीं हैं; पहले सत्यापित बिल्ड चाहिए।'
      },
      ta: {
        eyebrow:'OFFLINE பரிசோதனை WORKSPACE', title:'Marker & Fabric Utilization Lab',
        description:'SVG pattern shapes-ஐ arrange செய்து material utilization-ஐ ஆய்வு செய்யலாம். SVGnest browser-க்குள்ளேயே இயங்கும்.',
        warning:'இது பரிசோதனை மட்டுமே. Grain, nap, checks, stripes, cutting allowance ஆகியவற்றைச் சரிபார்க்காமல் factory cutting marker-ஆக பயன்படுத்தக்கூடாது.',
        helpTitle:'பயன்படுத்தும் முறை', help:'Demo அல்லது Upload SVG தேர்வு செய்யவும். Fabric boundary தேர்வு செய்து Start Nest அழுத்தவும்; பின்னர் Download SVG செய்யவும். Files உங்கள் browser-லேயே இருக்கும்.',
        loading:'Local editor திறக்கப்படுகிறது…', ready:'SVGnest தயாராக உள்ளது. Demo அல்லது Upload SVG தேர்வு செய்யவும்.',
        failed:'Editor files இன்னும் நிறுவப்படவில்லை. Verified offline build தேவை.'
      }
    };
  }

  /** Return user-selected language without changing source SVG data or storage. */
  language() {
    const code = window.VesaPrefs?.read?.()?.language || 'en';
    return Object.hasOwn(this.copy, code) ? code : 'en';
  }

  /** Update only the lab's authored help and status copy, never SVGnest UI. */
  translate() {
    const message = this.copy[this.language()];
    this.doc.querySelectorAll('[data-marker-copy]').forEach(node => {
      const value = message[node.dataset.markerCopy];
      if (value) node.textContent = value;
    });
    this.status.textContent = message[this.ready ? 'ready' : 'loading'];
  }

  /** Mount exactly one platform-owned header; no duplicated app account bar. */
  mount() {
    const session = window.VesaAuth?.session?.();
    this.shell = new window.VesaWorkspaceShell.VesaWorkspaceShell({
      root: this.doc.body,
      descriptor: {
        id: 'marker-lab', name: 'Marker & Fabric Utilization Lab',
        route: '/apps/marker-lab/', savedState: 'Files stay on this device',
        userLabel: session?.name || session?.email || '', userRole: session?.role || ''
      },
      callbacks: { menu: name => this.menu(name) }
    });
    this.shell.mount();
    this.translate();
    window.addEventListener('vesa-preferences-change', () => this.translate());
    this.frame.addEventListener('load', () => this.onFrameLoad());
    return this;
  }

  /** Verify actual local upstream runtime before reporting availability. */
  async onFrameLoad() {
    try {
      const child = this.frame.contentWindow;
      if (!child?.SvgNest || !child?.document?.getElementById('demo')) throw new Error('SVGnest runtime not found');
      this.ready = true;
      this.status.textContent = this.copy[this.language()].ready;
      // The scoped worker precaches an exact manifest generated from vendored
      // bytes. It never caches another VESA app or sends order data online.
      if ('serviceWorker' in navigator && window.isSecureContext) {
        try {
          await navigator.serviceWorker.register('/apps/marker-lab/service-worker.js', { scope:'/apps/marker-lab/' });
        } catch {
          this.status.textContent += ' Offline install not verified on this device.';
        }
      }
    } catch {
      this.ready = false;
      this.status.textContent = this.copy[this.language()].failed;
    }
  }

  /** Universal header delegates only lab-local actions, preserving shell ownership. */
  menu(name) {
    if (name === 'Edit') return this.shell.openSettings();
    if (name === 'Home') return this.doc.getElementById('markerLabMain').scrollIntoView({block:'start'});
    if (name === 'Help') return this.doc.getElementById('markerHelp').scrollIntoView({block:'start'});
    if (name === 'File' && this.ready) {
      const input = this.frame.contentDocument?.getElementById('fileinput');
      if (input) return input.click();
    }
    if (name === 'View' || name === 'Tools') return this.frame.focus();
    this.status.textContent = this.ready ? this.copy[this.language()].ready : this.copy[this.language()].failed;
  }
}