import { useAvatar } from '@agentrepo/avatar';
import { LocaleProvider } from '@agentrepo/ui';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AvatarEasterEggProvider } from './avatar-provider';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

function ClickProbe() {
  const { registerAvatarClick } = useAvatar();
  return <button onClick={registerAvatarClick}>click-avatar</button>;
}

const renderWithLocale = (ui: ReactElement) =>
  render(<LocaleProvider>{ui}</LocaleProvider>);

describe('AvatarEasterEggProvider', () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('al quinto click navega al portfolio', () => {
    renderWithLocale(
      <AvatarEasterEggProvider>
        <ClickProbe />
      </AvatarEasterEggProvider>,
    );
    const button = screen.getByText('click-avatar');
    for (let i = 0; i < 4; i += 1) {
      fireEvent.click(button);
    }
    expect(push).not.toHaveBeenCalled();
    expect(window.localStorage.getItem('portfolioUnlocked')).toBeNull();

    fireEvent.click(button);
    expect(push).toHaveBeenCalledWith('/portfolio/luisbz');
  });
});
