(function () {
  'use strict';
  const FORMAT = 'VESA-NEXT-APP-SAVED-COPY';
  const VERSION = 1;
  const MAX_BYTES = 5 * 1024 * 1024;

  function encode(record) {
    return JSON.stringify({ format: FORMAT, version: VERSION, exportedAt: new Date().toISOString(), record });
  }

  function decode(text) {
    if (new Blob([text]).size > MAX_BYTES) throw new Error('Saved copy exceeds the approved size limit.');
    const envelope = JSON.parse(text);
    if (envelope?.format !== FORMAT || envelope.version !== VERSION || !envelope.record) {
      throw new Error('This is not a supported Next App saved copy.');
    }
    return structuredClone(envelope.record);
  }

  function safeSpreadsheetCell(value) {
    const text = String(value ?? '');
    return /^[=+\-@]/.test(text) ? `'${text}` : text;
  }

  window.VesaNextAppRecordPort = Object.freeze({ FORMAT, VERSION, MAX_BYTES, encode, decode, safeSpreadsheetCell });
})();
