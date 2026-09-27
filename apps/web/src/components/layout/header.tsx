"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AvatarSlot } from "@agentrepo/avatar";
import { cn } from "@agentrepo/ui";
import { Menu, X, ArrowUpRight, Search } from "lucide-react";
import { useT } from "../../lib/i18n/use-t";
import { LocaleSwitcher } from "./locale-switcher";

export function Header() {
  const t = useT();
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

  // On the dark playground page the transparent (not-scrolled) header sits on a
  // near-black backdrop, so its default dark text is unreadable. Once scrolled
  // the pill picks up its warm-white background and the default colors work.
  const onDark = !!pathname?.startsWith("/playground") && !isScrolled;

  const navLinkClass = cn(
    "font-sans text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-colors hover:text-[var(--color-brand-garnet)]",
    onDark ? "text-[#cfc6b8]" : "text-[var(--color-text-secondary)]"
  );

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
              ? "max-w-2xl md:max-w-4xl bg-[var(--color-bg-warm-white)]/80 backdrop-blur-md rounded-full shadow-md px-5 py-2 border-[var(--color-border-soft)]"
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
                  isScrolled ? "hidden sm:inline" : "inline",
                  onDark && "text-[#fdf8ef]"
                )}
              >
                agentrepo<span className="text-[var(--color-brand-garnet)]">.dev</span>
              </span>
            </Link>

            {/* Avatar perch: it flies here when it leaves the home hero */}
            <AvatarSlot
              id="header"
              preserveSpace={false}
              scale={0.75}
              className="hidden items-center sm:flex"
            />

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-5 lg:gap-6">
              <Link href="/skills" className={navLinkClass}>
                {t('nav.skills')}
              </Link>
              <Link href="/agents" className={navLinkClass}>
                {t('nav.agents')}
              </Link>
              <Link href="/blog" className={navLinkClass}>
                {t('nav.blog')}
              </Link>
              <Link href="/playground" className={navLinkClass}>
                {t('nav.playground')}
              </Link>
              <Link
                href="/portfolio/luisbz"
                className={cn(navLinkClass, "inline-flex items-center gap-0.5")}
              >
                {t('nav.portfolio')}
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </nav>

            {/* CTA/Actions */}
            <div className="flex items-center gap-3">
              <LocaleSwitcher className="hidden sm:flex" onDark={onDark} />
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
                  className={cn(
                    "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs font-mono focus:outline-none",
                    onDark
                      ? "bg-white/[0.06] text-[#cfc6b8] border border-white/15 hover:border-white/30"
                      : "bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] border border-[var(--color-border-soft)] hover:border-[var(--color-border-medium)]"
                  )}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{t('nav.search')}</span>
                  <kbd
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] border",
                      onDark
                        ? "bg-white/[0.06] border-white/15"
                        : "bg-[var(--color-bg-base)] border-[var(--color-border-soft)]"
                    )}
                  >
                    ⌘K
                  </kbd>
                </button>
              )}

              <Link
                href="/creator"
                className={cn(
                  "hidden sm:flex items-center justify-center font-sans font-medium text-xs whitespace-nowrap rounded-full border transition-all",
                  isScrolled
                    ? "px-4 py-1.5 border-[var(--color-brand-garnet)] bg-[var(--color-brand-garnet)] text-[var(--color-bg-warm-white)] hover:bg-[var(--color-brand-garnet-deep)] hover:shadow-xs"
                    : onDark
                      ? "px-5 py-2 border-[#c4909a] text-[#e8c2ca] bg-transparent hover:bg-[#c4909a] hover:text-[#14110f]"
                      : "px-5 py-2 border-[var(--color-brand-garnet)] text-[var(--color-brand-garnet)] bg-transparent hover:bg-[var(--color-brand-garnet)] hover:text-[var(--color-bg-warm-white)]"
                )}
              >
                {t('nav.hire')}
              </Link>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
                aria-expanded={mobileMenuOpen}
                className={cn(
                  "flex md:hidden p-1.5 rounded-lg transition-colors focus:outline-none",
                  onDark
                    ? "text-[#cfc6b8] hover:bg-white/[0.06]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]"
                )}
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
            {t('nav.skills')}
          </Link>
          <Link
            href="/agents"
            onClick={() => setMobileMenuOpen(false)}
            className="font-sans text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand-garnet)] py-2 border-b border-[var(--color-border-soft)]/40"
          >
            {t('nav.agents')}
          </Link>
          <Link
            href="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className="font-sans text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand-garnet)] py-2 border-b border-[var(--color-border-soft)]/40"
          >
            {t('nav.blog')}
          </Link>
          <Link
            href="/playground"
            onClick={() => setMobileMenuOpen(false)}
            className="font-sans text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand-garnet)] py-2 border-b border-[var(--color-border-soft)]/40"
          >
            {t('nav.playground')}
          </Link>
          <Link
            href="/portfolio/luisbz"
            onClick={() => setMobileMenuOpen(false)}
            className="font-sans text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand-garnet)] py-2 flex items-center justify-between"
          >
            <span>{t('nav.portfolio')}</span>
            <ArrowUpRight className="w-4 h-4 opacity-60" />
          </Link>

          <Link
            href="/creator"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-2 w-full flex items-center justify-center font-sans font-medium text-sm py-3 bg-[var(--color-brand-garnet)] text-[var(--color-bg-warm-white)] rounded-xl hover:bg-[var(--color-brand-garnet-deep)] shadow-sm"
          >
            {t('nav.hire')}
          </Link>
        </nav>
      </div>
    </>
  );
}
