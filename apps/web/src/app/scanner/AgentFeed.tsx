"use client";

import { useEffect, useRef } from "react";
import { Card } from "@sentinel/ui";

type AgentMessage = {
	message: string;
	timestamp: Date;
};

type AgentFeedProps = {
	messages: AgentMessage[];
};

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

			<div className="mt-3 overflow-y-auto max-h-[600px] rounded-sm bg-bg-base p-3">
				{messages.length === 0 ? (
					<p className="text-xs text-text-tertiary font-mono py-8 text-center">
						Waiting for agent messages...
					</p>
				) : (
					messages.map((msg, i) => (
						<div
							key={`${msg.timestamp.getTime()}-${i}`}
							className="py-0.5 flex gap-2"
						>
							<span className="text-xs text-text-tertiary font-mono shrink-0">
								{msg.timestamp.toLocaleTimeString("en-US", {
									hour12: false,
									hour: "2-digit",
									minute: "2-digit",
									second: "2-digit",
								})}
							</span>
							<span className="text-xs text-text-secondary font-mono break-words">
								{msg.message}
							</span>
						</div>
					))
				)}
				<div ref={bottomRef} />
			</div>
		</Card>
	);
}
