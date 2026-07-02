import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PortfolioAccessGate } from './portfolio-access-gate';

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

describe('PortfolioAccessGate', () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('redirige a la home y no muestra nada si el portfolio está bloqueado', () => {
    render(
      <PortfolioAccessGate>
        <p>contenido secreto</p>
      </PortfolioAccessGate>,
    );
    expect(screen.queryByText('contenido secreto')).toBeNull();
    expect(replace).toHaveBeenCalledWith('/');
  });

  it('muestra el contenido si el easter egg fue completado', () => {
    window.localStorage.setItem('portfolioUnlocked', 'true');
    render(
      <PortfolioAccessGate>
        <p>contenido secreto</p>
      </PortfolioAccessGate>,
    );
    expect(screen.getByText('contenido secreto')).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  it('muestra el contenido sin desbloqueo cuando el perfil es público por ENV', () => {
    vi.stubEnv('NEXT_PUBLIC_PORTFOLIO_PUBLIC', 'true');
    render(
      <PortfolioAccessGate>
        <p>contenido secreto</p>
      </PortfolioAccessGate>,
    );
    expect(screen.getByText('contenido secreto')).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });
});
