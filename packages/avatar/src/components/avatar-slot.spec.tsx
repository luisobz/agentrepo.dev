import { describe, it, expect } from 'vitest';
import { render, screen, act, within } from '@testing-library/react';
import { AvatarProvider, useAvatar } from './avatar-context';
import { AvatarSlot } from './avatar-slot';

function MoveButton({ to }: { to: string }) {
  const { setAvatarPosition } = useAvatar();
  return <button onClick={() => setAvatarPosition(to)}>go-{to}</button>;
}

function renderLayout() {
  return render(
    <AvatarProvider>
      <AvatarSlot id="header" />
      <AvatarSlot id="footer" />
      <MoveButton to="footer" />
    </AvatarProvider>,
  );
}

describe('AvatarSlot', () => {
  it('renderiza un único sprite en el portal y marca el slot activo', () => {
    renderLayout();
    const header = screen.getByTestId('avatar-slot-header');
    const footer = screen.getByTestId('avatar-slot-footer');
    // The moving sprite lives in a viewport portal, not inside the slot boxes.
    expect(screen.getAllByTestId('avatar-sprite')).toHaveLength(1);
    expect(within(header).queryByTestId('avatar-sprite')).toBeNull();
    expect(within(footer).queryByTestId('avatar-sprite')).toBeNull();
    expect(header).toHaveAttribute('data-active', 'true');
    expect(footer).toHaveAttribute('data-active', 'false');
  });

  it('al llamar setAvatarPosition("footer") cambia el slot activo y sigue habiendo un único sprite', () => {
    renderLayout();
    act(() => screen.getByText('go-footer').click());
    const header = screen.getByTestId('avatar-slot-header');
    const footer = screen.getByTestId('avatar-slot-footer');
    expect(header).toHaveAttribute('data-active', 'false');
    expect(footer).toHaveAttribute('data-active', 'true');
    expect(screen.getAllByTestId('avatar-sprite')).toHaveLength(1);
  });

  it('nunca hay más de un sprite montado a la vez', () => {
    renderLayout();
    expect(screen.getAllByTestId('avatar-sprite')).toHaveLength(1);
    act(() => screen.getByText('go-footer').click());
    expect(screen.getAllByTestId('avatar-sprite')).toHaveLength(1);
  });

  it('el slot inactivo preserva el espacio (placeholder 48x48) por defecto', () => {
    renderLayout();
    const footer = screen.getByTestId('avatar-slot-footer');
    const placeholder = footer.querySelector('[aria-hidden="true"]');
    expect(placeholder).not.toBeNull();
  });

  it('con preserveSpace=false el slot inactivo no reserva espacio (marcador de tamaño 0)', () => {
    render(
      <AvatarProvider>
        <AvatarSlot id="footer" preserveSpace={false} />
      </AvatarProvider>,
    );
    const footer = screen.getByTestId('avatar-slot-footer');
    // Sigue existiendo un marcador (para poder rastrear su reaparición) pero
    // sin ocupar espacio en el layout.
    const marker = footer.querySelector('[aria-hidden="true"]');
    expect(marker).not.toBeNull();
    expect(marker?.className).toContain('size-0');
  });
});
