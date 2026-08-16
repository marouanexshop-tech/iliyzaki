"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import { packs, type Pack } from "../lib/packs";

export type CheckoutStatus = "idle" | "submitting" | "done";

type CheckoutValue = {
  selected: Pack;
  select: (id: string) => void;
  status: CheckoutStatus;
  setStatus: (status: CheckoutStatus) => void;
  sectionRef: RefObject<HTMLElement | null>;
  /** The form hands its submit function here so the sticky CTA runs the exact same path. */
  registerSubmit: (submit: (() => void) | null) => void;
  requestSubmit: () => void;
  inView: boolean;
  setInView: (inView: boolean) => void;
};

const CheckoutContext = createContext<CheckoutValue | null>(null);

export function useCheckout() {
  const value = useContext(CheckoutContext);
  if (!value) throw new Error("useCheckout must be used inside <CheckoutProvider>");
  return value;
}

export default function CheckoutProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState(packs[0].id);
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const submitRef = useRef<(() => void) | null>(null);

  const selected = useMemo(
    () => packs.find((pack) => pack.id === selectedId) ?? packs[0],
    [selectedId],
  );

  const registerSubmit = useCallback((submit: (() => void) | null) => {
    submitRef.current = submit;
  }, []);

  const requestSubmit = useCallback(() => {
    if (status === "submitting") return;

    if (inView && submitRef.current) {
      submitRef.current();
      return;
    }

    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [inView, status]);

  const value = useMemo(
    () => ({
      selected,
      select: setSelectedId,
      status,
      setStatus,
      sectionRef,
      registerSubmit,
      requestSubmit,
      inView,
      setInView,
    }),
    [selected, status, registerSubmit, requestSubmit, inView],
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}
