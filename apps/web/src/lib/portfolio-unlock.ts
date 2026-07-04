const STORAGE_KEY = 'portfolioUnlocked';

export const PORTFOLIO_OWNER_PATH = '/portfolio/luisbz';

export function unlockPortfolio(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // Storage bloqueado (modo privado/iframe): el desbloqueo dura la sesión en memoria del router.
  }
}

export function isPortfolioUnlocked(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function isPortfolioPublicByEnv(): boolean {
  // Referencia estática para que Next.js pueda inlinear la variable en el bundle cliente.
  return process.env.NEXT_PUBLIC_PORTFOLIO_PUBLIC === 'true';
}
