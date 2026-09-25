import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AvatarProvider } from './avatar-context';
import { AvatarSprite } from './avatar-sprite';

function renderWithEmotion(emotion: 'idle' | 'happy' | 'thinking' | 'surprised') {
  return render(
    <AvatarProvider initialEmotion={emotion}>
      <AvatarSprite />
    </AvatarProvider>,
  );
}

describe('AvatarSprite', () => {
  it('renderiza el sprite con la emoción por defecto', () => {
    render(
      <AvatarProvider>
        <AvatarSprite />
      </AvatarProvider>,
    );
    const sprite = screen.getByTestId('avatar-sprite');
    expect(sprite).toBeInTheDocument();
    expect(sprite).toHaveAttribute('data-emotion', 'idle');
    expect(sprite).toHaveAttribute('type', 'button');
    expect(sprite).toHaveAccessibleName('Interact with mascot');
    expect(sprite.querySelector('svg')).toHaveAttribute('shape-rendering', 'crispEdges');
  });

  it.each(['idle', 'happy', 'thinking', 'surprised'] as const)(
    'refleja la emoción %s en data-emotion',
    (emotion) => {
      renderWithEmotion(emotion);
      expect(screen.getByTestId('avatar-sprite')).toHaveAttribute('data-emotion', emotion);
    },
  );

  it('la cara cambia entre idle y happy (SVG distinto)', () => {
    const { container: idle } = renderWithEmotion('idle');
    const idleSvg = idle.querySelector('svg')?.innerHTML;
    const { container: happy } = renderWithEmotion('happy');
    const happySvg = happy.querySelector('svg')?.innerHTML;
    expect(idleSvg).toBeDefined();
    expect(happySvg).toBeDefined();
    expect(idleSvg).not.toEqual(happySvg);
  });

  it('clickar el sprite avanza la secuencia del easter egg', () => {
    render(
      <AvatarProvider>
        <AvatarSprite />
      </AvatarProvider>,
    );
    const sprite = screen.getByTestId('avatar-sprite');
    fireEvent.click(sprite);
    fireEvent.click(sprite);
    expect(sprite).toHaveAttribute('data-emotion', 'idle');
    fireEvent.click(sprite);
    expect(sprite).toHaveAttribute('data-emotion', 'surprised');
  });

  it('expone el estado de vibración vía data-shaking', () => {
    render(
      <AvatarProvider>
        <AvatarSprite />
      </AvatarProvider>,
    );
    const sprite = screen.getByTestId('avatar-sprite');
    expect(sprite).toHaveAttribute('data-shaking', 'false');
    for (let i = 0; i < 4; i += 1) {
      fireEvent.click(sprite);
    }
    expect(sprite).toHaveAttribute('data-emotion', 'happy');
    expect(sprite).toHaveAttribute('data-shaking', 'true');
  });
});
