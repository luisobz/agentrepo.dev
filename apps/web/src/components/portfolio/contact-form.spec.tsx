import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContactForm } from './contact-form';

describe('ContactForm', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const fill = (field: string, value: string) => {
    fireEvent.change(screen.getByLabelText(field), { target: { value } });
  };

  it('shows validation errors instead of submitting an empty form', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    render(<ContactForm />);

    fireEvent.click(screen.getByRole('button', { name: /send to the agent/i }));

    expect(await screen.findByText('Tu email es obligatorio')).toBeTruthy();
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('logs the mocked payload and shows the success state on valid submit', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    render(<ContactForm />);

    fill('Email', 'dev@example.com');
    fill('Subject', 'Freelance');
    fill('Message', 'I need an autonomous agent for my support inbox.');
    fireEvent.click(screen.getByRole('button', { name: /send to the agent/i }));

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        '[contact-form] payload ready for the AI agent:',
        {
          email: 'dev@example.com',
          subject: 'Freelance',
          message: 'I need an autonomous agent for my support inbox.',
        }
      );
    });
    expect(screen.getByRole('status').textContent).toContain('Mensaje en camino');
  });
});
