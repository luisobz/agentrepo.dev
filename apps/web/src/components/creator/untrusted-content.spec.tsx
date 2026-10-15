import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { MarkdownContent } from '@agentrepo/ui';
afterEach(cleanup);
it('renders submitted Markdown without executing HTML, JavaScript URLs or MDX expressions', () => {
  const source =
    '<script>globalThis.compromised=true</script>\n\n<img src="x" onerror="globalThis.compromised=true">\n\n<iframe srcdoc="evil"></iframe>\n\n[unsafe](javascript:alert(1))\n\n{process.env.SECRET}\n\n```js\nrequire("child_process").execSync("whoami")\n```';
  const { container } = render(<MarkdownContent content={source} />);
  expect(container.querySelector('script,iframe,img,[onerror]')).toBeNull();
  expect(container.querySelector('a')?.getAttribute('href')).not.toContain(
    'javascript:',
  );
  expect(container.textContent).toContain('{process.env.SECRET}');
  expect(container.textContent).toContain('execSync');
});
