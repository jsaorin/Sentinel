type SignerRowProps = {
	address: string;
	permissions: { initiate: boolean; vote: boolean; execute: boolean };
	isLast?: boolean;
};

export function SignerRow({
	address,
	permissions,
	isLast = false,
}: SignerRowProps) {
	const truncated = `${address.slice(0, 4)}...${address.slice(-4)}`;
	const pills = [
		permissions.initiate && "Initiate",
		permissions.vote && "Vote",
		permissions.execute && "Execute",
	].filter(Boolean) as string[];

	return (
		<div
			className={[
				"flex items-center justify-between py-4 px-2 hover:bg-bg-hover transition-colors",
				!isLast ? "border-b border-border-subtle" : "",
			].join(" ")}
		>
			<a
				href={`https://solscan.io/account/${address}`}
				target="_blank"
				rel="noopener noreferrer"
				className="font-mono text-md text-text-link hover:text-primary transition-colors truncate min-w-0"
			>
				{truncated}
			</a>
			<div className="flex items-center gap-2 shrink-0">
				{pills.map((p) => (
					<span
						key={p}
						className="px-2.5 py-1 text-xs font-semibold tracking-wider uppercase text-text-secondary bg-bg-raised border border-border-default rounded-md"
					>
						{p}
					</span>
				))}
				{pills.length === 0 && (
					<span className="px-2.5 py-1 text-xs font-semibold tracking-wider uppercase text-text-tertiary bg-bg-raised border border-border-subtle rounded-md">None</span>
				)}
			</div>
		</div>
	);
}
