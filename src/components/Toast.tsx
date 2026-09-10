"use client";

import { useEffect, useState } from "react";

export type ToastMsg = { id: number; text: string; type?: "ok" | "warn" | "err" };

let pushFn: ((text: string, type?: ToastMsg["type"]) => void) | null = null;

export function toast(text: string, type?: ToastMsg["type"]) {
  pushFn?.(text, type);
}

export function ToastHost() {
  const [items, setItems] = useState<ToastMsg[]>([]);

  useEffect(() => {
    pushFn = (text, type) => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, text, type }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 3200);
    };
    return () => {
      pushFn = null;
    };
  }, []);

  return (
    <div className="toast-wrap" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast ${t.type || ""}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
