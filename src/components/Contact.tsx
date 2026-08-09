import { useRef, type FormEvent } from 'react';
import { fontVariation } from '../theme/tokens';
import { ContactScene } from '../scenes/ContactScene';

const EMAIL = 'kaaboelnaga@gmail.com';

const links = [
  { label: EMAIL, href: `mailto:${EMAIL}` },
  { label: 'GitHub', href: 'https://github.com/KAboelnaga' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kaboelnaga' },
];

// No backend on this site, so "send" opens the visitor's own email client
// with the message pre-filled, rather than pretending to submit somewhere —
// see DONE.md for why (a real backend-connected form means a third-party
// service and a new dependency, which wasn't something to decide silently).
function buildMailtoUrl(name: string, email: string, message: string) {
  const subject = encodeURIComponent(`Portfolio message from ${name || 'a visitor'}`);
  const signature = email ? `\n\n— ${name || 'Anonymous'} (${email})` : `\n\n— ${name || 'Anonymous'}`;
  const body = encodeURIComponent(`${message}${signature}`);
  return `mailto:${EMAIL}?subject=${subject}&body=${body}`;
}

export function Contact() {
  const pinRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    window.location.href = buildMailtoUrl(name, email, message);
  }

  return (
    <section
      id="contact"
      ref={pinRef}
      className="relative h-[100svh] overflow-hidden px-6 sm:px-10 lg:px-16"
    >
      <ContactScene pinRef={pinRef} overlayRef={overlayRef} textRef={textRef} />

      {/*
        Starts visible in static markup — safe fallback if JS never runs,
        same reasoning as Hero's entrance text. ContactTimeline hides then
        re-reveals it on scroll once it initializes.
      */}
      <div ref={textRef} className="relative z-10 flex h-full max-w-lg flex-col justify-center py-20">
        <h2
          className="font-display text-2xl text-text-hi sm:text-3xl"
          style={{ fontVariationSettings: fontVariation.heading }}
        >
          Let's get connected
        </h2>

        <p className="mt-3 font-body text-sm leading-relaxed text-text-mid sm:text-base">
          Looking for backend or full-stack work. The fastest way to reach me
          is email — or send a message below.
        </p>

        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                className="inline-flex items-center gap-2 font-mono text-sm text-signal transition-colors duration-300 hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-low">
            Send me a message
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex-1 font-body text-xs text-text-mid">
              Name
              <input
                type="text"
                name="name"
                autoComplete="name"
                className="mt-1 w-full rounded border border-surf-3 bg-surf-1 px-3 py-1.5 font-body text-sm text-text-hi outline-none focus-visible:border-signal"
              />
            </label>

            <label className="flex-1 font-body text-xs text-text-mid">
              Email
              <input
                type="email"
                name="email"
                autoComplete="email"
                className="mt-1 w-full rounded border border-surf-3 bg-surf-1 px-3 py-1.5 font-body text-sm text-text-hi outline-none focus-visible:border-signal"
              />
            </label>
          </div>

          <label className="font-body text-xs text-text-mid">
            Message
            <textarea
              name="message"
              required
              rows={3}
              className="mt-1 w-full resize-none rounded border border-surf-3 bg-surf-1 px-3 py-1.5 font-body text-sm text-text-hi outline-none focus-visible:border-signal"
            />
          </label>

          <button
            type="submit"
            className="self-start rounded border border-surf-3 bg-surf-1 px-4 py-1.5 font-mono text-xs text-text-hi transition-colors hover:border-signal hover:text-signal sm:text-sm"
          >
            Send — opens your email client
          </button>
        </form>
      </div>
    </section>
  );
}
