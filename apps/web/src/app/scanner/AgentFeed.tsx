"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@sentinel/ui";

const THINKING_VERBS = [
	"Scanning networks...",
	"Monitoring signals...",
	"Analyzing threats...",
	"Inspecting transactions...",
	"Correlating patterns...",
	"Watching mempool...",
	"Tracing signatures...",
	"Decoding payloads...",
	"Filtering noise...",
	"Scampering through data...",
];

function useTypewriter(
	texts: string[],
	typingSpeed = 50,
	deleteSpeed = 25,
	pauseMs = 1500,
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

type AgentMessage = {
	message: string;
	timestamp: Date;
};

type AgentFeedProps = {
	messages: AgentMessage[];
};

function ThinkingIndicator() {
	const text = useTypewriter(THINKING_VERBS);

	return (
		<div className="flex items-center gap-2 py-6">
			<span className="text-xs text-text-tertiary font-mono">
				{text}
				<span className="inline-block w-px h-3 bg-text-tertiary ml-0.5 animate-blink align-middle" />
			</span>
		</div>
	);
}

export function AgentFeed({ messages }: AgentFeedProps) {
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (messages.length > 0) {
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	return (
		<Card variant="default" padding="sm">
			<div className="flex items-center gap-2 px-2 pb-3 border-b border-border-subtle">
				<span className="relative flex h-2 w-2">
					<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safe opacity-75" />
					<span className="relative inline-flex h-2 w-2 rounded-full bg-safe" />
				</span>
				<span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
					Agent Activity
				</span>
			</div>

			<div className="mt-3 overflow-y-auto max-h-[400px] min-h-[120px] rounded-sm bg-bg-base p-3">
				{messages.map((msg, i) => (
					<div
						key={`${msg.timestamp.getTime()}-${i}`}
						className="py-0.5 flex gap-2 opacity-50"
					>
						<span className="text-xs text-text-tertiary font-mono shrink-0">
							{msg.timestamp.toLocaleTimeString("en-US", {
								hour12: false,
								hour: "2-digit",
								minute: "2-digit",
								second: "2-digit",
							})}
						</span>
						<span className="text-xs text-text-secondary font-mono wrap-break-word">
							{msg.message}
						</span>
					</div>
				))}
				<ThinkingIndicator />
				<div ref={bottomRef} />
			</div>
		</Card>
	);
}
