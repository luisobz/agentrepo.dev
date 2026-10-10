import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { AvatarProvider, useAvatar } from './avatar-context';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AvatarProvider initialSlot="hero">{children}</AvatarProvider>
);

describe('Avatar interaction focus', () => {
  it('keeps an open interaction focused and returns to the latest page context', () => {
    const { result } = renderHook(useAvatar, { wrapper });
    let release = () => {};
    act(() => {
      release = result.current.focusAvatar('mobile-menu');
    });
    expect(result.current.currentSlot).toBe('mobile-menu');
    act(() => result.current.setAvatarPosition('footer'));
    expect(result.current.currentSlot).toBe('mobile-menu');
    act(() => release());
    expect(result.current.currentSlot).toBe('footer');
  });

  it('releases nested interactions independently without reviving closed ones', () => {
    const { result } = renderHook(useAvatar, { wrapper });
    let releaseMenu = () => {};
    let releaseSearch = () => {};
    act(() => {
      releaseMenu = result.current.focusAvatar('mobile-menu');
    });
    act(() => {
      releaseSearch = result.current.focusAvatar('search');
    });
    expect(result.current.currentSlot).toBe('search');
    act(() => releaseMenu());
    expect(result.current.currentSlot).toBe('search');
    act(() => {
      releaseSearch();
      releaseSearch();
    });
    expect(result.current.currentSlot).toBe('hero');
  });
});
