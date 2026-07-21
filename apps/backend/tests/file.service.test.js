const assert = require('node:assert/strict');
const test = require('node:test');

const { buildFileKey } = require('../dist/functions/files-api/src/services/file.service');

test('buildFileKey namespaces uploaded files by workspace and timestamp', () => {
  const key = buildFileKey('workspace-a', 'report.pdf', 1710000000000);

  assert.equal(key, 'workspace-a/1710000000000-report.pdf');
});
