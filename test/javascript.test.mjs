import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeJavaScriptApplication } from '../src/providers/javascript.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('JavaScript provider', () => {
  it('should analyze the project directory itself', async () => {
    const result = await analyzeJavaScriptApplication(path.join(__dirname, '..'));
    assert.ok(result.findings.length >= 0);
    assert.equal(result.targetType, 'javascript');
  });
});
