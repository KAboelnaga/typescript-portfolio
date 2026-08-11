import { lazy, Suspense, useRef, useState, type FormEvent } from 'react';
import emailjs from '@emailjs/browser';
import { fontVariation } from '../theme/tokens';
import { socialIconPaths } from '../data/socialIcons';

// Lazy — same reasoning as Hero.tsx's Scene: keeps three/@react-three/
// fiber/@react-three/drei out of the initial bundle so they don't block
// the rest of the page (including this section's own DOM text/form)
// from becoming interactive.
const ContactScene = lazy(() => import('../scenes/ContactScene').then((m) => ({ default: m.ContactScene })));

// "I want to make the send an email working" — real send via EmailJS
// (client-side, no backend needed) once Kareem creates an account and
// fills these three in his own `.env` (see `.env.example` and the setup
// steps in README.md/DONE.md — never hardcode real keys here). Until he
// does, all three read as empty strings and the form falls back to
// exactly its old `mailto:` behavior, unchanged — this is an upgrade
// path, not a required step.
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID ?? '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? '';
const EMAILJS_CONFIGURED = Boolean(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);

const EMAIL = 'kaaboelnaga@gmail.com';
const PHONE = '+20 101 993 2727';
const PHONE_TEL = '+201019932727';
// wa.me wants digits only, no leading "+".
const WHATSAPP_URL = `https://wa.me/${PHONE_TEL.replace(/\D/g, '')}`;

const links = [
  { label: 'GitHub', href: 'https://github.com/KAboelnaga' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kaboelnaga' },
  // "Add a whatsapp link too with the same number" — same PHONE_TEL, not a
  // separate number.
  { label: 'WhatsApp', href: WHATSAPP_URL },
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
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();

    // Honeypot — "EmailJS keys are public by design, so bots will find the
    // endpoint." A real visitor never fills a field that's visually hidden
    // (see the `company` input below); a script that fills every field
    // will. Reject silently — no error state, nothing to tell a bot its
    // submission didn't count.
    if (String(data.get('company') ?? '').trim()) return;

    if (!EMAILJS_CONFIGURED) {
      window.location.href = buildMailtoUrl(name, email, message);
      return;
    }

    setStatus('sending');
    try {
      // Template variable names — match these in the EmailJS template
      // editor ({{from_name}}, {{from_email}}, {{message}}).
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { from_name: name || 'Anonymous', from_email: email, message },
        { publicKey: EMAILJS_PUBLIC_KEY },
      );
      setStatus('sent');
      form.reset();
      setTimeout(() => setStatus('idle'), 4000);
    } catch {
      // Real send failed (bad keys, EmailJS outage, offline) — "never show
      // a bare error, always give the email address as the fallback": the
      // button copy itself prints it (see below), and this still also
      // tries to open it as a mailto: directly, same as this form always
      // did before EmailJS existed.
      setStatus('error');
      window.location.href = buildMailtoUrl(name, email, message);
    }
  }

  return (
    <section
      id="contact"
      ref={pinRef}
      className="relative h-[100svh] overflow-hidden px-6 sm:px-10 lg:px-16"
    >
      <Suspense fallback={null}>
        <ContactScene pinRef={pinRef} overlayRef={overlayRef} textRef={textRef} />
      </Suspense>

      {/*
        Starts visible in static markup — safe fallback if JS never runs,
        same reasoning as Hero's entrance text. ContactTimeline hides then
        re-reveals it on scroll once it initializes.
      */}
      <div
        ref={textRef}
        // "The mobile version needs a lot of work" — real bug found here:
        // this content is tall enough (heading, paragraph, contact links,
        // a 3-field form) that centering it vertically in a short mobile
        // viewport pushed its top edge up underneath the fixed Navbar,
        // partially hiding the email/phone lines behind it — same class
        // of overlap `pt-28` already fixes for Hero's About Me beat (see
        // Hero.tsx), just never applied here since it wasn't caught on
        // desktop's much taller viewport. `sm:pt-20` restores the
        // original `py-20` top value at that breakpoint, leaving the
        // already-correct desktop centering alone.
        //
        // `pr-24` is the same class of bug found again on a second mobile
        // pass: this content spans the full viewport width at mobile
        // sizes (max-w-lg only matters once the viewport is wider than
        // that), so the links row reached all the way to the right edge
        // and "WhatsApp" ended up rendering right under the fixed
        // ThemeLightbulb widget (`right-4` + `h-20 w-20` — an ~96px-wide
        // strip on the right, `right-6`+`5.25rem` at `sm:`). Reserving
        // that space makes the links wrap clear of it instead.
        className="relative z-10 flex h-full max-w-lg flex-col justify-center overflow-y-auto py-20 pr-24 pt-28 sm:pr-0 sm:pt-20"
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
              className="ml-1 font-mono text-xs text-text-low transition-colors duration-300 hover:text-signal"
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
                className="inline-flex items-center gap-1.5 font-mono text-sm text-signal transition-colors duration-300 hover:underline"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
                  <path d={socialIconPaths[link.label]} />
                </svg>
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

          {/* Honeypot — real visitors never see or fill this (off-screen,
              not `display:none`/`type=hidden`, since some bots skip those
              specifically). Checked in handleSubmit. */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />

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

          {/* Copy states per CONTENT-LIVE.md — the old idle copy
              ("Send — opens your email client") described the pre-EmailJS
              mailto: behavior and undersold a form that now actually
              sends; the failure state prints the email address directly
              rather than a bare "error," since a silently-vanished
              message is worse than no form at all. */}
          <button
            type="submit"
            disabled={status === 'sending'}
            className="self-start rounded border border-surf-3 bg-surf-1 px-4 py-1.5 font-mono text-xs text-text-hi transition-colors hover:border-signal hover:text-signal disabled:opacity-60 sm:text-sm"
          >
            {status === 'sending' && 'Sending…'}
            {status === 'sent' && "Sent — I'll reply within a day or two"}
            {status === 'error' && `Didn't send. Email me directly at ${EMAIL}`}
            {status === 'idle' && 'Send message'}
          </button>
        </form>
      </div>
    </section>
  );
}
