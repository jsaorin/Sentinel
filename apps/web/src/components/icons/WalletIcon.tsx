export function WalletIcon({ className = "w-5 h-5" }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
			<path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
			<path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
		</svg>
	);
}
