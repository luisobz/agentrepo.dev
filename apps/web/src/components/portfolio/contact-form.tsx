'use client';

import type { ContactSubject } from '@agentrepo/trpc/schemas';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { trpc } from '../utils/trpc';
import { useT } from '../../lib/i18n/use-t';
import type { WebDictionaryKey } from '../../lib/i18n/dictionary';

export const CONTACT_SUBJECT_OPTIONS: ReadonlyArray<{
  value: ContactSubject;
  labelKey: WebDictionaryKey;
}> = [
  { value: 'employment', labelKey: 'portfolio.contact.subject.employment' },
  { value: 'freelance', labelKey: 'portfolio.contact.subject.freelance' },
  { value: 'question', labelKey: 'portfolio.contact.subject.question' },
  { value: 'other', labelKey: 'portfolio.contact.subject.other' },
];

export interface ContactFormValues {
  email: string;
  subject: ContactSubject;
  message: string;
}

const inputClasses =
  'w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-[#fdf8ef] placeholder:text-[#8d8273] transition-colors focus:border-[#c4909a] focus:outline-none disabled:opacity-60';

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p role="alert" className="mt-1.5 text-xs text-[#e8c2ca]">
      {message}
    </p>
  );
}

export function ContactForm() {
  const t = useT();
  const [isSent, setIsSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    defaultValues: { email: '', subject: 'employment', message: '' },
  });

  const submitContact = trpc.contact.submit.useMutation({
    onSuccess: () => {
      reset();
      setIsSent(true);
    },
  });
  const isSubmitting = submitContact.isPending;

  const onSubmit = (values: ContactFormValues) => {
    submitContact.mutate(values);
  };

  return (
    <section aria-labelledby="contact-heading" className="px-6 py-20 sm:px-10">
      <div className="mx-auto w-full max-w-2xl">
        <h2
          id="contact-heading"
          className="mb-6 text-3xl font-semibold tracking-tight text-[#fdf8ef] sm:text-4xl"
        >
          {t('portfolio.contact.title')}
        </h2>

        <div className="mb-8 flex gap-3 rounded-2xl border border-[#2f5d8a]/50 bg-[#2f5d8a]/10 p-4">
          <Bot className="mt-0.5 h-5 w-5 shrink-0 text-[#8aaac8]" />
          <p
            className="text-sm leading-relaxed text-[#cfc6b8] [&_strong]:text-[#fdf8ef]"
            // Static, trusted copy with a single <strong> emphasis per locale.
            dangerouslySetInnerHTML={{ __html: t('portfolio.contact.agentNotice') }}
          />
        </div>

        {isSent ? (
          <div
            role="status"
            className="rounded-2xl border border-[#7a2230]/60 bg-[#7a2230]/15 p-6 text-center"
          >
            <p className="text-lg font-semibold text-[#fdf8ef]">
              {t('portfolio.contact.sentTitle')}
            </p>
            <p className="mt-2 text-sm text-[#cfc6b8]">
              {t('portfolio.contact.sentBody')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            <div>
              <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-[#fdf8ef]">
                {t('portfolio.contact.email')}
              </label>
              <input
                id="contact-email"
                type="email"
                placeholder="you@company.com"
                className={inputClasses}
                disabled={isSubmitting}
                {...register('email', {
                  required: t('portfolio.contact.error.emailRequired'),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t('portfolio.contact.error.emailInvalid'),
                  },
                })}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium text-[#fdf8ef]">
                {t('portfolio.contact.subject')}
              </label>
              <select
                id="contact-subject"
                className={`${inputClasses} appearance-none bg-[#1b1714]`}
                disabled={isSubmitting}
                {...register('subject', { required: true })}
              >
                {CONTACT_SUBJECT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-[#fdf8ef]">
                {t('portfolio.contact.message')}
              </label>
              <textarea
                id="contact-message"
                rows={6}
                placeholder={t('portfolio.contact.messagePlaceholder')}
                className={`${inputClasses} resize-y`}
                disabled={isSubmitting}
                {...register('message', {
                  required: t('portfolio.contact.error.messageRequired'),
                  minLength: {
                    value: 20,
                    message: t('portfolio.contact.error.messageMin'),
                  },
                })}
              />
              <FieldError message={errors.message?.message} />
            </div>

            {submitContact.isError ? (
              <p role="alert" className="text-sm text-[#e8c2ca]">
                {t('portfolio.contact.error.submit')}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7a2230] to-[#5b1822] px-6 py-3.5 text-sm font-semibold text-[#fdf8ef] shadow-[0_4px_24px_rgba(122,34,48,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(122,34,48,0.55)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('portfolio.contact.submitting')}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t('portfolio.contact.submit')}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
