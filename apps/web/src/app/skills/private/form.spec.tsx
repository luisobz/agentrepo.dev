import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { PrivateSkillForm } from './form';
vi.mock('./actions', () => ({ savePrivateSkill: vi.fn() }));
vi.mock('react', async () => {
  const react = await vi.importActual<typeof import('react')>('react');
  return {
    ...react,
    useActionState: () => [{ error: 'unavailable' }, vi.fn(), false],
  };
});
afterEach(cleanup);
it('preserves editable text during save errors and offers no publication control', () => {
  render(<PrivateSkillForm es />);
  const content = screen.getByLabelText('Contenido Markdown');
  fireEvent.change(content, { target: { value: 'Private working draft' } });
  fireEvent.change(screen.getByLabelText('Título'), {
    target: { value: 'Personal example' },
  });
  expect(content).toHaveValue('Private working draft');
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Tu texto permanece aquí',
  );
  expect(
    screen.getByRole('button', { name: 'Guardar en privado' }),
  ).toBeEnabled();
  expect(screen.queryByRole('button', { name: /publicar/i })).toBeNull();
});
