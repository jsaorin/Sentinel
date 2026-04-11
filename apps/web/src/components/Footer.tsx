import Link from "next/link";

const NAV_LINKS = [
  { label: "Proposals", href: "/proposals" },
  { label: "Multisigs", href: "/multisigs" },
  { label: "Analyze", href: "/analyze" },
  { label: "Scanner", href: "/scanner" },
];

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-20">
      {/* Top border — same gradient as navbar */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, #e0e0e0 20%, #e0e0e0 80%, transparent 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left — Logo + tagline */}
          <div>
            <Link href="/" className="inline-block">
              <img
                src="/sentinel-logo.png"
                alt="Sentinel"
                className="h-20 w-auto -translate-x-5"
              />
            </Link>
            <p className="text-text-tertiary text-smleading-relaxed">
              AI-Powered Multisig Security
            </p>
          </div>

          {/* Center — Navigation */}
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-text-secondary">
              Navigation
            </span>
            <nav className="mt-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-text-tertiary hover:text-text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right — Connect */}
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-text-secondary">
              Connect
            </span>
            <div className="mt-4 flex flex-col gap-3">
              <a
                href="mailto:ukhezo.web3@gmail.com"
                className="text-sm text-text-tertiary hover:text-text-primary transition-colors"
              >
                Contact Us
              </a>
              <a
                href="https://github.com/jsaorin/Sentinel"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-primary transition-colors"
              >
                <GitHubIcon className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-text-tertiary text-xs text-center">
            &copy; 2026 Sentinel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
