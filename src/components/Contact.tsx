import { useRef, useState, type FormEvent } from 'react';
import { fontVariation } from '../theme/tokens';
import { ContactScene } from '../scenes/ContactScene';

const EMAIL = 'kaaboelnaga@gmail.com';
const PHONE = '+20 101 993 2727';
const PHONE_TEL = '+201019932727';

const links = [
  { label: 'GitHub', href: 'https://github.com/KAboelnaga' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kaboelnaga' },
];

// No backend on this site, so "send" opens the visitor's own email client
// with the message pre-filled, rather than pretending to submit somewhere.
function buildMailtoUrl(name: string, email: string, message: string) {
  const subject = encodeURIComponent(`Portfolio message from ${name || 'a visitor'}`);
  const signature = email ? `\n\n— ${name || 'Anonymous'} (${email})` : `\n\n— ${name || 'Anonymous'}`;
  const body = encodeURIComponent(`${message}${signature}`);
  return `mailto:${EMAIL}?subject=${subject}&body=${body}`;
}

/**
 * CONTENT.md (2026-08-09) said "no contact form" and it was removed —
 * Kareem asked directly for it back afterward ("the send a message via
 * email is gone I want it back"), which overrides that written spec.
 * Restored alongside the direct-channel additions from that same pass
 * (copy-to-clipboard email, real `tel:` link, CV download) rather than
 * just reverting — those are staying.
 */
export function Contact() {
  const pinRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable (permissions, insecure context) — the
      // email is still a real mailto link right next to this button, so
      // there's a working fallback even if the copy silently fails.
    }
  }

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
      <div
        ref={textRef}
        className="relative z-10 flex h-full max-w-lg flex-col justify-center overflow-y-auto py-20"
      >
        <h2
          className="font-display text-2xl text-text-hi sm:text-3xl"
          style={{ fontVariationSettings: fontVariation.heading }}
        >
          Get in touch
        </h2>

        {/* Was text-text-mid — "too dark, not visible" against this
            scene's background. text-hi matches the heading/links instead
            of being the one dim element in the block. */}
        <p className="mt-3 font-body text-sm leading-relaxed text-text-hi sm:text-md">
          Available immediately for full-stack work — remote, hybrid,
          on-site or relocation.
        </p>

        <ul className="mt-5 flex flex-col gap-2">
          <li className="flex items-center gap-2">
            <a
              href={`mailto:${EMAIL}`}
              className="font-mono text-sm text-signal transition-colors duration-300 hover:underline"
            >
              {EMAIL}
            </a>
            <button
              type="button"
              onClick={copyEmail}
              aria-label="Copy email address"
              className="font-mono text-xs text-text-low transition-colors duration-300 hover:text-signal"
            >
              {copied ? 'Email copied' : 'copy'}
            </button>
          </li>
          <li>
            <a
              href={`tel:${PHONE_TEL}`}
              className="font-mono text-sm text-signal transition-colors duration-300 hover:underline"
            >
              {PHONE}
            </a>
          </li>
        </ul>

        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-mono text-sm text-signal transition-colors duration-300 hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="/CV.pdf"
              download
              className="inline-flex items-center gap-2 font-mono text-sm text-signal transition-colors duration-300 hover:underline"
            >
              Download CV
            </a>
          </li>
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
                className="mt-1 w-full rounded border border-surf-3 bg-surf-1 px-3 py-1.5 font-body text-sm text-text-hi outline-none transition-colors duration-300 focus-visible:border-signal"
              />
            </label>

            <label className="flex-1 font-body text-xs text-text-mid">
              Email
              <input
                type="email"
                name="email"
                autoComplete="email"
                className="mt-1 w-full rounded border border-surf-3 bg-surf-1 px-3 py-1.5 font-body text-sm text-text-hi outline-none transition-colors duration-300 focus-visible:border-signal"
              />
            </label>
          </div>

          <label className="font-body text-xs text-text-mid">
            Message
            <textarea
              name="message"
              required
              rows={3}
              className="mt-1 w-full resize-none rounded border border-surf-3 bg-surf-1 px-3 py-1.5 font-body text-sm text-text-hi outline-none transition-colors duration-300 focus-visible:border-signal"
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
