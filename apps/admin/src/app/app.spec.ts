import fs from 'fs';
import path from 'path';
import layout from './layout';
import page from './page';
import { describe, expect, it } from "vitest";

describe('admin app (Next)', () => {
  it('loads `layout` and `page` modules without throwing', () => {
    expect(layout).toBeDefined();
    expect(page).toBeDefined();
  });

  it('has a next.config.js that exports an object or function', () => {
    const cfgPath = path.resolve(__dirname, '../../next.config.js');
    expect(fs.existsSync(cfgPath)).toBe(true);
    const cfg = require(cfgPath);
    expect(cfg).toBeDefined();
    const t = typeof cfg;
    expect(t === 'object' || t === 'function').toBe(true);
  });
});
