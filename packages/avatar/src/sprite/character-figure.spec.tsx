import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { CharacterFigure } from './character-figure';
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: 'visible',
  });
});
it('uses the static pose when paused and loads only the selected atlas', () => {
  const { container } = render(
    <CharacterFigure character="guardian" clip="thinking" playing={false} />,
  );
  const figure = container.querySelector('svg');
  expect(figure).toHaveAttribute('data-frame', '3');
  expect(container.querySelectorAll('image')).toHaveLength(1);
  expect(container.querySelector('image')).toHaveAttribute(
    'href',
    '/avatars/guardian.png',
  );
});
it('finishes a raster one-shot and leaves no timer running', () => {
  vi.useFakeTimers();
  const { container } = render(
    <CharacterFigure character="developer" clip="surprised" />,
  );
  act(() => vi.advanceTimersByTime(2000));
  expect(container.querySelector('svg')).toHaveAttribute('data-frame', '4');
  expect(vi.getTimerCount()).toBe(0);
});
it('stops a raster loop when the document becomes hidden', () => {
  vi.useFakeTimers();
  const { container } = render(<CharacterFigure character="publisher" />);
  expect(vi.getTimerCount()).toBeGreaterThan(0);
  act(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(container.querySelector('svg')).toHaveAttribute(
    'data-animated',
    'false',
  );
  expect(vi.getTimerCount()).toBe(0);
});
