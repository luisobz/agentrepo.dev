"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AvatarSlot } from "@agentrepo/avatar";
import { cn } from "@agentrepo/ui";
import { Menu, X, ArrowUpRight, Search } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // The portfolio is an immersive standalone pitch: no repo chrome there.
  if (pathname?.startsWith("/portfolio")) {
    return null;
  }

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out flex justify-center px-4",
          isScrolled ? "pt-4" : "pt-0"
        )}
      >
        <div
          className={cn(
            "w-full transition-all duration-500 ease-out border",
            isScrolled
              ? "max-w-xl md:max-w-2xl bg-[var(--color-bg-warm-white)]/80 backdrop-blur-md rounded-full shadow-md px-6 py-2 border-[var(--color-border-soft)]"
              : "max-w-7xl bg-transparent border-transparent px-6 py-5"
          )}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-garnet)] flex items-center justify-center text-[var(--color-bg-base)] font-mono font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
                AR
              </div>
              <span
                className={cn(
                  "font-mono font-bold tracking-tight text-sm transition-opacity duration-300",
                  isScrolled ? "hidden sm:inline" : "inline"
                )}
              >
                agentrepo<span className="text-[var(--color-brand-garnet)]">.dev</span>
              </span>
            </Link>

            {/* Avatar perch: it flies here when it leaves the home hero */}
            <AvatarSlot
              id="header"
              preserveSpace={false}
              className="hidden items-center sm:flex [&>*]:scale-75"
            />

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/skills"
                className="font-sans text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-garnet)] transition-colors"
              >
                Skills
              </Link>
              <Link
                href="/agents"
                className="font-sans text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-garnet)] transition-colors"
              >
                Agents
              </Link>
              <Link
                href="/blog"
                className="font-sans text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-garnet)] transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/portfolio/luisbz"
                className="font-sans text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-garnet)] transition-colors inline-flex items-center gap-0.5"
              >
                Portfolio
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </nav>

            {/* CTA/Actions */}
            <div className="flex items-center gap-3">
              {/* Cmd+K trigger hint inside the header when full-sized */}
              {!isScrolled && (
                <button
                  onClick={() => {
                    const event = new KeyboardEvent("keydown", {
                      key: "k",
                      metaKey: true,
                      bubbles: true,
                    });
                    document.dispatchEvent(event);
                  }}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] border border-[var(--color-border-soft)] hover:border-[var(--color-border-medium)] transition-colors text-xs font-mono focus:outline-none"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                  <kbd className="bg-[var(--color-bg-base)] px-1.5 py-0.5 rounded text-[10px] border border-[var(--color-border-soft)]">
                    ⌘K
                  </kbd>
                </button>
              )}

              <Link
                href="/portfolio/luisbz#contact"
                className={cn(
                  "hidden sm:flex items-center justify-center font-sans font-medium text-xs rounded-full border border-[var(--color-brand-garnet)] transition-all",
                  isScrolled
                    ? "px-4 py-1.5 bg-[var(--color-brand-garnet)] text-[var(--color-bg-warm-white)] hover:bg-[var(--color-brand-garnet-deep)] hover:shadow-xs"
                    : "px-5 py-2 text-[var(--color-brand-garnet)] bg-transparent hover:bg-[var(--color-brand-garnet)] hover:text-[var(--color-bg-warm-white)]"
                )}
              >
                Hire Luis
              </Link>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex md:hidden p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] transition-colors focus:outline-none"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          "fixed top-[72px] left-4 right-4 z-40 md:hidden bg-[var(--color-bg-warm-white)] border border-[var(--color-border-soft)] rounded-2xl p-6 shadow-lg transition-all duration-300 ease-out origin-top",
          mobileMenuOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <nav className="flex flex-col gap-4">
          <Link
            href="/skills"
            onClick={() => setMobileMenuOpen(false)}
            className="font-sans text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand-garnet)] py-2 border-b border-[var(--color-border-soft)]/40"
          >
            Skills
          </Link>
          <Link
            href="/agents"
            onClick={() => setMobileMenuOpen(false)}
            className="font-sans text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand-garnet)] py-2 border-b border-[var(--color-border-soft)]/40"
          >
            Agents
          </Link>
          <Link
            href="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className="font-sans text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand-garnet)] py-2 border-b border-[var(--color-border-soft)]/40"
          >
            Blog
          </Link>
          <Link
            href="/portfolio/luisbz"
            onClick={() => setMobileMenuOpen(false)}
            className="font-sans text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand-garnet)] py-2 flex items-center justify-between"
          >
            <span>Portfolio</span>
            <ArrowUpRight className="w-4 h-4 opacity-60" />
          </Link>

          <Link
            href="/portfolio/luisbz#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-2 w-full flex items-center justify-center font-sans font-medium text-sm py-3 bg-[var(--color-brand-garnet)] text-[var(--color-bg-warm-white)] rounded-xl hover:bg-[var(--color-brand-garnet-deep)] shadow-sm"
          >
            Hire Luis Ballester
          </Link>
        </nav>
      </div>
    </>
  );
}
