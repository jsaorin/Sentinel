"use client";

import { useState, useEffect, useRef } from "react";
import { SearchIcon } from "@/components/icons";

const PLACEHOLDERS = [
	"Search multisig wallet address...",
	"Analyze a Squads multisig...",
	"Check proposal risk score...",
];

function useTypewriter(
	texts: string[],
	typingSpeed = 60,
	deleteSpeed = 30,
	pauseMs = 2000,
) {
	const [display, setDisplay] = useState("");
	const indexRef = useRef(0);

	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout>;
		let charIndex = 0;
		let isDeleting = false;
		let currentTextIndex = indexRef.current;

		function tick() {
			const currentText = texts[currentTextIndex];

			if (!isDeleting) {
				charIndex++;
				setDisplay(currentText.slice(0, charIndex));

				if (charIndex === currentText.length) {
					isDeleting = true;
					timeout = setTimeout(tick, pauseMs);
					return;
				}
				timeout = setTimeout(tick, typingSpeed);
			} else {
				charIndex--;
				setDisplay(currentText.slice(0, charIndex));

				if (charIndex === 0) {
					isDeleting = false;
					currentTextIndex = (currentTextIndex + 1) % texts.length;
					indexRef.current = currentTextIndex;
					timeout = setTimeout(tick, 400);
					return;
				}
				timeout = setTimeout(tick, deleteSpeed);
			}
		}

		timeout = setTimeout(tick, 800);
		return () => clearTimeout(timeout);
	}, [texts, typingSpeed, deleteSpeed, pauseMs]);

	return display;
}

export function SearchBar() {
	const [address, setAddress] = useState("");
	const [focused, setFocused] = useState(false);
	const typewriterText = useTypewriter(PLACEHOLDERS);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (address.trim()) {
			console.log("Searching wallet:", address.trim());
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex items-center gap-2 bg-bg-card border border-border-default rounded-md p-2 shadow-lg hover:border-border-strong transition-colors mt-8 max-w-xl"
		>
			<div className="flex flex-1 items-center gap-2 px-3 relative min-w-0">
				<SearchIcon className="w-5 h-5 text-text-tertiary shrink-0" />
				{!address && !focused && (
					<span className="absolute left-11 right-0 text-text-tertiary text-md font-mono pointer-events-none truncate">
						{typewriterText}
						<span className="inline-block w-px h-4 bg-text-tertiary ml-0.5 animate-blink align-middle" />
					</span>
				)}
				<input
					type="text"
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					placeholder=""
					className="flex-1 bg-transparent py-3 text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none text-md min-w-0"
					aria-label="Search multisig wallet address"
				/>
			</div>
			<button
				type="submit"
				className="shrink-0 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors"
			>
				Analyze
			</button>
		</form>
	);
}
