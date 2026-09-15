"use client";

import { useState } from "react";
import type { Portfolio } from "@/content/portfolio";

export function MobileNav({ email }: { email: Portfolio["links"]["email"] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="menu"
        aria-expanded={open}
        aria-controls="primary-nav"
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">≡</span>
      </button>
      <nav id="primary-nav" className={`nav-links${open ? " open" : ""}`} aria-label="Primary navigation">
        <a href="#experience" onClick={() => setOpen(false)}>Experience</a>
        <a href="#capabilities" onClick={() => setOpen(false)}>Capabilities</a>
        <a href="#about" onClick={() => setOpen(false)}>About</a>
        <a className="contact-link" href={email} onClick={() => setOpen(false)}>Let&apos;s talk</a>
      </nav>
    </>
  );
}
