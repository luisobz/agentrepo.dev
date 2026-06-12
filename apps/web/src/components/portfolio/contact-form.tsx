'use client';

import { Bot, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export const CONTACT_SUBJECTS = [
  'Empleo',
  'Freelance',
  'Consulta Técnica',
  'Otro',
] as const;

export interface ContactFormValues {
  email: string;
  subject: (typeof CONTACT_SUBJECTS)[number];
  message: string;
}

const inputClasses =
  'w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-[#fdf8ef] placeholder:text-[#8d8273] transition-colors focus:border-[#c4909a] focus:outline-none';

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
  const [isSent, setIsSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    defaultValues: { email: '', subject: 'Empleo', message: '' },
  });

  // Mocked submit: Feature 15 will hand this payload to the AI contact agent.
  const onSubmit = (values: ContactFormValues) => {
    console.log('[contact-form] payload ready for the AI agent:', values);
    setIsSent(true);
  };

  return (
    <section aria-labelledby="contact-heading" className="px-6 py-20 sm:px-10">
      <div className="mx-auto w-full max-w-2xl">
        <h2
          id="contact-heading"
          className="mb-6 text-3xl font-semibold tracking-tight text-[#fdf8ef] sm:text-4xl"
        >
          Let&apos;s talk
        </h2>

        <div className="mb-8 flex gap-3 rounded-2xl border border-[#2f5d8a]/50 bg-[#2f5d8a]/10 p-4">
          <Bot className="mt-0.5 h-5 w-5 shrink-0 text-[#8aaac8]" />
          <p className="text-sm leading-relaxed text-[#cfc6b8]">
            Este formulario es analizado autónomamente por un{' '}
            <strong className="text-[#fdf8ef]">Agente IA</strong>. Al enviarlo,
            el agente procesará tu mensaje, creará un reporte técnico
            interactivo en PDF y te responderá por email al instante.
          </p>
        </div>

        {isSent ? (
          <div
            role="status"
            className="rounded-2xl border border-[#7a2230]/60 bg-[#7a2230]/15 p-6 text-center"
          >
            <p className="text-lg font-semibold text-[#fdf8ef]">
              Mensaje en camino ✦
            </p>
            <p className="mt-2 text-sm text-[#cfc6b8]">
              El agente ya está analizando tu consulta. Revisa tu bandeja de
              entrada en unos minutos.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            <div>
              <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-[#fdf8ef]">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                placeholder="you@company.com"
                className={inputClasses}
                {...register('email', {
                  required: 'Tu email es obligatorio',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Introduce un email válido',
                  },
                })}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium text-[#fdf8ef]">
                Subject
              </label>
              <select
                id="contact-subject"
                className={`${inputClasses} appearance-none bg-[#1b1714]`}
                {...register('subject', { required: true })}
              >
                {CONTACT_SUBJECTS.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-[#fdf8ef]">
                Message
              </label>
              <textarea
                id="contact-message"
                rows={6}
                placeholder="Tell me about your project, your stack and what you need…"
                className={`${inputClasses} resize-y`}
                {...register('message', {
                  required: 'Cuéntame al menos un poco sobre tu proyecto',
                  minLength: {
                    value: 20,
                    message: 'El mensaje debe tener al menos 20 caracteres',
                  },
                })}
              />
              <FieldError message={errors.message?.message} />
            </div>

            <button
              type="submit"
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7a2230] to-[#5b1822] px-6 py-3.5 text-sm font-semibold text-[#fdf8ef] shadow-[0_4px_24px_rgba(122,34,48,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(122,34,48,0.55)]"
            >
              <Sparkles className="h-4 w-4" />
              Send to the agent
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
