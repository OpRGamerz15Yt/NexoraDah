import test from 'node:test';
import assert from 'node:assert/strict';

test('project exposes an honest configuration contract', async () => {
  const packageJson = await import('../package.json', { with: { type: 'json' } });
  assert.equal(packageJson.default.name, 'nexora-prime-dashboard');
  assert.match(packageJson.default.scripts.build, /vite build/);
});