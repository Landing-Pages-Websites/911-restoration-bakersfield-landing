"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { useMegaLeadForm } from "@/hooks/useMegaLeadForm";
import {
  SepticIcon,
  DrainIcon,
  YardDrainIcon,
  PipeIcon,
  WrenchIcon,
  CameraIcon,
  BoltIcon,
  DropletIcon,
  ShieldIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  CheckIcon,
  BadgeIcon,
  CalendarIcon,
  CashIcon,
  StarIcon,
  LeafIcon,
} from "@/components/icons";

const PHONE = "(805) 603-1983";
const PHONE_HREF = "tel:+18056031983";

/* ─── Declare optimizer global ───────────────────────────────── */
declare global {
  interface Window {
    MegaTag?: { trackEvent?: (event: string, data: Record<string, unknown>) => void };
    dataLayer?: unknown[];
  }
}

/* ─── Scroll reveal hook ─────────────────────────────────────── */
function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).style.animationDelay = `${delay}ms`;
            e.target.classList.add("in-view");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

/* ─── Phone formatting ───────────────────────────────────────── */
function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
const EMAIL_PATTERN = "[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}";
function isValidEmail(value: string): boolean {
  return new RegExp(`^${EMAIL_PATTERN}$`).test(value.trim());
}

type FieldName =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "zip"
  | "isHomeowner"
  | "timeframe";

