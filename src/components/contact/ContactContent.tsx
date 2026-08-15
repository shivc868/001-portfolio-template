"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/src/lib/gsap";
import { site } from "@/src/data/site";
import { ShatterText } from "@/src/components/ShatterText";

/** Live local-time clock in monospace (§6 contact spec). */
function LocalClock() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Europe/Berlin",
        }).format(new Date())
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="type-mono" suppressHydrationWarning>
      Berlin — {time} CET
    </span>
  );
}

function Field({
  label,
  name,
  as = "input",
}: {
  label: string;
  name: string;
  as?: "input" | "textarea";
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: wrapRef });

  // Focus draws a wash underline via clip-path inset
  const onFocus = contextSafe(() => {
    gsap.to(wrapRef.current?.querySelector("[data-underline]") ?? null, {
      clipPath: "inset(0 0% 0 0)",
      duration: 0.45,
      ease: "expo.out",
    });
  });
  const onBlur = contextSafe(() => {
    gsap.to(wrapRef.current?.querySelector("[data-underline]") ?? null, {
      clipPath: "inset(0 100% 0 0)",
      duration: 0.35,
      ease: "expo.in",
    });
  });

  const shared = {
    id: name,
    name,
    onFocus,
    onBlur,
    className:
      "w-full bg-transparent py-3 text-lg font-bold outline-none placeholder:text-ink/35",
    placeholder: label,
  } as const;

  return (
    <div ref={wrapRef} className="relative border-b border-ink/25">
      <label htmlFor={name} className="sr-only">
        {label}
      </label>
      {as === "textarea" ? <textarea rows={4} {...shared} /> : <input type={name === "email" ? "email" : "text"} {...shared} />}
      <span
        data-underline
        aria-hidden="true"
        className="absolute bottom-[-1px] left-0 h-0.5 w-full bg-wash"
        style={{ clipPath: "inset(0 100% 0 0)" }}
      />
    </div>
  );
}

export function ContactContent() {
  const [sent, setSent] = useState(false);

  return (
    <main className="wash-gradient min-h-svh px-5 pt-32 pb-24 md:px-10">
      <h1 className="type-display max-w-[5em] text-ink">
        <ShatterText text="Let's talk" />
      </h1>

      <div className="mt-16 grid gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <p className="type-bio max-w-sm text-lg">
            Project, commission or just a good question — write, or book twenty minutes
            directly. Replies within two working days, usually faster.
          </p>
          <p>
            <a href={`mailto:${site.email}`} className="text-xl font-bold underline decoration-wash decoration-2 underline-offset-4">
              {site.email}
            </a>
          </p>
          <p>
            <a
              href={site.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="type-mono inline-block rounded-full border border-ink px-6 py-3"
            >
              Book a call ↗
            </a>
          </p>
          <LocalClock />
        </div>

        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <Field label="Your name" name="name" />
          <Field label="Email" name="email" />
          <Field label="What are we making?" name="message" as="textarea" />
          <button
            type="submit"
            className="type-mono rounded-full bg-ink px-8 py-4 text-chalk"
          >
            {sent ? "Sent — talk soon ✓" : "Send it →"}
          </button>
          {sent && (
            <p className="type-mono text-wash" role="status">
              Placeholder form — wire it to your provider of choice.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
