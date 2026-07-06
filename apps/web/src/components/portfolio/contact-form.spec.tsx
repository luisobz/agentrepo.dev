import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mutateMock = vi.fn();
const mutationState: {
  isPending: boolean;
  isError: boolean;
  onSuccess?: () => void;
} = { isPending: false, isError: false };

vi.mock('../utils/trpc', () => ({
  trpc: {
    contact: {
      submit: {
        useMutation: (options?: { onSuccess?: () => void }) => {
          mutationState.onSuccess = options?.onSuccess;
          return {
            mutate: mutateMock,
            isPending: mutationState.isPending,
            isError: mutationState.isError,
          };
        },
      },
    },
  },
}));

import { ContactForm } from './contact-form';

describe('ContactForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
    mutationState.isPending = false;
    mutationState.isError = false;
  });

  const fill = (field: string, value: string) => {
    fireEvent.change(screen.getByLabelText(field), { target: { value } });
  };

  it('shows validation errors instead of submitting an empty form', async () => {
    render(<ContactForm />);

    fireEvent.click(screen.getByRole('button', { name: /send to the agent/i }));

    expect(await screen.findByText('Tu email es obligatorio')).toBeTruthy();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('submits the payload through tRPC with the subject enum value', async () => {
    render(<ContactForm />);

    fill('Email', 'dev@example.com');
    fill('Subject', 'freelance');
    fill('Message', 'I need an autonomous agent for my support inbox.');
    fireEvent.click(screen.getByRole('button', { name: /send to the agent/i }));

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith({
        email: 'dev@example.com',
        subject: 'freelance',
        message: 'I need an autonomous agent for my support inbox.',
      });
    });
  });

  it('shows the success state when the mutation succeeds', async () => {
    render(<ContactForm />);

    fill('Email', 'dev@example.com');
    fill('Subject', 'employment');
    fill('Message', 'We are hiring an AI engineer for our platform team.');
    fireEvent.click(screen.getByRole('button', { name: /send to the agent/i }));

    await waitFor(() => expect(mutateMock).toHaveBeenCalled());
    mutationState.onSuccess?.();

    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toContain(
        'Mensaje recibido'
      );
    });
  });

  it('disables the form and shows a spinner while submitting', () => {
    mutationState.isPending = true;
    render(<ContactForm />);

    expect(screen.getByRole('button', { name: /procesando/i })).toHaveProperty(
      'disabled',
      true
    );
    expect(screen.getByLabelText('Email')).toHaveProperty('disabled', true);
  });
});