/* ─── Dual CTA (phone LEFT, form CTA RIGHT) ──────────────────── */
function DualCta({ label = "Get My Free Quote", center = true }: { label?: string; center?: boolean }) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${center ? "justify-center" : ""} items-stretch sm:items-center`}>
      <a
        href={PHONE_HREF}
        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white border-2 border-navy/15 hover:border-orange text-navy font-bold rounded-xl transition-all"
      >
        <PhoneIcon className="w-5 h-5 text-orange" />
        {PHONE}
      </a>
      <a
        href="#quote"
        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-orange hover:bg-orange-dark text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
      >
        {label}
      </a>
    </div>
  );
}

/* ─── Lead Form ──────────────────────────────────────────────── */
function LeadForm({ id = "quote-form" }: { id?: string }) {
  const { submitLead } = useMegaLeadForm();
  const inFlightRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    zip: "",
    isHomeowner: "",
    timeframe: "",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeframes = ["ASAP / Emergency", "Within 1–2 weeks", "2+ weeks"];

  // Per-field validators — return an error string, or "" when valid.
  function validateField(name: FieldName, value: string): string {
    switch (name) {
      case "firstName":
        return value.trim() ? "" : "Please enter your first name.";
      case "lastName":
        return value.trim() ? "" : "Please enter your last name.";
      case "email":
        if (!value.trim()) return "Please enter your email address.";
        return isValidEmail(value)
          ? ""
          : "Please enter a valid email address.";
      case "phone":
        if (!value.trim()) return "Please enter your phone number.";
        return value.replace(/\D/g, "").length === 10
          ? ""
          : "Phone must be a 10-digit number.";
      case "zip":
        if (!value.trim()) return "Please enter your ZIP code.";
        return value.replace(/\D/g, "").length >= 5
          ? ""
          : "ZIP must be a 5-digit number.";
      case "isHomeowner":
        return value ? "" : "Please answer this question.";
      case "timeframe":
        return value ? "" : "Please answer this question.";
      default:
        return "";
    }
  }

  // Set a field value and clear its error live as it becomes valid.
  const setFieldValue = (name: FieldName, value: string) => {
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name] && validateField(name, value) === "") {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handlePhoneChange = (value: string) => {
    setFieldValue("phone", formatPhone(value));
  };

  // Show the error on blur of an empty/invalid field.
  const handleBlur = (name: FieldName) => {
    const msg = validateField(name, form[name]);
    setErrors((prev) => {
      const next = { ...prev };
      if (msg) next[name] = msg;
      else delete next[name];
      return next;
    });
  };

  const focusFirstInvalid = (fields: FieldName[]) => {
    for (const f of fields) {
      if (validateField(f, form[f])) {
        formRef.current
          ?.querySelector<HTMLElement>(`[name="${f}"]`)
          ?.focus();
        return;
      }
    }
  };

  async function performSubmit() {
    if (inFlightRef.current) return;
    setError(null);

    // Validate every field; show ALL errors at once + focus first invalid.
    const fields: FieldName[] = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "zip",
      "isHomeowner",
      "timeframe",
    ];
    const e: Partial<Record<FieldName, string>> = {};
    for (const f of fields) {
      const msg = validateField(f, form[f]);
      if (msg) e[f] = msg;
    }
    setErrors(e);
    if (Object.keys(e).length > 0) {
      focusFirstInvalid(fields);
      return;
    }

    const qualified =
      form.isHomeowner === "Yes" &&
      (form.timeframe === "ASAP / Emergency" || form.timeframe === "Within 1–2 weeks");
    const disqualificationReason =
      form.isHomeowner !== "Yes"
        ? "not_homeowner"
        : form.timeframe === "2+ weeks"
        ? "timeframe_2plus_weeks"
        : "";

    inFlightRef.current = true;
    setSubmitting(true);
    try {
      await submitLead({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\D/g, ""),
        zip: form.zip.replace(/\D/g, ""),
        isHomeowner: form.isHomeowner,
        timeframe: form.timeframe,
        qualified: qualified ? "true" : "false",
        disqualification_reason: disqualificationReason,
      });

      if (typeof window !== "undefined" && window.MegaTag?.trackEvent) {
        try {
          window.MegaTag.trackEvent("form_submit", {
            element: `form-${id}`,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            phone: form.phone.replace(/\D/g, ""),
            zip: form.zip.replace(/\D/g, ""),
            isHomeowner: form.isHomeowner,
            timeframe: form.timeframe,
            qualified: qualified ? "true" : "false",
          });
        } catch {
          /* silent */
        }
      }

      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "form_submission",
          form_id: `form-${id}`,
          form_provider: "conejo-bros-plumbing-landing",
        });
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please call us at " + PHONE + ".");
    } finally {
      setSubmitting(false);
      inFlightRef.current = false;
    }
  }

  function handleSubmit(e: FormEvent) {
    // Native submit is intentionally a no-op: the Mega optimizer fires a
    // duplicate `form_submit` on native submit events even with
    // preventDefault, so we route all submissions through the validate-first
    // button onClick handler instead (SHLY May 8 incident pattern).
    e.preventDefault();
  }

  const labelCls = "block text-xs font-semibold text-navy mb-1.5";

  // Accessible inline error element (dedicated .lp-input-error class).
  const FieldError = ({ name }: { name: FieldName }) =>
    errors[name] ? (
      <p
        id={`${name}-error`}
        role="alert"
        aria-live="polite"
        className="lp-input-error"
      >
        {errors[name]}
      </p>
    ) : null;

  if (submitted) {
    return (
      <div id={id} className="bg-white rounded-2xl shadow-2xl p-8 text-center border border-orange/20">
        <div className="w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckIcon className="w-8 h-8 text-orange" />
        </div>
        <h3 className="text-2xl font-extrabold text-navy mb-2">Request Received!</h3>
        <p className="text-text-muted">
          A Conejo Bros team member will reach out shortly. Need help right now? Call{" "}
          <a href={PHONE_HREF} className="text-orange font-bold hover:underline">
            {PHONE}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      id={id}
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="bg-white rounded-2xl shadow-2xl p-6 md:p-7 border border-orange/15"
    >
      <div className="text-center mb-5">
        <h3 className="text-xl font-extrabold text-navy">Request Your Free Quote</h3>
        <p className="text-sm text-text-muted mt-1">Same-day response · No obligation</p>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className={labelCls}>
              First Name <span className="text-red">*</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) => setFieldValue("firstName", e.target.value)}
              onBlur={() => handleBlur("firstName")}
              aria-invalid={errors.firstName ? "true" : undefined}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
              className={`lp-field w-full px-4 py-3 border rounded-lg text-sm bg-bg-light focus:bg-white transition ${
                errors.firstName ? "lp-input-invalid" : "border-border"
              }`}
            />
            <FieldError name="firstName" />
          </div>
          <div>
            <label htmlFor="lastName" className={labelCls}>
              Last Name <span className="text-red">*</span>
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) => setFieldValue("lastName", e.target.value)}
              onBlur={() => handleBlur("lastName")}
              aria-invalid={errors.lastName ? "true" : undefined}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
              className={`lp-field w-full px-4 py-3 border rounded-lg text-sm bg-bg-light focus:bg-white transition ${
                errors.lastName ? "lp-input-invalid" : "border-border"
              }`}
            />
            <FieldError name="lastName" />
          </div>
        </div>

        <div>
          <label htmlFor="email" className={labelCls}>
            Email Address <span className="text-red">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            pattern={EMAIL_PATTERN}
            title="Enter a valid email address, e.g. name@example.com"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setFieldValue("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            aria-invalid={errors.email ? "true" : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`lp-field w-full px-4 py-3 border rounded-lg text-sm bg-bg-light focus:bg-white transition ${
              errors.email ? "lp-input-invalid" : "border-border"
            }`}
          />
          <FieldError name="email" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="phone" className={labelCls}>
              Phone <span className="text-red">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              required
              pattern="\(\d{3}\) \d{3}-\d{4}"
              title="Enter a 10-digit US phone number"
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={() => handleBlur("phone")}
              aria-invalid={errors.phone ? "true" : undefined}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              className={`lp-field w-full px-4 py-3 border rounded-lg text-sm bg-bg-light focus:bg-white transition ${
                errors.phone ? "lp-input-invalid" : "border-border"
              }`}
            />
            <FieldError name="phone" />
          </div>
          <div>
            <label htmlFor="zip" className={labelCls}>
              ZIP Code <span className="text-red">*</span>
            </label>
            <input
              id="zip"
              name="zip"
              type="text"
              inputMode="numeric"
              required
              maxLength={5}
              placeholder="ZIP Code"
              value={form.zip}
              onChange={(e) =>
                setFieldValue("zip", e.target.value.replace(/\D/g, "").slice(0, 5))
              }
              onBlur={() => handleBlur("zip")}
              aria-invalid={errors.zip ? "true" : undefined}
              aria-describedby={errors.zip ? "zip-error" : undefined}
              className={`lp-field w-full px-4 py-3 border rounded-lg text-sm bg-bg-light focus:bg-white transition ${
                errors.zip ? "lp-input-invalid" : "border-border"
              }`}
            />
            <FieldError name="zip" />
          </div>
        </div>

        <div>
          <label className={labelCls}>
            Are you the homeowner? <span className="text-red">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {["Yes", "No"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFieldValue("isHomeowner", opt)}
                className={`py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                  form.isHomeowner === opt
                    ? "border-orange bg-orange/10 text-orange"
                    : "border-border bg-bg-light text-text-muted hover:border-orange/40"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <input type="hidden" name="isHomeowner" value={form.isHomeowner} />
          <FieldError name="isHomeowner" />
        </div>

        <div>
          <label className={labelCls}>
            How soon are you looking for service? <span className="text-red">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            {timeframes.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFieldValue("timeframe", opt)}
                className={`py-2.5 px-3 rounded-lg text-sm font-semibold border-2 transition-all text-left ${
                  form.timeframe === opt
                    ? "border-orange bg-orange/10 text-orange"
                    : "border-border bg-bg-light text-text-muted hover:border-orange/40"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <input type="hidden" name="timeframe" value={form.timeframe} />
          <FieldError name="timeframe" />
        </div>
      </div>

      {error && <p className="text-red text-sm text-center mt-3">{error}</p>}

      <button
        type="button"
        onClick={() => void performSubmit()}
        disabled={submitting || submitted}
        className="w-full mt-5 py-3.5 bg-orange hover:bg-orange-dark text-white font-bold text-base rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl pulse-glow"
      >
        {submitting ? "Submitting..." : "Get My Free Quote"}
      </button>

      <p className="text-xs text-text-muted text-center mt-3">
        No obligation · Licensed &amp; insured · We respond fast.
      </p>
    </form>
  );
}

/* ─── FAQ Item ───────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-bg-light transition"
      >
        <span className="font-semibold text-navy">{q}</span>
        <span className={`text-orange text-2xl leading-none transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && <div className="px-5 pb-5 text-text-muted text-sm leading-relaxed">{a}</div>}
    </div>
  );
}

