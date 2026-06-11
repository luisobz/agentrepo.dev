import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AvatarProvider, useAvatar } from './avatar-context';

function Probe() {
  const { currentSlot, emotion, setAvatarPosition, setEmotion } = useAvatar();
  return (
    <div>
      <span data-testid="slot">{String(currentSlot)}</span>
      <span data-testid="emotion">{emotion}</span>
      <button onClick={() => setAvatarPosition('footer')}>move</button>
      <button onClick={() => setEmotion('happy')}>cheer</button>
      <button onClick={() => setAvatarPosition(null)}>hide</button>
    </div>
  );
}

describe('AvatarContext', () => {
  it('expone el estado por defecto (header / idle)', () => {
    render(
      <AvatarProvider>
        <Probe />
      </AvatarProvider>,
    );
    expect(screen.getByTestId('slot')).toHaveTextContent('header');
    expect(screen.getByTestId('emotion')).toHaveTextContent('idle');
  });

  it('setAvatarPosition mueve el avatar a otro slot', () => {
    render(
      <AvatarProvider>
        <Probe />
      </AvatarProvider>,
    );
    act(() => screen.getByText('move').click());
    expect(screen.getByTestId('slot')).toHaveTextContent('footer');
  });

  it('setAvatarPosition(null) oculta el avatar', () => {
    render(
      <AvatarProvider>
        <Probe />
      </AvatarProvider>,
    );
    act(() => screen.getByText('hide').click());
    expect(screen.getByTestId('slot')).toHaveTextContent('null');
  });

  it('setEmotion cambia la emoción sin tocar el slot', () => {
    render(
      <AvatarProvider>
        <Probe />
      </AvatarProvider>,
    );
    act(() => screen.getByText('cheer').click());
    expect(screen.getByTestId('emotion')).toHaveTextContent('happy');
    expect(screen.getByTestId('slot')).toHaveTextContent('header');
  });

  it('acepta initialSlot / initialEmotion como overrides', () => {
    render(
      <AvatarProvider initialSlot="sidebar" initialEmotion="thinking">
        <Probe />
      </AvatarProvider>,
    );
    expect(screen.getByTestId('slot')).toHaveTextContent('sidebar');
    expect(screen.getByTestId('emotion')).toHaveTextContent('thinking');
  });

  it('useAvatar fuera del provider lanza un error explicativo', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(
      'useAvatar must be used within an <AvatarProvider>',
    );
    spy.mockRestore();
  });
});
