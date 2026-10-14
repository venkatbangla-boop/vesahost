/* Copy these values into the existing central owners after the future app is approved. */
const catalogueEntry = Object.freeze({
  id: 'next-app',
  name: 'Next VESA App',
  shortName: 'NEXT',
  description: 'Replace with the approved user-facing purpose.',
  route: '/apps/next-app/',
  enabled: true,
  order: 40,
  openLabelKey: 'openNextApp'
});

const openLabels = Object.freeze({
  en: 'Open Next App',
  bn: 'Next App খুলুন',
  hi: 'Next App खोलें',
  ta: 'Next App திறக்கவும்'
});

if (typeof module !== 'undefined') module.exports = { catalogueEntry, openLabels };