/* ─── Data ───────────────────────────────────────────────────── */
const REVIEWS = [
  {
    name: "Evangeline Tan",
    text:
      "Thanks to Tiago and the Conejo Bros Plumbing team, our sewer drain is now in perfect working order! They were prompt, knowledgeable, and courteous throughout the entire process. Exceptional service!",
  },
  {
    name: "Mikie Wu",
    text:
      "I'm extremely grateful to Conejo Bros Plumbing for their exceptional service. Tiago went the extra mile to clear our clogged sewer drain. Friendly, dependable, and highly skilled. A solid 5-star rating!",
  },
  {
    name: "Robert Alkana",
    text:
      "Came home to a backed up kitchen and called Conejo Bros Plumbing. Not only did they clean my drain under my sink but they left my stuff underneath nice and organized. Highly recommend them to anyone who needs plumbing help!",
  },
  {
    name: "Joyce Aldoroty",
    text:
      "Kyle did a great job replacing emergency valves, a garbage disposal, and a kitchen faucet. He was professional and communicative — he was awesome! When we still had other problems, Kyle rearranged his schedule and came back.",
  },
  {
    name: "Ambrose Daye",
    text:
      "Conejo Bros Plumbing is simply incredible! They came through for us when our sewer drain got completely clogged. Tiago handled the job with professionalism and efficiency, getting it done in no time. Highly recommended!",
  },
  {
    name: "Mark Smith",
    text:
      "Impressed with the expertise of Tiago's plumbing crew. They tackled a complex issue at our business promptly and with precision. Outstanding service!",
  },
];

