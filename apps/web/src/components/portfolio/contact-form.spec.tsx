import { LocaleProvider } from '@agentrepo/ui';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
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

// The form reads translations from the locale context; default locale is 'en'.
const renderWithLocale = (ui: ReactElement) =>
  render(<LocaleProvider>{ui}</LocaleProvider>);

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
    renderWithLocale(<ContactForm />);

    fireEvent.click(screen.getByRole('button', { name: /send to the agent/i }));

    expect(await screen.findByText('Your email is required')).toBeTruthy();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('submits the payload through tRPC with the subject enum value', async () => {
    renderWithLocale(<ContactForm />);

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
    renderWithLocale(<ContactForm />);

    fill('Email', 'dev@example.com');
    fill('Subject', 'employment');
    fill('Message', 'We are hiring an AI engineer for our platform team.');
    fireEvent.click(screen.getByRole('button', { name: /send to the agent/i }));

    await waitFor(() => expect(mutateMock).toHaveBeenCalled());
    mutationState.onSuccess?.();

    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toContain(
        'Message received'
      );
    });
  });

  it('disables the form and shows a spinner while submitting', () => {
    mutationState.isPending = true;
    renderWithLocale(<ContactForm />);

    expect(screen.getByRole('button', { name: /processing/i })).toHaveProperty(
      'disabled',
      true
    );
    expect(screen.getByLabelText('Email')).toHaveProperty('disabled', true);
  });
});
