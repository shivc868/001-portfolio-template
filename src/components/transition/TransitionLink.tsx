"use client";
import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { useTransition } from "./TransitionProvider";

type TransitionLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  /** Called before the exit animation starts — used to capture Flip state. */
  onNavigate?: () => void;
};

/**
 * Sitewide replacement for next/link: intercepts the click, plays the exit
 * animation, then pushes the route (§7). Prefetches on hover/focus so the
 * route is warm before the exit finishes.
 */
export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink({ href, onNavigate, onClick, children, ...rest }, ref) {
    const { navigate, prefetch } = useTransition();

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      // Let modified clicks (new tab etc.) behave natively
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      onNavigate?.();
      navigate(href);
    };

    return (
      <a
        ref={ref}
        href={href}
        onClick={handleClick}
        onMouseEnter={() => prefetch(href)}
        onFocus={() => prefetch(href)}
        {...rest}
      >
        {children}
      </a>
    );
  }
);
