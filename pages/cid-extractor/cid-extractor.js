/* CID Extractor — standalone extraction/copy for the controls in this page.
   Former tracking-upload code referenced elements that are not present in
   cid-extractor.html, causing a null.value exception before event listeners
   were registered. Tracking Sheet upload is intentionally not initialized here. */
(() => {
  'use strict';

  const input = document.getElementById('cidInput');
  const output = document.getElementById('cidOutput');
  const extractBtn = document.getElementById('extractCidBtn');
  const clearBtn = document.getElementById('clearCidBtn');
  const copyBtn = document.getElementById('copyCidBtn');
  const count = document.getElementById('cidCount');

  if (![input, output, extractBtn, clearBtn, copyBtn, count].every(Boolean)) {
    console.error('CID Extractor: required page elements are missing.');
    return;
  }

  // CarryBee CID: 11 alphanumeric characters, starting F/R/C/E,
  // containing at least one digit. Non-alphanumeric separators are accepted.
  // Do not pick partial IDs out of longer alphanumeric strings.
  const cidPattern = /(?:^|[^A-Z0-9])([FRCE][A-Z0-9]{10})(?![A-Z0-9])/gi;

  function parseCIDs(source) {
    const found = new Set();
    for (const match of source.matchAll(cidPattern)) {
      const cid = match[1].toUpperCase();
      if (/\d/.test(cid)) found.add(cid);
    }
    return [...found];
  }

  function extractCIDs() {
    const cids = parseCIDs(input.value);
    output.value = cids.join('\n');
    count.textContent = cids.length + 'টি unique CID পাওয়া গেছে';
    if (!cids.length && input.value.trim()) {
      count.textContent += ' — ১১ অক্ষরের valid CID পাওয়া যায়নি';
    }
    return cids;
  }

  extractBtn.addEventListener('click', extractCIDs);

  clearBtn.addEventListener('click', () => {
    input.value = '';
    output.value = '';
    count.textContent = '0 unique CID পাওয়া গেছে';
    input.focus();
  });

  copyBtn.addEventListener('click', async () => {
    const text = output.value.trim();
    if (!text) {
      alert('আগে CID বের করুন, তারপর Copy করুন।');
      return;
    }

    let copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch (err) {
      // Clipboard permission may be denied in the dashboard iframe.
    }
    if (!copied) {
      output.focus();
      output.select();
      try { copied = document.execCommand('copy'); }
      catch (err) { copied = false; }
    }
    if (!copied) {
      alert('Auto-copy blocked. CID list select করা আছে—Ctrl+C চাপুন।');
      return;
    }
    const original = copyBtn.textContent;
    copyBtn.textContent = '✓ Copied';
    setTimeout(() => { copyBtn.textContent = original; }, 1500);
  });
})();