const SERVICE_AREAS = [
  "Thousand Oaks",
  "Westlake Village",
  "Newbury Park",
  "Moorpark",
  "Simi Valley",
  "Agoura Hills",
  "Calabasas",
  "Camarillo",
  "Oxnard",
  "Ventura",
  "Santa Paula",
  "Fillmore",
];

/* ─── Page ───────────────────────────────────────────────────── */
export default function Page() {
  return (
    <main className="overflow-x-hidden">
      {/* Sticky header — logo + CTA only (no nav links) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Image src="/images/logo.png" alt="Conejo Bros Plumbing" width={150} height={59} className="h-10 w-auto" priority />
          <div className="flex items-center gap-3">
            <a href={PHONE_HREF} className="hidden sm:inline-flex items-center gap-2 text-navy font-bold hover:text-orange transition">
              <PhoneIcon className="w-5 h-5 text-orange" />
              {PHONE}
            </a>
            <a
              href="#quote"
              className="inline-flex items-center px-5 py-2.5 bg-orange hover:bg-orange-dark text-white font-bold rounded-lg transition shadow"
            >
              Free Quote
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section id="hero" className="relative bg-navy text-white hero-clip">
        <div className="absolute inset-0 z-0">
          <Image src="/images/hero-plumber.jpg" alt="Conejo Bros Plumbing technician at work" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/95 to-navy/40 lg:to-navy/20" />
          <div className="absolute inset-0 bg-grid" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-24 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange/15 border border-orange/30 text-orange-light rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
              <MapPinIcon className="w-4 h-4" />
              Thousand Oaks &amp; Ventura County · Open 24/7
            </div>
            <h1 className="font-[family-name:var(--font-display-bold)] text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Plumbing, Drain, Sewer &amp; Septic Experts You Can Trust
            </h1>
            <p className="mt-5 text-lg text-white/80 max-w-xl">
              From clogged drains and trenchless no-dig sewer repair to full in-house septic design and installation —
              Conejo Bros gets it done fast, clean, and right the first time. Licensed, insured, and serving the Conejo
              Valley for decades.
            </p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-3 max-w-xl">
              {[
                "24/7 emergency response",
                "In-house septic design & install",
                "Trenchless / no-dig repairs",
                "Upfront pricing, no surprises",
              ].map((b) => (
                <li key={b} className="flex items-center gap-2 text-white/90 text-sm">
                  <CheckIcon className="w-5 h-5 text-orange-light shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <DualCta center={false} label="Get My Free Quote" />
            </div>
            <div className="mt-6 flex items-center gap-3 text-white/80 text-sm">
              <div className="flex text-orange-light">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4" />
                ))}
              </div>
              5-star rated by Conejo Valley homeowners
            </div>
          </div>

          <div className="lg:pl-6" id="quote">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section id="trust-bar" className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-7 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <ShieldIcon className="w-7 h-7" />, t: "Licensed & Insured", s: "CA-certified plumbers" },
            { icon: <BadgeIcon className="w-7 h-7" />, t: "BBB Accredited", s: "A+ trusted local business" },
            { icon: <ClockIcon className="w-7 h-7" />, t: "Open 24/7", s: "Real emergency response" },
            { icon: <CashIcon className="w-7 h-7" />, t: "0% Financing", s: "GreenSky® plans available" },
          ].map((item) => (
            <Reveal key={item.t} className="flex items-center gap-3">
              <div className="text-orange shrink-0">{item.icon}</div>
              <div>
                <div className="font-bold text-navy text-sm">{item.t}</div>
                <div className="text-text-muted text-xs">{item.s}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-7">
          <DualCta />
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="bg-bg-light py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-orange font-bold uppercase tracking-wide text-sm">Full-Service Plumbing</span>
            <h2 className="font-[family-name:var(--font-display-bold)] text-3xl md:text-4xl font-extrabold text-navy mt-2">
              Everything Your Home or Property Needs — Under One Roof
            </h2>
            <p className="text-text-muted mt-4">
              Five core service lines, one trusted local team. Whether it&apos;s a midnight backup or a full septic system,
              Conejo Bros has the equipment, licensing, and in-house expertise to handle it.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <SepticIcon className="w-7 h-7" />,
                title: "Septic Tank Services",
                body:
                  "Complete septic care: inspection, pumping, replacement, and leach field / seepage pit installation. We are one of very few California companies that handle architectural design, geological testing, and installation entirely in-house — no third-party hand-offs, no finger-pointing, and full accountability from plan to pump.",
                href: "#septic",
              },
              {
                icon: <YardDrainIcon className="w-7 h-7" />,
                title: "Area & Yard Drains",
                body:
                  "Standing water and soggy yards are more than a nuisance — they damage foundations and landscaping. We design and install yard drains, French drains, and patio drains, and repair failing drainage systems to keep water moving away from your home for good.",
                href: "#yard-drains",
              },
              {
                icon: <DrainIcon className="w-7 h-7" />,
                title: "Drain Cleaning",
                body:
                  "Sewer and drain clearing, high-pressure hydro jetting, and 24/7 emergency drain service. We cut through grease, roots, and years of buildup, then verify the line is fully clear so the clog doesn't come back next week.",
                href: "#drain-cleaning",
              },
              {
                icon: <WrenchIcon className="w-7 h-7" />,
                title: "Core Plumbing & Emergency",
                body:
                  "Leak detection, water heater repair, fixture replacement, and around-the-clock 24/7 emergency plumbing. When a pipe bursts at 2 a.m., a real Conejo Bros technician answers — and shows up ready to fix it.",
                href: "#core-plumbing",
              },
              {
                icon: <PipeIcon className="w-7 h-7" />,
                title: "Trenchless / No-Dig Sewer Repair",
                body:
                  "Replace or rehabilitate failing sewer lines without tearing up your yard, driveway, or hardscape. We offer CIPP relining, pipe bursting, epoxy rehabilitation, and robotic trenchless technology — faster, cleaner, and far less disruptive than traditional digging.",
                href: "#trenchless",
              },
              {
                icon: <CameraIcon className="w-7 h-7" />,
                title: "Camera Inspection & Diagnostics",
                body:
                  "HD sewer camera inspections pinpoint the exact location and cause of a problem — roots, bellies, cracks, or blockages — so you only pay to fix what's actually broken. Ideal for real-estate inspections and recurring backups.",
                href: "#core-plumbing",
              },
            ].map((s, i) => (
              <Reveal key={s.title} delay={i * 60}>
                <a
                  href={s.href}
                  className="group block h-full bg-white rounded-2xl border border-border p-6 hover:border-orange/50 hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange/10 text-orange flex items-center justify-center mb-4 group-hover:bg-orange group-hover:text-white transition-colors">
                    {s.icon}
                  </div>
                  <h3 className="font-bold text-lg text-navy mb-2">{s.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{s.body}</p>
                </a>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12">
            <DualCta />
          </Reveal>
        </div>
      </section>

      {/* ── Septic spotlight ── */}
      <section id="septic" className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal className="order-2 lg:order-1">
            <span className="text-orange font-bold uppercase tracking-wide text-sm">Septic Tank Services</span>
            <h2 className="font-[family-name:var(--font-display-bold)] text-3xl md:text-4xl font-extrabold text-navy mt-2">
              In-House Septic Design, Testing &amp; Installation
            </h2>
            <p className="text-text-muted mt-4 leading-relaxed">
              Most plumbers sub out septic work to outside engineers and installers. Conejo Bros is different — we are one
              of the very few California companies that handle architectural design, geological / percolation testing, and
              the full installation completely in-house. That means a single accountable team from the first soil test to
              the final inspection, faster permitting, and no costly miscommunication between contractors.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Septic tank inspection & certification (real-estate ready)",
                "Scheduled septic tank pumping & maintenance",
                "Full septic tank replacement & new system installs",
                "Leach field & seepage pit repair and installation",
                "In-house geological & percolation testing",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3 text-navy text-sm">
                  <CheckIcon className="w-5 h-5 text-orange shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <DualCta center={false} label="Schedule Septic Service" />
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2" delay={80}>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
              <Image src="/images/septic-tank.jpg" alt="Septic tank service by Conejo Bros Plumbing" width={1200} height={800} className="w-full h-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Trenchless spotlight ── */}
      <section id="trenchless" className="bg-navy text-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <Image src="/images/trenchless.jpg" alt="Trenchless no-dig sewer pipe before and after" width={1200} height={800} className="w-full h-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={80}>
            <span className="text-orange-light font-bold uppercase tracking-wide text-sm">Trenchless / No-Dig Sewer Repair</span>
            <h2 className="font-[family-name:var(--font-display-bold)] text-3xl md:text-4xl font-extrabold mt-2">
              Fix Your Sewer Line Without Destroying Your Yard
            </h2>
            <p className="text-white/80 mt-4 leading-relaxed">
              Traditional sewer replacement means excavators, torn-up driveways, and ruined landscaping. Our trenchless
              technology rehabilitates or replaces failing lines through small access points — saving your yard, your
              hardscape, and days of disruption.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {[
                { t: "CIPP Relining", d: "A new seamless pipe cured inside the old one." },
                { t: "Pipe Bursting", d: "Replaces the failed line as it pulls through." },
                { t: "Epoxy Rehabilitation", d: "Seals cracks and stops root intrusion." },
                { t: "Robotic Technology", d: "Precision repairs guided by HD camera." },
              ].map((c) => (
                <div key={c.t} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="font-bold text-orange-light">{c.t}</div>
                  <div className="text-white/75 text-sm mt-1">{c.d}</div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <DualCta center={false} label="Ask About No-Dig Repair" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Drain & Yard split ── */}
      <section id="drain-cleaning" className="bg-bg-light py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            <Reveal>
              <div className="h-full bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl transition">
                <Image src="/images/drain-cleaning.jpg" alt="Drain cleaning and hydro jetting" width={900} height={500} className="w-full h-52 object-cover" />
                <div className="p-7">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-orange/10 text-orange flex items-center justify-center">
                      <DrainIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-xl text-navy">Drain Cleaning &amp; Hydro Jetting</h3>
                  </div>
                  <p className="text-text-muted text-sm leading-relaxed">
                    Recurring backups usually mean buildup the snake can&apos;t reach. Our high-pressure hydro jetting scours
                    the full diameter of the pipe — blasting away grease, sludge, scale, and tree roots — then we camera-verify
                    the line is genuinely clear. Available 24/7 for emergency drain service across the Conejo Valley.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div id="yard-drains" className="h-full bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl transition">
                <Image src="/images/yard-drains.jpg" alt="Yard drain and French drain installation" width={900} height={500} className="w-full h-52 object-cover" />
                <div className="p-7">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-orange/10 text-orange flex items-center justify-center">
                      <YardDrainIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-xl text-navy">Area &amp; Yard Drainage</h3>
                  </div>
                  <p className="text-text-muted text-sm leading-relaxed">
                    Pooling water erodes soil, floods walkways, and threatens your foundation. We design and install yard
                    drains, French drains, and patio drains — and repair systems that have clogged or collapsed — so storm
                    runoff is channeled safely away from your home and landscaping.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
          <Reveal className="mt-10">
            <DualCta />
          </Reveal>
        </div>
      </section>

      {/* ── Core plumbing + emergency ── */}
      <section id="core-plumbing" className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <span className="text-orange font-bold uppercase tracking-wide text-sm">Core Plumbing &amp; 24/7 Emergency</span>
            <h2 className="font-[family-name:var(--font-display-bold)] text-3xl md:text-4xl font-extrabold text-navy mt-2">
              A Real Plumber Answers — Day or Night
            </h2>
            <p className="text-text-muted mt-4 leading-relaxed">
              Plumbing emergencies don&apos;t wait for business hours, and neither do we. From hidden slab leaks to a
              water heater that quit on a cold morning, our licensed technicians arrive prepared to diagnose and fix the
              problem on the first visit.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {[
                { icon: <DropletIcon className="w-6 h-6" />, t: "Leak Detection", d: "Pinpoint slab & hidden leaks fast." },
                { icon: <BoltIcon className="w-6 h-6" />, t: "Water Heater Repair", d: "Tank & tankless service and swaps." },
                { icon: <CameraIcon className="w-6 h-6" />, t: "Camera Diagnostics", d: "See the problem before we fix it." },
                { icon: <ClockIcon className="w-6 h-6" />, t: "24/7 Emergency", d: "Around-the-clock response." },
              ].map((c) => (
                <div key={c.t} className="flex gap-3">
                  <div className="text-orange shrink-0">{c.icon}</div>
                  <div>
                    <div className="font-bold text-navy text-sm">{c.t}</div>
                    <div className="text-text-muted text-xs">{c.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <DualCta center={false} label="Request Emergency Help" />
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
              <Image src="/images/camera-inspection.jpg" alt="Conejo Bros Plumbing camera inspection" width={1200} height={800} className="w-full h-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Financing ── */}
      <section id="financing" className="bg-bg-warm py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <Reveal className="bg-gradient-to-br from-orange to-orange-dark rounded-3xl p-8 md:p-12 text-white text-center shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-5">
              <CashIcon className="w-7 h-7" />
            </div>
            <h2 className="font-[family-name:var(--font-display-bold)] text-3xl md:text-4xl font-extrabold">
              Flexible Financing — 0% Interest Options Available
            </h2>
            <p className="mt-4 text-white/90 max-w-2xl mx-auto">
              A failing septic system or major sewer repair shouldn&apos;t have to wait. Through our GreenSky® financing
              partner, qualified homeowners can spread the cost over time — including 0% interest plans — so you can fix
              the problem now and pay on a schedule that works for you.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <a href="#quote" className="inline-flex items-center justify-center px-7 py-3.5 bg-white text-orange-dark font-bold rounded-xl hover:bg-white/90 transition shadow-lg">
                Ask About Financing
              </a>
              <a href={PHONE_HREF} className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 border-2 border-white/40 text-white font-bold rounded-xl hover:bg-white/20 transition">
                <PhoneIcon className="w-5 h-5" />
                {PHONE}
              </a>
            </div>
            <p className="mt-4 text-white/70 text-xs">Financing provided by GreenSky®. Subject to credit approval.</p>
          </Reveal>
        </div>
      </section>

      {/* ── Why us / About ── */}
      <section id="why-us" className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
              <Image src="/images/about-team.jpg" alt="Conejo Bros Plumbing team and service van" width={1200} height={800} className="w-full h-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={80}>
            <span className="text-orange font-bold uppercase tracking-wide text-sm">Why Conejo Bros</span>
            <h2 className="font-[family-name:var(--font-display-bold)] text-3xl md:text-4xl font-extrabold text-navy mt-2">
              Your Conejo Valley Plumbing, Drain &amp; Sewer Specialists
            </h2>
            <p className="text-text-muted mt-4 leading-relaxed">
              Conejo Bros Plumbing is a trusted, full-service plumbing company serving Thousand Oaks and the greater
              Conejo Valley. We&apos;ve built our reputation on fast, reliable, honest work and quality craftsmanship — backed
              by transparent communication from the first call to the final walkthrough.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-5">
              {[
                { icon: <BadgeIcon className="w-6 h-6" />, t: "Decades of Experience", d: "Local expertise you can count on." },
                { icon: <ShieldIcon className="w-6 h-6" />, t: "Licensed & Insured", d: "Fully certified CA plumbers." },
                { icon: <LeafIcon className="w-6 h-6" />, t: "In-House Septic", d: "Design, testing & install in-house." },
                { icon: <MapPinIcon className="w-6 h-6" />, t: "All of Ventura County", d: "Conejo Valley & surrounding cities." },
              ].map((c) => (
                <div key={c.t} className="flex gap-3">
                  <div className="text-orange shrink-0">{c.icon}</div>
                  <div>
                    <div className="font-bold text-navy text-sm">{c.t}</div>
                    <div className="text-text-muted text-xs">{c.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <DualCta center={false} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section id="reviews" className="bg-bg-light py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-orange font-bold uppercase tracking-wide text-sm">5-Star Reviews</span>
            <h2 className="font-[family-name:var(--font-display-bold)] text-3xl md:text-4xl font-extrabold text-navy mt-2">
              Trusted by Conejo Valley Homeowners
            </h2>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex text-orange">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-6 h-6" />
                ))}
              </div>
              <span className="text-navy font-bold">5.0</span>
              <span className="text-text-muted text-sm">on Google</span>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REVIEWS.map((r, i) => (
              <Reveal key={r.name} delay={i * 50}>
                <div className="h-full bg-white rounded-2xl border border-border p-6 hover:shadow-lg transition">
                  <div className="flex text-orange mb-3">
                    {[...Array(5)].map((_, j) => (
                      <StarIcon key={j} className="w-4 h-4" />
                    ))}
                  </div>
                  <p className="text-text-muted text-sm leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange/10 text-orange flex items-center justify-center font-bold text-sm">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-navy text-sm">{r.name}</div>
                      <div className="text-text-light text-xs">Verified Google Review</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10">
            <DualCta />
          </Reveal>
        </div>
      </section>

      {/* ── Service areas ── */}
      <section id="service-areas" className="bg-white py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <Reveal>
            <span className="text-orange font-bold uppercase tracking-wide text-sm">Where We Work</span>
            <h2 className="font-[family-name:var(--font-display-bold)] text-3xl md:text-4xl font-extrabold text-navy mt-2">
              Serving Thousand Oaks &amp; All of Ventura County
            </h2>
            <p className="text-text-muted mt-4 max-w-2xl mx-auto">
              Local, licensed, and just around the corner. If you&apos;re in the Conejo Valley or surrounding Ventura
              County, Conejo Bros has you covered.
            </p>
          </Reveal>
          <Reveal delay={60} className="mt-8 flex flex-wrap justify-center gap-3">
            {SERVICE_AREAS.map((c) => (
              <span key={c} className="inline-flex items-center gap-2 bg-bg-light border border-border rounded-full px-4 py-2 text-sm font-semibold text-navy">
                <MapPinIcon className="w-4 h-4 text-orange" />
                {c}
              </span>
            ))}
          </Reveal>
          <Reveal className="mt-10">
            <DualCta />
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-bg-light py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4">
          <Reveal className="text-center mb-10">
            <span className="text-orange font-bold uppercase tracking-wide text-sm">Common Questions</span>
            <h2 className="font-[family-name:var(--font-display-bold)] text-3xl md:text-4xl font-extrabold text-navy mt-2">
              Frequently Asked Questions
            </h2>
          </Reveal>
          <div className="space-y-3">
            {[
              {
                q: "Do you really handle septic design and installation in-house?",
                a: "Yes. Conejo Bros is one of very few California companies that performs architectural design, geological / percolation testing, and full installation entirely with our own team. That means one accountable crew from soil test to final inspection — no outside engineers or installers to coordinate.",
              },
              {
                q: "What does trenchless / no-dig sewer repair actually mean?",
                a: "Instead of excavating your yard or driveway to reach a damaged sewer line, we rehabilitate or replace it through small access points using CIPP relining, pipe bursting, or epoxy rehabilitation. It's faster, cleaner, and protects your landscaping and hardscape.",
              },
              {
                q: "Are you available for emergencies?",
                a: "We're open 24/7. When you call our emergency line, a real Conejo Bros technician responds — day, night, weekend, or holiday — and arrives prepared to fix the problem on the first visit.",
              },
              {
                q: "Do you offer financing?",
                a: "Yes. Through our GreenSky® financing partner, qualified homeowners can spread the cost of larger repairs and installations over time, including 0% interest plans. Ask us for details when you request your quote.",
              },
              {
                q: "Which areas do you serve?",
                a: "We serve Thousand Oaks, Westlake Village, Newbury Park, Moorpark, Simi Valley, Agoura Hills, Calabasas, Camarillo, Oxnard, Ventura, Santa Paula, Fillmore, and the surrounding Conejo Valley and Ventura County communities.",
              },
            ].map((f) => (
              <Reveal key={f.q}>
                <FaqItem q={f.q} a={f.a} />
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10">
            <DualCta />
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section id="contact" className="relative bg-navy text-white py-16 md:py-20">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <Reveal>
            <h2 className="font-[family-name:var(--font-display-bold)] text-3xl md:text-5xl font-extrabold">
              Ready to Fix It Right? Get Your Free Quote Today.
            </h2>
            <p className="mt-4 text-white/80 max-w-2xl mx-auto">
              Septic, drain, sewer, or emergency plumbing — Conejo Bros responds fast and gets it done. Call now or
              request your free, no-obligation quote.
            </p>
            <div className="mt-8">
              <DualCta />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer (legal-only) ── */}
      <footer className="bg-navy-light text-white/60 py-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-3 text-center">
          <div className="bg-white rounded-lg px-3 py-2 inline-block">
            <Image src="/images/logo.png" alt="Conejo Bros Plumbing" width={140} height={55} className="h-8 w-auto" />
          </div>
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Conejo Bros Plumbing. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ── Sticky mobile CTA (form/contact only — no phone) ── */}
      <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white border-t border-border p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <a href="#quote" className="w-full inline-flex items-center justify-center py-3 bg-orange text-white font-bold rounded-xl">
          Get My Free Quote
        </a>
      </div>

      {/* ── Desktop floating pill (form/contact only — no phone) ── */}
      <a
        href="#quote"
        className="fixed bottom-6 right-6 z-50 hidden md:inline-flex items-center gap-2 px-6 py-3.5 bg-orange hover:bg-orange-dark text-white font-bold rounded-full shadow-xl transition-all pulse-glow"
      >
        Get My Free Quote
      </a>
    </main>
  );
}
