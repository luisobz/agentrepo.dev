import Link from '../localized-link';
import { getServerLocale } from '../../lib/i18n/server';
import { LEGAL_CONTACT } from '../../lib/legal-contact';

const content = {
  privacy: {
    en: {
      title: 'Privacy',
      intro: 'How AgentRepo.dev handles your information.',
      sections: [
        [
          'Operator and contact',
          'Luis Ballester Zafra operates AgentRepo.dev. Contact the address below for privacy requests, access, corrections or account deletion.',
        ],
        [
          'Accounts and contributions',
          'Signing in with GitHub or email provides an account identifier, email address and profile information. We use these to authenticate you, record authorship and review submissions. Approved contributions and their public authorship are visible to visitors; pending proposals are available to the administrators. Do not upload secrets or personal data you cannot publish.',
        ],
        [
          'Contact assistant',
          'The portfolio contact form stores your email, topic and message so we can respond. A bounded portion of your message is sent to DeepSeek to draft an AI-assisted reply; the application generates the email and PDF. Spacemail delivers the reply and an internal notification. Do not include sensitive information. AI output may be inaccurate and does not confirm availability or commercial commitments.',
        ],
        [
          'Analytics and technical data',
          'Cloudflare Web Analytics measures page visits, referrers, approximate country, device/browser characteristics and loading performance. It does not use analytics cookies, advertising profiles or session recordings. It does not receive form contents or your account identity from this application. Browser blockers can prevent measurement. Hosting and security services also process request information to operate and protect the site.',
        ],
        [
          'Services and preferences',
          'Supabase provides authentication and the database; Spaceship hosts the applications and Spacemail; Cloudflare serves and protects the website. These providers may process data outside your country under their own terms. Session cookies keep you signed in, and a locale cookie remembers your language. We do not sell your data.',
        ],
        [
          'Retention and rights',
          'We retain account and contact information while needed to provide the service, review submissions and resolve support or security issues. Request deletion through the contact below; public contribution history and provider backups may require separate review. You may also contact the relevant data protection authority.',
        ],
      ],
    },
    es: {
      title: 'Privacidad',
      intro: 'Cómo trata AgentRepo.dev tu información.',
      sections: [
        [
          'Responsable y contacto',
          'Luis Ballester Zafra gestiona AgentRepo.dev. Utiliza el correo indicado al final para solicitar acceso, rectificación, eliminación de cuenta u otras cuestiones de privacidad.',
        ],
        [
          'Cuentas y contribuciones',
          'Al acceder con GitHub o correo recibimos un identificador de cuenta, tu email y datos del perfil. Los usamos para autenticarte, registrar la autoría y revisar propuestas. Las contribuciones aprobadas y su autoría pública son visibles; las pendientes están disponibles para los administradores. No subas secretos ni datos personales que no puedas publicar.',
        ],
        [
          'Asistente de contacto',
          'El formulario del portfolio guarda tu correo, asunto y mensaje para responderte. Enviamos una parte acotada del mensaje a DeepSeek para redactar una respuesta asistida por IA; la aplicación genera el correo y el PDF. Spacemail entrega la respuesta y una notificación interna. No incluyas información sensible. La IA puede equivocarse y no confirma disponibilidad ni compromisos comerciales.',
        ],
        [
          'Analítica y datos técnicos',
          'Cloudflare Web Analytics mide visitas, páginas de referencia, país aproximado, características de dispositivo/navegador y rendimiento de carga. No utiliza cookies de analítica, perfiles publicitarios ni grabaciones de sesiones. La aplicación no le envía el contenido de formularios ni tu identidad de cuenta. Los bloqueadores pueden impedir la medición. Los servicios de hosting y seguridad también procesan información de las peticiones para operar y proteger la web.',
        ],
        [
          'Servicios y preferencias',
          'Supabase presta la autenticación y base de datos; Spaceship aloja las aplicaciones y Spacemail; Cloudflare sirve y protege la web. Estos proveedores pueden tratar datos fuera de tu país conforme a sus condiciones. Las cookies de sesión mantienen el acceso y una cookie de idioma recuerda tu preferencia. No vendemos tus datos.',
        ],
        [
          'Conservación y derechos',
          'Conservamos la información de cuenta y contacto mientras sea necesaria para prestar el servicio, revisar propuestas y atender incidencias de soporte o seguridad. Puedes solicitar su eliminación por el correo indicado; el historial público de contribuciones y las copias de los proveedores pueden requerir una revisión específica. También puedes acudir a la autoridad de protección de datos competente.',
        ],
      ],
    },
  },
  terms: {
    en: {
      title: 'Terms and contributions',
      intro: 'Conditions for using and contributing to AgentRepo.dev.',
      sections: [
        [
          'Using the catalogue',
          'AgentRepo.dev publishes skills, agent project guides and articles. Check each item’s origin, version, requirements and licence before using it. A project guide does not imply its runtime has been installed or validated by AgentRepo. AI-generated content and third-party links may contain errors.',
        ],
        [
          'Your contributions',
          'Submit only material you own or have permission to distribute. Include the applicable licence and attribution in the document or project README. By submitting, you permit AgentRepo to store, review, display, version and distribute the contribution through the catalogue. You retain ownership. Administrators may request changes, reject or remove material.',
        ],
        [
          'Licensing',
          'The platform code is licensed under AGPL-3.0. Catalogue content follows the licence stated by its author or upstream project; the platform licence does not automatically replace it. If redistribution rights are unclear, ask the author before reusing the material.',
        ],
        [
          'Acceptable use',
          'Do not upload credentials, malicious files, private information without permission or material that infringes others’ rights. Do not abuse the login, contact assistant or download services. Automated replies are informational, not contracts or commitments.',
        ],
        [
          'Support and changes',
          'Report product errors through the linked GitHub issue tracker. Use the contact address for privacy, rights or removal requests; do not post private details in public issues. These conditions may be updated as the service evolves.',
        ],
      ],
    },
    es: {
      title: 'Condiciones y contribuciones',
      intro: 'Condiciones para utilizar y contribuir a AgentRepo.dev.',
      sections: [
        [
          'Uso del catálogo',
          'AgentRepo.dev publica skills, guías de proyectos de agentes y artículos. Revisa el origen, versión, requisitos y licencia de cada recurso antes de usarlo. Una guía no implica que AgentRepo haya instalado o validado el runtime del proyecto. El contenido generado por IA y los enlaces externos pueden contener errores.',
        ],
        [
          'Tus contribuciones',
          'Envía únicamente material propio o que tengas permiso para distribuir. Incluye la licencia aplicable y atribución en el documento o README. Al enviarlo autorizas a AgentRepo a almacenarlo, revisarlo, mostrarlo, versionarlo y distribuirlo desde el catálogo. Conservas la titularidad. Los administradores pueden pedir cambios, rechazar o retirar material.',
        ],
        [
          'Licencias',
          'El código de la plataforma utiliza AGPL-3.0. El contenido del catálogo sigue la licencia indicada por su autor o proyecto original; la licencia de la plataforma no la sustituye automáticamente. Si los permisos de redistribución no están claros, consulta al autor antes de reutilizarlo.',
        ],
        [
          'Uso permitido',
          'No subas credenciales, archivos maliciosos, datos privados sin permiso ni material que vulnere derechos ajenos. No abuses del acceso, asistente de contacto o descargas. Las respuestas automáticas son informativas, no contratos ni compromisos.',
        ],
        [
          'Soporte y cambios',
          'Comunica errores del producto en el registro de incidencias de GitHub enlazado. Para privacidad, derechos o retirada de contenido, utiliza el correo de contacto; no publiques datos privados en las incidencias. Estas condiciones pueden actualizarse conforme evolucione el servicio.',
        ],
      ],
    },
  },
};
export async function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const locale = await getServerLocale();
  const copy = content[kind][locale];
  return (
    <article className="mx-auto max-w-3xl px-6 pb-20 pt-8">
      <h1 className="text-4xl font-semibold tracking-tight">{copy.title}</h1>
      <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
        {copy.intro}
      </p>
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">2026-10-19</p>
      {copy.sections.map(([title, body]) => (
        <section key={title} className="mt-8">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mt-3 leading-7 text-[var(--color-text-secondary)]">
            {body}
          </p>
        </section>
      ))}
      <p className="mt-8">
        <a className="underline" href={`mailto:${LEGAL_CONTACT}`}>
          {LEGAL_CONTACT}
        </a>
      </p>
      <p className="mt-4 flex flex-wrap gap-5 text-sm">
        <a
          className="underline"
          href="https://github.com/luisobz/agentrepo.dev/issues"
        >
          GitHub · Support
        </a>
        <Link
          className="underline"
          href={kind === 'privacy' ? '/terms' : '/privacy'}
        >
          {kind === 'privacy'
            ? locale === 'es'
              ? 'Condiciones'
              : 'Terms'
            : locale === 'es'
              ? 'Privacidad'
              : 'Privacy'}
        </Link>
      </p>
    </article>
  );
}
