"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { useMegaLeadForm } from "@/hooks/useMegaLeadForm";
import {
  DropletIcon,
  FireIcon,
  ShieldIcon,
  DrainIcon,
  TruckIcon,
  WrenchIcon,
  HandshakeIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  CheckIcon,
  BadgeIcon,
  StarIcon,
} from "@/components/icons";

const PHONE = "(661) 386-5265";
const PHONE_HREF = "tel:+16613865265";

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
  | "email"
  | "phone"
  | "zip"
  | "isHomeowner"
  | "timeframe";

/* ─── Dual CTA (phone LEFT, form CTA RIGHT) ──────────────────── */
function DualCta({ label = "Get Help Now", center = true }: { label?: string; center?: boolean }) {
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

  const timeframes = ["ASAP / Emergency", "Within a few days", "Just researching"];

  // Per-field validators. Return an error string, or "" when valid.
  function validateField(name: FieldName, value: string): string {
    switch (name) {
      case "firstName":
        return value.trim() ? "" : "Please enter your first name.";
      case "email":
        if (!value.trim()) return "";
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
      (form.timeframe === "ASAP / Emergency" || form.timeframe === "Within a few days");
    const disqualificationReason =
      form.isHomeowner !== "Yes"
        ? "not_homeowner"
        : form.timeframe === "Just researching"
        ? "timeframe_researching"
        : "";

    inFlightRef.current = true;
    setSubmitting(true);
    try {
      await submitLead({
        firstName: form.firstName.trim(),
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
          form_provider: "911-restoration-bakersfield-landing",
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
        <h3 className="text-2xl font-extrabold text-navy mb-2">Help is on the way!</h3>
        <p className="text-text-muted">
          A 911 Restoration team member will call you right away. Need help now? Call{" "}
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
        <h3 className="text-xl font-extrabold text-navy">Get Emergency Help Now</h3>
        <p className="text-sm text-text-muted mt-1">24/7 response · Free visual inspection · No obligation</p>
      </div>

      <div className="space-y-3">
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
          <label htmlFor="email" className={labelCls}>
            Email Address <span className="text-text-muted font-normal">(optional)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
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
            How soon do you need service? <span className="text-red">*</span>
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
        {submitting ? "Submitting..." : "Request Free Inspection"}
      </button>

      <p className="text-xs text-text-muted text-center mt-3">
        24/7 emergency response · IICRC-certified · ¡Hablamos Español!
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
    name: "Rocio Luna",
    text:
      "911 Restoration is an absolute blessing. Our entire home flooded, and it was bad. They dried out and reconstructed our entire home and did a gorgeous, quality job. They showed up when they said they would. Communication was the best, which brings comfort to a stressful situation. 10/10!",
  },
  {
    name: "Kristal Martinez",
    text:
      "The 911 Restoration team did a great job with demo, construction work, and cleaning! All with reasonable and affordable pricing. From speaking to the insurance company to scheduling all the work, they kept me in the loop every step of the way.",
  },
  {
    name: "Maylee Salas",
    text:
      "911 Restoration was able to help with a leak I had in my bedroom ceiling. They carefully and kindly moved and covered my things. They were patient enough to answer all my questions and were very professional. A positive experience.",
  },
];

const SERVICE_AREAS = [
  "Bakersfield",
  "Kern County",
  "Tulare County",
  "Arvin",
  "Delano",
  "Lamont",
  "Edison",
  "Tehachapi",
  "McFarland",
  "Pine Mountain Club",
  "Oildale",
  "Wasco",
  "Lost Hills",
  "Shafter",
  "Mettler",
  "Wheeler Ridge",
  "Buttonwillow",
];

/* ─── Page ───────────────────────────────────────────────────── */
export default function Page() {
  return (
    <main className="overflow-x-hidden lp-sticky-safe">
      {/* Sticky header: logo + CTA only (no nav links) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Image src="/images/logo.png" alt="911 Restoration of Bakersfield" width={150} height={59} className="h-10 w-auto" priority />
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 bg-orange/10 text-orange text-xs font-bold rounded-full px-3 py-1.5">
              ¡Hablamos Español!
            </span>
            <a href={PHONE_HREF} className="hidden sm:inline-flex items-center gap-2 text-navy font-bold hover:text-orange transition">
              <PhoneIcon className="w-5 h-5 text-orange" />
              {PHONE}
            </a>
            <a
              href="#quote"
              className="inline-flex items-center px-5 py-2.5 bg-orange hover:bg-orange-dark text-white font-bold rounded-lg transition shadow"
            >
              Get Help Now
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section id="hero" className="relative bg-navy text-white hero-clip">
        <div className="absolute inset-0 z-0">
          <Image src="/images/hero.jpg" alt="911 Restoration technician with drying equipment" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/95 to-navy/40 lg:to-navy/20" />
          <div className="absolute inset-0 bg-grid" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-24 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange/15 border border-orange/30 text-orange-light rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
              <MapPinIcon className="w-4 h-4" />
              Bakersfield &amp; Kern County · Available 24/7
            </div>
            <h1 className="font-[family-name:var(--font-display-bold)] text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Water, Fire &amp; Mold Damage? We&apos;ll Be There in 45 Minutes.
            </h1>
            <p className="mt-5 text-lg text-white/80 max-w-xl">
              Bakersfield water damage restoration and mold remediation for ceiling leaks, flooding, and mold growth.
              IICRC-certified, family-owned since 2018, and bilingual (¡Hablamos Español!). We provide a free visual
              inspection and bill your insurance directly.
            </p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-3 max-w-xl">
              {[
                "45-minute emergency response",
                "24/7/365 availability",
                "IICRC-certified technicians",
                "Direct insurance claim support",
              ].map((b) => (
                <li key={b} className="flex items-center gap-2 text-white/90 text-sm">
                  <CheckIcon className="w-5 h-5 text-orange-light shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <DualCta center={false} label="Get Help Now" />
            </div>
            <div className="mt-6 flex items-center gap-3 text-white/80 text-sm">
              <div className="flex text-orange-light">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4" />
                ))}
              </div>
              4.9★ from 300+ reviews
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
            { icon: <BadgeIcon className="w-7 h-7" />, t: "IICRC-Certified", s: "Trained, certified technicians" },
            { icon: <ClockIcon className="w-7 h-7" />, t: "45-Min Response", s: "Fast on-site arrival" },
            { icon: <ShieldIcon className="w-7 h-7" />, t: "Available 24/7", s: "Every day of the year" },
            { icon: <HandshakeIcon className="w-7 h-7" />, t: "Hablamos Español", s: "Bilingual insurance support" },
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
            <span className="text-orange font-bold uppercase tracking-wide text-sm">Complete Restoration</span>
            <h2 className="font-[family-name:var(--font-display-bold)] text-3xl md:text-4xl font-extrabold text-navy mt-2">
              One Team for Every Disaster: From Emergency to Rebuild
            </h2>
            <p className="text-text-muted mt-4">
              Water, fire, smoke, mold, or sewage: our IICRC-certified crews handle the full recovery, from the first
              extraction to the final reconstruction. We work directly with your insurance every step of the way.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <DropletIcon className="w-7 h-7" />,
                title: "Water Damage Restoration",
                body:
                  "Burst pipes, appliance leaks, flooding, and sewage backups demand a fast response. We provide 24/7 emergency water extraction, structural drying, and industrial dehumidification, removing every trace of moisture before it warps floors, ruins drywall, or feeds mold. We document everything for your insurance claim.",
                href: "#water-damage",
              },
              {
                icon: <FireIcon className="w-7 h-7" />,
                title: "Fire & Smoke Damage Restoration",
                body:
                  "After a fire, every hour counts. Our team handles emergency board-up, soot and smoke remediation, odor removal, and contents cleaning, then rebuilds what was lost. From a single scorched room to a full structural rebuild, we restore your property and your peace of mind.",
                href: "#fire-damage",
              },
              {
                icon: <ShieldIcon className="w-7 h-7" />,
                title: "Mold Removal & Remediation",
                body:
                  "Mold threatens both your home and your health. We contain the affected area, run HEPA filtration, and apply antimicrobial treatment to eliminate the problem at its source. The result is a clean, healthy environment with the air quality your family deserves.",
                href: "#mold-remediation",
              },
              {
                icon: <DrainIcon className="w-7 h-7" />,
                title: "Sewage Cleanup",
                body:
                  "Sewage backups are a serious biohazard that should never be handled alone. Our technicians safely extract contaminated water, then sanitize and decontaminate every affected surface using professional-grade equipment, restoring a safe, sanitary space for your family or staff.",
                href: "#water-damage",
              },
              {
                icon: <TruckIcon className="w-7 h-7" />,
                title: "Commercial Restoration",
                body:
                  "Businesses, property managers, and large complexes can't afford extended downtime. We mobilize quickly with the crews and equipment to restore commercial properties of any size, minimizing disruption and getting you back to business as fast as safely possible.",
                href: "#water-damage",
              },
              {
                icon: <WrenchIcon className="w-7 h-7" />,
                title: "Disaster Restoration & Reconstruction",
                body:
                  "We're a true full-service partner, handling everything from emergency mitigation through complete reconstruction. One accountable team manages the entire project, so you never have to coordinate multiple contractors or wonder who's responsible for the final result.",
                href: "#fire-damage",
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

      {/* ── Water damage spotlight ── */}
      <section id="water-damage" className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal className="order-2 lg:order-1">
            <span className="text-orange font-bold uppercase tracking-wide text-sm">Water Damage Restoration</span>
            <h2 className="font-[family-name:var(--font-display-bold)] text-3xl md:text-4xl font-extrabold text-navy mt-2">
              Fast Water Extraction &amp; Complete Structural Drying
            </h2>
            <p className="text-text-muted mt-4 leading-relaxed">
              Water spreads fast and damage compounds by the hour. The moment you call, our IICRC-certified crew is on
              the way to stop the source, extract standing water, and dry your property to the studs, preventing the
              warping, rot, and mold that turn a small leak into a major rebuild.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "24/7 emergency water extraction",
                "Advanced drying & dehumidification equipment",
                "Moisture mapping to find hidden water",
                "Proactive mold prevention treatment",
                "Full insurance documentation & direct billing",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3 text-navy text-sm">
                  <CheckIcon className="w-5 h-5 text-orange shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <DualCta center={false} label="Start My Water Cleanup" />
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2" delay={80}>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
              <Image src="/images/water-damage.jpg" alt="Water damage restoration and structural drying" width={1200} height={800} className="w-full h-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Fire & smoke spotlight ── */}
      <section id="fire-damage" className="bg-navy text-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-orange-light font-bold uppercase tracking-wide text-sm">Fire &amp; Smoke</span>
            <h2 className="font-[family-name:var(--font-display-bold)] text-3xl md:text-4xl font-extrabold mt-2">
              From Soot &amp; Smoke Back to Pre-Loss Condition
            </h2>
            <p className="text-white/80 mt-4">
              A house fire leaves behind more than char. Our certified team handles the full recovery, safely and
              thoroughly, with the documentation your insurer needs.
            </p>
          </Reveal>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <Reveal>
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <Image src="/images/fire-damage.jpg" alt="Fire and smoke damage restoration in a Bakersfield home" width={1200} height={800} className="w-full h-full object-cover" />
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange/20 text-orange-light flex items-center justify-center shrink-0">
                  <FireIcon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-2xl">Fire &amp; Smoke Damage Restoration</h3>
              </div>
              <p className="text-white/75 leading-relaxed">
                We respond immediately with emergency board-up to secure your property, then remove soot, neutralize
                smoke odor, and clean salvageable contents. When mitigation is complete, our crews rebuild the affected
                areas, returning your home or business to its pre-loss condition.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Emergency board-up & structural stabilization",
                  "Soot removal & smoke odor neutralization",
                  "Contents cleaning & pack-out",
                  "Full reconstruction of damaged areas",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-white/90 text-sm">
                    <CheckIcon className="w-5 h-5 text-orange-light shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <DualCta center={false} label="Start My Fire Cleanup" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Mold remediation spotlight ── */}
      <section id="mold-remediation" className="bg-bg-light py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal className="order-2 lg:order-1">
            <span className="text-orange font-bold uppercase tracking-wide text-sm">Mold Remediation</span>
            <h2 className="font-[family-name:var(--font-display-bold)] text-3xl md:text-4xl font-extrabold text-navy mt-2">
              Mold Remediation &amp; Removal in Bakersfield
            </h2>
            <p className="text-text-muted mt-4 leading-relaxed">
              Mold thrives on hidden moisture and spreads fast. We contain the affected area, run HEPA filtration, and
              apply antimicrobial treatment to eliminate mold at the source, restoring clean, healthy air so your
              family or staff can breathe easy again.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Mold containment",
                "HEPA filtration",
                "Antimicrobial treatment",
                "Residential and commercial remediation",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3 text-navy text-sm">
                  <CheckIcon className="w-5 h-5 text-orange shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <a
                href="#quote"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-orange hover:bg-orange-dark text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Get Mold Removal Help
              </a>
              <a
                href={PHONE_HREF}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white border-2 border-navy/15 hover:border-orange text-navy font-bold rounded-xl transition-all"
              >
                <PhoneIcon className="w-5 h-5 text-orange" />
                {PHONE}
              </a>
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2" delay={80}>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
              <Image src="/images/mold-removal.jpg" alt="Mold removal and remediation in a Bakersfield property" width={1200} height={800} className="w-full h-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Why us / About ── */}
      <section id="why-us" className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
              <Image src="/images/team.jpg" alt="911 Restoration of Bakersfield team" width={1200} height={800} className="w-full h-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={80}>
            <span className="text-orange font-bold uppercase tracking-wide text-sm">Why 911 Restoration</span>
            <h2 className="font-[family-name:var(--font-display-bold)] text-3xl md:text-4xl font-extrabold text-navy mt-2">
              Bakersfield&apos;s Most Trusted Restoration Team
            </h2>
            <p className="text-text-muted mt-4 leading-relaxed">
              911 Restoration of Bakersfield is a family-owned company serving Kern County since 2018. Our technicians
              bring 27 years of combined experience and full IICRC certification to every job, backed by a 45-minute
              emergency response and true 24/7 availability.
            </p>
            <p className="text-text-muted mt-4 leading-relaxed">
              We know disaster is stressful, so we make the recovery simple. Every job starts with a free visual
              inspection, and our bilingual team works directly with your insurance company, keeping you informed from
              the first call to the final walkthrough.
            </p>
            <p className="text-text-muted mt-4 leading-relaxed">
              That&apos;s the &ldquo;Fresh Start&rdquo; promise: fast, honest, certified restoration that gets your home
              or business, and your life, back to normal.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-5">
              {[
                { icon: <BadgeIcon className="w-6 h-6" />, t: "IICRC-Certified", d: "Trained, certified crews." },
                { icon: <ClockIcon className="w-6 h-6" />, t: "45-Min Response", d: "24/7/365 availability." },
                { icon: <HandshakeIcon className="w-6 h-6" />, t: "Insurance Support", d: "We bill your insurer directly." },
                { icon: <MapPinIcon className="w-6 h-6" />, t: "Family-Owned", d: "Serving Kern County since 2018." },
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
              Trusted by Bakersfield Homeowners
            </h2>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex text-orange">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-6 h-6" />
                ))}
              </div>
              <span className="text-navy font-bold">4.9</span>
              <span className="text-text-muted text-sm">· 300+ reviews</span>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
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
                      <div className="text-text-light text-xs">Verified Review</div>
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
              Serving Bakersfield &amp; All of Kern County
            </h2>
            <p className="text-text-muted mt-4 max-w-2xl mx-auto">
              Local, certified, and ready to respond fast. If you&apos;re in Bakersfield or the surrounding Kern and
              Tulare County communities, 911 Restoration has you covered, 24/7.
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
                q: "How fast can you get to my property?",
                a: "We aim to be on-site within 45 minutes of your call, and we're available 24 hours a day, 365 days a year. When water, fire, or sewage is spreading, every minute matters, so a real technician answers and dispatches a crew right away.",
              },
              {
                q: "Do you work with my insurance company?",
                a: "Yes. We provide direct insurance claim support and bill most carriers directly. Our team documents all damage thoroughly, communicates with your adjuster, and handles the paperwork, so you can focus on your family instead of fighting your claim.",
              },
              {
                q: "¿Hablan español? Do you have bilingual staff?",
                a: "¡Sí! Our team is fully bilingual in English and Spanish. From your first call through the final walkthrough, including all insurance communication, we can assist you in the language you're most comfortable with.",
              },
              {
                q: "Is the inspection really free?",
                a: "Absolutely. We provide a free visual inspection with no obligation. A certified technician assesses the damage, explains your options, and gives you a clear plan before any work begins.",
              },
              {
                q: "What should I do first after water damage?",
                a: "If it's safe, stop the water source and shut off electricity to affected areas, then move valuables to a dry spot. Avoid walking through standing water near outlets. Then call us at (661) 386-5265. The faster we extract and dry, the less damage spreads and the lower the cost of restoration.",
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
              Disaster Won&apos;t Wait. Neither Do We.
            </h2>
            <p className="mt-4 text-white/80 max-w-2xl mx-auto">
              Water, fire, mold, or sewage: our IICRC-certified team responds in 45 minutes, 24/7, with a free visual
              inspection and direct insurance billing. Call now or request your free inspection.
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
            <Image src="/images/logo.png" alt="911 Restoration of Bakersfield" width={140} height={55} className="h-8 w-auto" />
          </div>
          <p className="text-xs text-white/50">4838 Burr St. Unit B, Bakersfield, CA 93308</p>
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} 911 Restoration of Bakersfield. All rights reserved.
          </p>
          <p className="text-xs text-white/40">Property Owners Only. Restrictions Apply.</p>
        </div>
      </footer>

      {/* ── Sticky mobile CTA: Call Now (primary) + Request an Inspection ── */}
      <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white border-t border-border px-3 pt-3 [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-stretch gap-3">
          <a
            href={PHONE_HREF}
            className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 py-3 bg-orange hover:bg-orange-dark text-white font-bold text-sm rounded-xl shadow-lg transition-all"
          >
            <PhoneIcon className="w-5 h-5" />
            Call Now
          </a>
          <a
            href="#quote"
            className="flex-1 min-h-[44px] inline-flex items-center justify-center py-3 bg-white border-2 border-navy/15 hover:border-orange text-navy font-bold text-sm text-center leading-tight rounded-xl transition-all"
          >
            Request an Inspection
          </a>
        </div>
      </div>

      {/* ── Desktop floating pill (form/contact only, no phone) ── */}
      <a
        href="#quote"
        className="fixed bottom-6 right-6 z-50 hidden md:inline-flex items-center gap-2 px-6 py-3.5 bg-orange hover:bg-orange-dark text-white font-bold rounded-full shadow-xl transition-all pulse-glow"
      >
        Get Help Now
      </a>
    </main>
  );
}
