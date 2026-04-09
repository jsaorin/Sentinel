"use client";

import { useState } from "react";
import { Button } from "@sentinel/ui";
import { SearchIcon } from "@/components/icons";

export function SearchBar() {
	const [address, setAddress] = useState("");

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (address.trim()) {
			console.log("Searching wallet:", address.trim());
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col sm:flex-row gap-2 bg-bg-card border border-border-default rounded-xl p-2 shadow-lg hover:border-border-strong transition-colors mt-8"
		>
			<div className="flex flex-1 items-center gap-2 px-3">
				<SearchIcon className="w-5 h-5 text-text-tertiary shrink-0" />
				<input
					type="text"
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					placeholder="Search multisig wallet address..."
					className="flex-1 bg-transparent py-3 text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none text-md"
					aria-label="Search multisig wallet address"
				/>
			</div>
			<Button variant="primary" size="lg" type="submit">
				Analyze
			</Button>
		</form>
	);
}
