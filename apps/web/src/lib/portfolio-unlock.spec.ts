import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PORTFOLIO_OWNER_PATH,
  isPortfolioPublicByEnv,
  isPortfolioUnlocked,
  unlockPortfolio,
} from './portfolio-unlock';

describe('portfolio-unlock', () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllEnvs();
  });

  it('el portfolio está bloqueado por defecto', () => {
    expect(isPortfolioUnlocked()).toBe(false);
  });

  it('unlockPortfolio persiste la bandera en localStorage', () => {
    unlockPortfolio();
    expect(window.localStorage.getItem('portfolioUnlocked')).toBe('true');
    expect(isPortfolioUnlocked()).toBe(true);
  });

  it('el modo público sólo se activa con NEXT_PUBLIC_PORTFOLIO_PUBLIC=true', () => {
    expect(isPortfolioPublicByEnv()).toBe(false);
    vi.stubEnv('NEXT_PUBLIC_PORTFOLIO_PUBLIC', 'true');
    expect(isPortfolioPublicByEnv()).toBe(true);
  });

  it('expone la ruta del portfolio del propietario', () => {
    expect(PORTFOLIO_OWNER_PATH).toBe('/portfolio/luisbz');
  });
});
