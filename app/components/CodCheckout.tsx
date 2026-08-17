"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { packs, priceLabel } from "../lib/packs";
import { track } from "../lib/pixel";
import {
  hasErrors,
  validateOrder,
  type OrderErrors,
  type OrderField,
  type OrderInput,
} from "../lib/validation";
import { useCheckout } from "./CheckoutProvider";

const promoImages = ["/promo/a1.webp", "/promo/a2.webp"];

const emptyValues = { fullName: "", address: "", city: "", phone: "" };

type Values = typeof emptyValues;

function Field({
  id,
  label,
  value,
  error,
  onChange,
  inputMode,
  autoComplete,
  placeholder,
}: {
  id: OrderField;
  label: string;
  value: string;
  error?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  inputMode?: "text" | "tel";
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-bold text-wine-950">
        {label}
      </label>
      <input
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        dir={inputMode === "tel" ? "ltr" : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-1.5 w-full scroll-mb-28 rounded-xl border bg-white px-3.5 py-2.5 text-sm text-wine-950 outline-none transition-colors duration-200 placeholder:text-wine-950/30 focus:border-wine-800 focus:ring-2 focus:ring-wine-800/15 ${
          error ? "border-red-500/70" : "border-wine-950/12"
        } ${inputMode === "tel" ? "text-start" : ""}`}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-[11px] font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CodCheckout() {
  const { selected, select, status, setStatus, sectionRef, registerSubmit, setInView } =
    useCheckout();

  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>(emptyValues);
  const [errors, setErrors] = useState<OrderErrors>({});
  const [touched, setTouched] = useState<Partial<Record<OrderField, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  /* The sticky CTA submits through the form itself, so there is exactly one submit path. */
  useEffect(() => {
    registerSubmit(() => formRef.current?.requestSubmit());
    return () => registerSubmit(null);
  }, [registerSubmit]);

  /*
   * Read inside the observer without making the observer depend on it —
   * listing `selected` in the deps would tear down and rebuild the
   * IntersectionObserver every time the customer picks a different pack.
   */
  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const initiateSent = useRef(false);

  useEffect(() => {
    const node = formRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);

        /* Funnel step: the form actually reached the screen. Once per visit. */
        if (entry.isIntersecting && !initiateSent.current) {
          initiateSent.current = true;
          const pack = selectedRef.current;
          track("InitiateCheckout", {
            value: pack.price,
            currency: "MAD",
            content_name: pack.name,
            content_ids: [pack.id],
            content_type: "product",
            num_items: 1,
          });
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [setInView]);

  const buildInput = useCallback(
    (next: Values): OrderInput => ({ packId: selected.id, ...next }),
    [selected.id],
  );

  /*
   * Validate on every keystroke, but only surface the error for fields the
   * visitor has actually typed in — otherwise an untouched form would light up
   * red the moment one character is entered anywhere.
   */
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setTouched((prev) => (prev[name as OrderField] ? prev : { ...prev, [name]: true }));
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        setErrors(validateOrder(buildInput(next)));
        return next;
      });
    },
    [buildInput],
  );

  /** An error is shown once its own field has been typed in, or after a submit. */
  const errorFor = useCallback(
    (field: OrderField) => (attempted || touched[field] ? errors[field] : undefined),
    [attempted, errors, touched],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (status === "submitting") return;

      setAttempted(true);
      setServerError(null);

      const input = buildInput(values);
      const found = validateOrder(input);
      setErrors(found);

      if (hasErrors(found)) {
        const firstInvalid = Object.keys(found)[0];
        formRef.current?.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
        return;
      }

      setStatus("submitting");
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { errors?: OrderErrors } | null;
          if (body?.errors) setErrors(body.errors);
          throw new Error("rejected");
        }
        /*
         * Purchase fires here, on the confirmed 201, rather than on
         * /thank-you. Firing it from that page would count a second sale every
         * time the customer refreshes it or reopens it from history, which
         * quietly inflates the numbers Meta optimises against. This path runs
         * exactly once per accepted order.
         *
         * The value is the server's total, not selected.price — the API prices
         * every order from its own pack table, so this reports what was really
         * charged even if the client's copy were stale.
         */
        const body = (await response.json().catch(() => null)) as { total?: number } | null;
        track("Purchase", {
          value: body?.total ?? selected.price,
          currency: "MAD",
          content_name: selected.name,
          content_ids: [selected.id],
          content_type: "product",
          num_items: 1,
        });

        setStatus("done");
        router.push("/thank-you");
      } catch {
        setStatus("idle");
        setServerError("تعذّر إرسال الطلب. المرجو المحاولة مرة أخرى.");
      }
    },
    [buildInput, router, selected, setStatus, status, values],
  );

  if (status === "done") {
    return (
      <section
        ref={sectionRef}
        id="cod-checkout"
        className="scroll-mt-4 bg-cream-50 px-5 py-9 md:px-8 md:py-11"
      >
        <div className="mx-auto max-w-[560px] rounded-2xl border border-wine-950/6 bg-white px-6 py-10 text-center shadow-[0_1px_3px_rgba(44,6,16,0.05)]">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-wine-50 ring-1 ring-wine-100 ring-inset">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="size-6 text-wine-800"
            >
              <path d="M5 12.8l4.2 4.2L19 6.6" />
            </svg>
          </span>
          <h2 className="mt-4 text-xl font-extrabold text-wine-950">تم إرسال طلبك بنجاح</h2>
          <p className="mt-2 text-sm text-wine-950/60">
            {selected.name} — {priceLabel(selected.price)} · الدفع عند الاستلام
          </p>
          {/* Shown only for the instant before the router lands on /thank-you. */}
          <p className="mt-1 text-xs text-wine-950/45">جاري التحويل…</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="cod-checkout"
      className="scroll-mt-4 bg-cream-50 px-5 py-9 md:px-8 md:py-11"
    >
      <div className="mx-auto max-w-[560px]">
        {/* One row at every width: circles at the inline start (right in RTL), text beside them. */}
        <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-wine-950/6 bg-white px-3 py-2.5 text-start shadow-[0_1px_3px_rgba(44,6,16,0.04)] sm:gap-4 sm:px-4 sm:py-3">
          <span className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {promoImages.map((src) => (
              <span
                key={src}
                className="relative size-12 overflow-hidden rounded-full ring-1 ring-wine-950/10 ring-inset sm:size-16"
              >
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              </span>
            ))}
          </span>
          <p className="min-w-0 text-[13px] font-bold leading-snug text-wine-950 sm:text-[15px]">
            استفد الآن من المكاسرات بالعسل في جميع الباقات
          </p>
        </div>

        <h2 className="text-balance text-center text-[19px] font-extrabold leading-[1.5] text-wine-950 sm:text-[22px]">
          يرجى ملء الاستمارة لإتمام الطلب والدفع عند الاستلام
        </h2>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 rounded-2xl border border-wine-950/6 bg-white p-4 shadow-[0_1px_3px_rgba(44,6,16,0.05)] sm:p-5"
        >
          {/* min-w-0: a fieldset defaults to min-width:min-content and would otherwise refuse to shrink. */}
          <fieldset className="min-w-0">
            <legend className="text-[13px] font-bold text-wine-950">اختر الباقة</legend>
            <div className="mt-2.5 space-y-2.5">
              {packs.map((pack) => {
                const isSelected = pack.id === selected.id;
                return (
                  <label
                    key={pack.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition-[border-color,background-color,box-shadow] duration-200 ${
                      isSelected
                        ? "border-wine-800 bg-cream-50 shadow-[0_0_0_1px_var(--color-wine-800)]"
                        : "border-wine-950/10 bg-white hover:border-wine-950/25"
                    }`}
                  >
                    <input
                      type="radio"
                      name="packId"
                      value={pack.id}
                      checked={isSelected}
                      onChange={() => select(pack.id)}
                      className="sr-only"
                    />
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-white">
                      <Image
                        src={pack.image}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-contain"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      {/* Wraps under the name on narrow screens instead of squeezing it. */}
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[14px] font-bold text-wine-950">{pack.name}</span>
                        {pack.pickerBadge && (
                          <span
                            className={`shrink-0 rounded-full px-2 py-[2px] text-[10px] font-bold leading-none ${
                              pack.pickerBadge.tone === "strong"
                                ? "bg-gold-500 text-wine-950"
                                : "bg-wine-50 text-wine-700 ring-1 ring-wine-100 ring-inset"
                            }`}
                          >
                            {pack.pickerBadge.text}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-wine-950/55">
                        {pack.description}
                      </span>
                    </span>
                    <span
                      dir="ltr"
                      className="shrink-0 text-[15px] font-extrabold text-wine-950 tabular-nums"
                    >
                      {priceLabel(pack.price)}
                    </span>
                    <span
                      aria-hidden
                      className={`grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors duration-200 ${
                        isSelected ? "border-wine-800" : "border-wine-950/20"
                      }`}
                    >
                      <span
                        className={`size-2.5 rounded-full transition-colors duration-200 ${
                          isSelected ? "bg-wine-800" : "bg-transparent"
                        }`}
                      />
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-5 space-y-3.5">
            <Field
              id="fullName"
              label="الاسم الكامل"
              value={values.fullName}
              error={errorFor("fullName")}
              onChange={handleChange}
              autoComplete="name"
            />
            <Field
              id="address"
              label="العنوان"
              value={values.address}
              error={errorFor("address")}
              onChange={handleChange}
              autoComplete="street-address"
            />
            <Field
              id="city"
              label="المدينة"
              value={values.city}
              error={errorFor("city")}
              onChange={handleChange}
              autoComplete="address-level2"
            />
            <Field
              id="phone"
              label="رقم الهاتف"
              value={values.phone}
              error={errorFor("phone")}
              onChange={handleChange}
              inputMode="tel"
              autoComplete="tel"
            />
          </div>

          <p className="mt-5 rounded-xl bg-cream-100 px-3.5 py-2.5 text-center text-[13px] font-bold text-wine-950">
            الدفع عند الاستلام
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-wine-950/8 pt-4">
            <span className="text-[15px] font-bold text-wine-950">المجموع</span>
            <span dir="ltr" className="text-[19px] font-extrabold text-wine-950 tabular-nums">
              {priceLabel(selected.price)}
            </span>
          </div>

          {serverError && (
            <p role="alert" className="mt-3 text-center text-[12px] font-medium text-red-600">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-wine-800 py-3 text-[14px] font-bold text-white transition-colors duration-200 hover:bg-wine-900 disabled:opacity-60"
          >
            {status === "submitting" ? "جاري الإرسال…" : "اطلب الآن"}
          </button>
        </form>
      </div>
    </section>
  );
}
