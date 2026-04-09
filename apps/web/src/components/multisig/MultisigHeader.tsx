"use client";

import { useGoBack } from "@/hooks/useGoBack";

export function MultisigHeader() {
	const goBack = useGoBack();

	return (
		<div className="max-w-6xl mx-auto px-6 py-8">
			<button
				type="button"
				onClick={goBack}
				className="text-text-tertiary text-md hover:text-text-primary transition-colors"
			>
				&larr; Back
			</button>
		</div>
	);
}
