import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AvatarProvider, useAvatar, AVATAR_CLICK_SEQUENCE } from './avatar-context';

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

function ClickProbe() {
  const { emotion, isShaking, registerAvatarClick } = useAvatar();
  return (
    <div>
      <span data-testid="emotion">{emotion}</span>
      <span data-testid="shaking">{String(isShaking)}</span>
      <button onClick={registerAvatarClick}>click-avatar</button>
    </div>
  );
}

describe('AvatarContext — secuencia de clicks (easter egg)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderClickProbe(onSequenceComplete?: () => void) {
    return render(
      <AvatarProvider onSequenceComplete={onSequenceComplete}>
        <ClickProbe />
      </AvatarProvider>,
    );
  }

  function clickAvatar(times: number) {
    for (let i = 0; i < times; i += 1) {
      act(() => screen.getByText('click-avatar').click());
    }
  }

  it('los clicks 1 y 2 mantienen al avatar en idle', () => {
    renderClickProbe();
    clickAvatar(2);
    expect(screen.getByTestId('emotion')).toHaveTextContent('idle');
    expect(screen.getByTestId('shaking')).toHaveTextContent('false');
  });

  it('el tercer click sorprende al avatar durante 1.5 segundos', () => {
    renderClickProbe();
    clickAvatar(3);
    expect(screen.getByTestId('emotion')).toHaveTextContent('surprised');
    act(() => vi.advanceTimersByTime(AVATAR_CLICK_SEQUENCE.surpriseDurationMs));
    expect(screen.getByTestId('emotion')).toHaveTextContent('idle');
  });

  it('el cuarto click pone al avatar happy y lo hace vibrar', () => {
    renderClickProbe();
    clickAvatar(4);
    expect(screen.getByTestId('emotion')).toHaveTextContent('happy');
    expect(screen.getByTestId('shaking')).toHaveTextContent('true');
    act(() => vi.advanceTimersByTime(AVATAR_CLICK_SEQUENCE.shakeDurationMs));
    expect(screen.getByTestId('shaking')).toHaveTextContent('false');
    // El revert pendiente del click 3 no debe pisar la emoción happy.
    act(() => vi.advanceTimersByTime(AVATAR_CLICK_SEQUENCE.surpriseDurationMs));
    expect(screen.getByTestId('emotion')).toHaveTextContent('happy');
  });

  it('el quinto click dispara onSequenceComplete exactamente una vez', () => {
    const onSequenceComplete = vi.fn();
    renderClickProbe(onSequenceComplete);
    clickAvatar(4);
    expect(onSequenceComplete).not.toHaveBeenCalled();
    clickAvatar(1);
    expect(onSequenceComplete).toHaveBeenCalledTimes(1);
  });

  it('tras completarse, la secuencia vuelve a empezar desde cero', () => {
    const onSequenceComplete = vi.fn();
    renderClickProbe(onSequenceComplete);
    clickAvatar(10);
    expect(onSequenceComplete).toHaveBeenCalledTimes(2);
  });

  it('la secuencia expira si el usuario deja de clickar', () => {
    const onSequenceComplete = vi.fn();
    renderClickProbe(onSequenceComplete);
    clickAvatar(2);
    act(() => vi.advanceTimersByTime(AVATAR_CLICK_SEQUENCE.idleResetMs + 1));
    // Reiniciada: este click vuelve a ser el nº1, no el nº3.
    clickAvatar(1);
    expect(screen.getByTestId('emotion')).toHaveTextContent('idle');
    clickAvatar(2);
    expect(screen.getByTestId('emotion')).toHaveTextContent('surprised');
    expect(onSequenceComplete).not.toHaveBeenCalled();
  });
});
