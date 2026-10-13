const assert = require('assert').strict;
const path = require('path');
const { spawnSync } = require('child_process');

const repo = path.resolve(__dirname, '../../..');
const run = (args, options = {}) => {
  const encoding = Object.prototype.hasOwnProperty.call(options, 'encoding') ? options.encoding : 'utf8';
  const result = spawnSync('git', args, { cwd: repo, encoding, input: options.input, maxBuffer: 300 * 1024 * 1024 });
  assert.equal(result.status, 0, `git ${args.join(' ')} failed: ${String(result.stderr || result.error || '').trim()}`);
  return result.stdout;
};

const commits = run(['rev-list', '--all']).trim().split(/\r?\n/).filter(Boolean);
const objectLines = run(['rev-list', '--objects', '--all']).trim().split(/\r?\n/).filter(Boolean);
const pathsByHash = new Map();
const historicalPaths = new Set();
for (const line of objectLines) {
  const separator = line.indexOf(' ');
  if (separator < 0) continue;
  const hash = line.slice(0, separator), relative = line.slice(separator + 1).replace(/\\/g, '/');
  historicalPaths.add(relative);
  const paths = pathsByHash.get(hash) || [];
  paths.push(relative);
  pathsByHash.set(hash, paths);
}

const forbiddenArtifactPaths = [...historicalPaths].filter(relative => {
  const lower = relative.toLowerCase();
  if (/(^|\/)node_modules\//.test(lower) || /(^|\/)vendor\//.test(lower)) return false;
  if (/\.(pem|p12|pfx)$/i.test(relative) || /(^|\/)\.env(?:\.|$)/i.test(relative)) return true;
  return /(^|\/)(?:records?|exports?|backups?|saved[-_ ]?copies)(?:\/|[^/]*\.(?:json|csv|xlsx?|pdf)$)/i.test(relative);
});
assert.deepEqual(forbiddenArtifactPaths, [], 'Reachable Git history must not contain credential files or private record/export/backup artifacts.');

const textExtension = /\.(?:cjs|css|env|html|js|json|key|md|mjs|pem|toml|txt|yaml|yml)$/i;
const candidateHashes = [...pathsByHash].filter(([, paths]) => paths.some(relative => textExtension.test(relative) && !/(^|\/)vendor\//i.test(relative))).map(([hash]) => hash);
const checked = run(['cat-file', '--batch-check'], { input: `${candidateHashes.join('\n')}\n` }).trim().split(/\r?\n/);
const textBlobs = [];
for (let index = 0; index < candidateHashes.length; index += 1) {
  const [, type, sizeText] = checked[index].split(' ');
  if (type === 'blob') textBlobs.push({ hash: candidateHashes[index], size: Number(sizeText) });
}

const sources = new Map();
const batches = [];
for (const item of textBlobs) {
  let group = batches.at(-1);
  if (!group || group.bytes + item.size + 100 > 64 * 1024 * 1024) batches.push(group = { bytes: 0, items: [] });
  group.items.push(item);
  group.bytes += item.size + 100;
}
for (const group of batches) {
  const batch = run(['cat-file', '--batch'], { input: `${group.items.map(item => item.hash).join('\n')}\n`, encoding: null });
  let offset = 0;
  for (const expected of group.items) {
    const newline = batch.indexOf(10, offset);
    assert(newline >= 0, 'Git batch output must contain an object header.');
    const header = batch.subarray(offset, newline).toString('utf8').split(' ');
    const size = Number(header[2]);
    assert.equal(header[0], expected.hash, 'Git batch output must preserve requested blob order.');
    assert.equal(header[1], 'blob', 'History safety scan must read blobs only.');
    sources.set(expected.hash, batch.subarray(newline + 1, newline + 1 + size).toString('utf8'));
    offset = newline + 1 + size + 1;
  }
}

const secretPatterns = [
  ['private key', new RegExp(['-----BEGIN ', '(?:RSA |EC |OPENSSH )?', 'PRIVATE', ' KEY-----'].join(''))],
  ['GitHub token', /github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{30,}/],
  ['AWS access key', /AKIA[0-9A-Z]{16}/],
  ['Google API key', /AIza[0-9A-Za-z_-]{30,}/],
  ['Stripe live key', /sk_live_[0-9A-Za-z]{16,}/],
  ['Slack token', /xox[baprs]-[0-9A-Za-z-]{10,}/]
];
const secretHits = [];
for (const [hash, source] of sources) for (const [kind, pattern] of secretPatterns) {
  if (pattern.test(source)) secretHits.push({ hash, paths: pathsByHash.get(hash), kind });
}
assert.deepEqual(secretHits, [], 'Reachable Git history must not contain high-confidence committed secrets.');

console.log(`TNA G11 Git history safety passed: ${commits.length} commits, ${objectLines.length} reachable objects, ${sources.size} unique text blobs, ${historicalPaths.size} historical paths; no high-confidence secret or private record artifact hit`);
