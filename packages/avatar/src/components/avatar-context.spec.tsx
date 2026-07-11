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

function SetupProbe() {
  const { setup, configureAvatar, currentMessage, say, clearMessages } =
    useAvatar();
  return (
    <div>
      <span data-testid="movement">{setup.movement}</span>
      <span data-testid="speed">{setup.speed}</span>
      <span data-testid="face">{setup.colors.face}</span>
      <span data-testid="message">{currentMessage?.text ?? 'none'}</span>
      <button onClick={() => configureAvatar({ speed: 0.5, movement: 'jump' })}>
        slow-jump
      </button>
      <button onClick={() => configureAvatar({ colors: { face: '#fff' } })}>
        recolor
      </button>
      <button onClick={() => say('hola')}>speak</button>
      <button onClick={clearMessages}>hush</button>
    </div>
  );
}

describe('AvatarContext — setup y voz', () => {
  it('expone el setup por defecto (glide / velocidad 1)', () => {
    render(
      <AvatarProvider>
        <SetupProbe />
      </AvatarProvider>,
    );
    expect(screen.getByTestId('movement')).toHaveTextContent('glide');
    expect(screen.getByTestId('speed')).toHaveTextContent('1');
  });

  it('configureAvatar fusiona los cambios (incluyendo colores anidados)', () => {
    render(
      <AvatarProvider>
        <SetupProbe />
      </AvatarProvider>,
    );
    act(() => screen.getByText('slow-jump').click());
    expect(screen.getByTestId('movement')).toHaveTextContent('jump');
    expect(screen.getByTestId('speed')).toHaveTextContent('0.5');
    act(() => screen.getByText('recolor').click());
    expect(screen.getByTestId('face')).toHaveTextContent('#fff');
    // El cambio de color no pisa el movimiento anterior.
    expect(screen.getByTestId('movement')).toHaveTextContent('jump');
  });

  it('initialSetup sobreescribe los valores por defecto', () => {
    render(
      <AvatarProvider initialSetup={{ speed: 2, colors: { face: '#0f0' } }}>
        <SetupProbe />
      </AvatarProvider>,
    );
    expect(screen.getByTestId('speed')).toHaveTextContent('2');
    expect(screen.getByTestId('face')).toHaveTextContent('#0f0');
    // Los valores no sobreescritos mantienen su default.
    expect(screen.getByTestId('movement')).toHaveTextContent('glide');
  });

  it('say muestra y oculta el mensaje del avatar', () => {
    render(
      <AvatarProvider>
        <SetupProbe />
      </AvatarProvider>,
    );
    expect(screen.getByTestId('message')).toHaveTextContent('none');
    act(() => screen.getByText('speak').click());
    expect(screen.getByTestId('message')).toHaveTextContent('hola');
    act(() => screen.getByText('hush').click());
    expect(screen.getByTestId('message')).toHaveTextContent('none');
  });
});

function QueueProbe() {
  const { currentMessage, say, dismissMessage } = useAvatar();
  return (
    <div>
      <span data-testid="message">{currentMessage?.text ?? 'none'}</span>
      <span data-testid="placement">
        {currentMessage?.placement ?? 'none'}
      </span>
      <button onClick={() => say('uno', { durationMs: 3000, placement: 'top' })}>
        q1
      </button>
      <button onClick={() => say('dos', { durationMs: null })}>q2-perm</button>
      <button onClick={() => say('tres', { durationMs: 2000 })}>q3</button>
      <button onClick={dismissMessage}>dismiss</button>
    </div>
  );
}

describe('AvatarContext — cola de mensajes', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('consume la cola de uno en uno respetando duraciones y permanencia', () => {
    render(
      <AvatarProvider>
        <QueueProbe />
      </AvatarProvider>,
    );

    // Encola tres mensajes; sólo se muestra el primero.
    act(() => {
      screen.getByText('q1').click();
      screen.getByText('q2-perm').click();
      screen.getByText('q3').click();
    });
    expect(screen.getByTestId('message')).toHaveTextContent('uno');
    expect(screen.getByTestId('placement')).toHaveTextContent('top');

    // El primero (3s) expira y aparece el segundo (permanente).
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByTestId('message')).toHaveTextContent('dos');

    // El permanente no expira solo por más que avance el tiempo.
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getByTestId('message')).toHaveTextContent('dos');

    // Un click (dismiss) lo cierra y pasa al tercero (2s).
    act(() => screen.getByText('dismiss').click());
    expect(screen.getByTestId('message')).toHaveTextContent('tres');

    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByTestId('message')).toHaveTextContent('none');
  });
});

function BadgeProbe() {
  const { badge, setBadge } = useAvatar();
  return (
    <div>
      <span data-testid="badge">{badge ?? 'none'}</span>
      <button onClick={() => setBadge(3)}>set3</button>
      <button onClick={() => setBadge(0)}>set0</button>
      <button onClick={() => setBadge(null)}>clear</button>
    </div>
  );
}

describe('AvatarContext — badge', () => {
  it('setBadge muestra el contador y trata 0/null como sin badge', () => {
    render(
      <AvatarProvider>
        <BadgeProbe />
      </AvatarProvider>,
    );
    expect(screen.getByTestId('badge')).toHaveTextContent('none');
    act(() => screen.getByText('set3').click());
    expect(screen.getByTestId('badge')).toHaveTextContent('3');
    act(() => screen.getByText('set0').click());
    expect(screen.getByTestId('badge')).toHaveTextContent('none');
  });
});

function ClickProbe() {
  const { emotion, isShaking, currentMessage, registerAvatarClick } =
    useAvatar();
  return (
    <div>
      <span data-testid="emotion">{emotion}</span>
      <span data-testid="shaking">{String(isShaking)}</span>
      <span data-testid="message">{currentMessage?.text ?? 'none'}</span>
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

  it('al sorprenderse el avatar dice el surpriseMessage sin bloquear la secuencia', () => {
    const onSequenceComplete = vi.fn();
    render(
      <AvatarProvider
        surpriseMessage="¡Vaya!"
        onSequenceComplete={onSequenceComplete}
      >
        <ClickProbe />
      </AvatarProvider>,
    );
    clickAvatar(3);
    expect(screen.getByTestId('emotion')).toHaveTextContent('surprised');
    expect(screen.getByTestId('message')).toHaveTextContent('¡Vaya!');
    // El mensaje es temporal: los siguientes clicks siguen la secuencia.
    clickAvatar(2);
    expect(onSequenceComplete).toHaveBeenCalledTimes(1);
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
