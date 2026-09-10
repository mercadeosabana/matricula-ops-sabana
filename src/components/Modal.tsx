"use client";

import { ReactNode } from "react";

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md";
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/45 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full rounded-[10px] bg-cream-card border border-border shadow-xl ${
          size === "sm" ? "max-w-md" : "max-w-xl"
        }`}
      >
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h3 className="m-0 text-base font-semibold text-navy">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-lg px-3 text-sm text-navy/70 hover:bg-cream"
          >
            Cerrar
          </button>
        </header>
        <div className="px-4 py-4 text-sm leading-relaxed">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
