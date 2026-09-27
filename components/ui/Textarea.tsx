"use client";

import React, { useCallback, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { fieldClass } from "./Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Grow with content instead of scrolling (default true). */
  autoGrow?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoGrow = true, value, ...props }, forwardedRef) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    const setRefs = useCallback(
      (el: HTMLTextAreaElement | null) => {
        innerRef.current = el;
        if (typeof forwardedRef === "function") forwardedRef(el);
        else if (forwardedRef) forwardedRef.current = el;
      },
      [forwardedRef]
    );

    useLayoutEffect(() => {
      const el = innerRef.current;
      if (!autoGrow || !el) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight + 2}px`;
    }, [value, autoGrow]);

    return (
      <textarea
        ref={setRefs}
        value={value}
        className={cn(fieldClass, "py-2 leading-relaxed min-h-[72px]", autoGrow && "resize-none overflow-hidden", className)}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
