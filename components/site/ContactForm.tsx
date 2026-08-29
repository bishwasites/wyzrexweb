"use client";

import { useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";

type FormState = "idle" | "sending" | "success" | "error";

export default function ContactForm() {
  const pathname = usePathname();
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      service: String(formData.get("service") ?? ""),
      message: String(formData.get("message") ?? ""),
      sourcePage: pathname,
      // Honeypot — invisible to real visitors, irresistible to form-filling bots.
      company: String(formData.get("company") ?? ""),
    };

    setState("sending");
    setErrorMessage("");
    setFieldErrors({});

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const flat: Record<string, string> = {};
        for (const [field, messages] of Object.entries(data?.fieldErrors ?? {})) {
          if (Array.isArray(messages) && messages[0]) flat[field] = messages[0];
        }
        setFieldErrors(flat);
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }

      setState("success");
      form.reset();
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-start gap-3 rounded-control border border-gold/30 bg-gold/5 px-6 py-8">
        <span className="text-lg font-semibold text-gold-dark">Message sent.</span>
        <p className="text-[0.9375rem] text-muted">We&apos;ll get back to you within one business day.</p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-2 text-sm font-medium text-gold-dark underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      {/* Honeypot: off-screen rather than display:none/hidden, which some bots skip filling. */}
      <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="rounded-control border border-line bg-surface px-4 py-3.5 text-[0.9375rem] transition-colors focus:border-gold focus:outline-none"
        />
        {fieldErrors.name && <p className="text-sm text-red-600">{fieldErrors.name}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-control border border-line bg-surface px-4 py-3.5 text-[0.9375rem] transition-colors focus:border-gold focus:outline-none"
        />
        {fieldErrors.email && <p className="text-sm text-red-600">{fieldErrors.email}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="phone">Phone (optional)</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="rounded-control border border-line bg-surface px-4 py-3.5 text-[0.9375rem] transition-colors focus:border-gold focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="service">Service (optional)</label>
          <input
            id="service"
            name="service"
            type="text"
            placeholder="e.g. Paid Advertising"
            className="rounded-control border border-line bg-surface px-4 py-3.5 text-[0.9375rem] transition-colors focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="message">Project details</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="resize-y rounded-control border border-line bg-surface px-4 py-3.5 text-[0.9375rem] transition-colors focus:border-gold focus:outline-none"
        />
        {fieldErrors.message && <p className="text-sm text-red-600">{fieldErrors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex items-center justify-center rounded-pill bg-gold px-6 py-3 text-[0.9375rem] font-medium text-[#0a0a0a] transition-opacity disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Send message"}
      </button>

      {state === "error" && (
        <p className="text-[0.9375rem] font-semibold text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
