"use client";

import { useCallback, type ReactNode } from "react";

import { useCheckout } from "./CheckoutProvider";

/**
 * The "اطلب الآن" button on a product card: selects that pack and brings the
 * checkout form into view. It never navigates away from the page.
 */
export default function OrderButton({
  packId,
  className,
  children,
}: {
  packId: string;
  className?: string;
  children: ReactNode;
}) {
  const { select, sectionRef } = useCheckout();

  const openCheckout = useCallback(() => {
    select(packId);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [packId, select, sectionRef]);

  return (
    <button type="button" onClick={openCheckout} className={className}>
      {children}
    </button>
  );
}
