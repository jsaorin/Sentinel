"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Proposals", href: "/proposals" },
  { label: "Multisigs", href: "/multisigs" },
  { label: "Analyze", href: "/analyze" },
  { label: "Scanner", href: "/scanner" },
];

export function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [visible, setVisible] = useState(!isLanding);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  useEffect(() => {
    if (!isLanding) {
      setVisible(true);
      return;
    }
    window.scrollTo(0, 0);
    setVisible(false);
    function handleScroll() {
      setVisible(window.scrollY > 200);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLanding]);

  // Close mobile menu on every route change
  useEffect(() => {
    if (pathname) setMobileOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    if (pathname.startsWith(href)) return true;
    // Detail pages map to their parent nav link
    if (href === "/multisigs" && pathname.startsWith("/multisig/")) return true;
    if (href === "/proposals" && pathname.startsWith("/proposal/")) return true;
    return false;
  }

  function showBracket(href: string) {
    if (hoveredHref) return hoveredHref === href;
    return isActive(href);
  }

  return (
    <>
      <nav
        className={[
          "fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300",
          "bg-black/80 backdrop-blur-md",
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none",
        ].join(" ")}
      >
        {/* Bottom border — primary with fade on sides */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent 0%, #e0e0e0 20%, #e0e0e0 80%, transparent 100%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-md tracking-widest text-text-primary hover:text-white transition-colors"
          >
            SENTINEL
          </Link>

          {/* Desktop links */}
          <div
            className="hidden md:flex items-center h-full"
            onMouseLeave={() => setHoveredHref(null)}
          >
            {NAV_LINKS.map((link) => {
              const bracket = showBracket(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHoveredHref(link.href)}
                  className={[
                    "relative h-full flex items-center px-8 text-xs uppercase tracking-wider font-semibold transition-colors",
                    isActive(link.href)
                      ? "text-text-primary"
                      : "text-text-tertiary hover:text-text-primary",
                  ].join(" ")}
                >
                  {link.label}
                  {bracket && (
                    <>
                      {/* Left vertical — full height */}
                      <span className="absolute left-0 top-1/2 bottom-0 w-px bg-[#e0e0e0]" />
                      {/* Right vertical — full height */}
                      <span className="absolute right-0 top-1/2 bottom-0 w-px bg-[#e0e0e0]" />
                      {/* Left horizontal — fades toward text */}
                      <span
                        className="absolute left-0 top-1/2 w-7 h-px"
                        style={{
                          background:
                            "linear-gradient(to right, #e0e0e0, transparent)",
                        }}
                      />
                      {/* Right horizontal — fades toward text */}
                      <span
                        className="absolute right-0 top-1/2 w-7 h-px"
                        style={{
                          background:
                            "linear-gradient(to left, #e0e0e0, transparent)",
                        }}
                      />
                      {/* Hide base border under active link */}
                      <span className="absolute bottom-0 left-0 right-0 h-px bg-black" />
                    </>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={[
                "block w-5 h-px bg-text-primary transition-all duration-200",
                mobileOpen ? "rotate-45 translate-y-[3.5px]" : "",
              ].join(" ")}
            />
            <span
              className={[
                "block w-5 h-px bg-text-primary transition-all duration-200",
                mobileOpen ? "opacity-0" : "",
              ].join(" ")}
            />
            <span
              className={[
                "block w-5 h-px bg-text-primary transition-all duration-200",
                mobileOpen ? "-rotate-45 -translate-y-[3.5px]" : "",
              ].join(" ")}
            />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-md pt-24 px-8 md:hidden">
          <Link
            href="/"
            className="font-display text-md tracking-widest text-text-tertiary mb-8 block"
          >
            SENTINEL
          </Link>
          <div className="border-t border-border-subtle pt-8 flex flex-col gap-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "text-lg uppercase tracking-wider font-semibold transition-colors",
                  isActive(link.href)
                    ? "text-text-primary"
                    : "text-text-tertiary",
                ].join(" ")}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isLanding && <div className="h-16" />}
    </>
  );
}
