"use client";

import { useState, type ReactNode } from "react";

type Tab = {
	id: string;
	label: string;
	content: ReactNode;
};

type MultisigTabsProps = {
	tabs: Tab[];
};

export function MultisigTabs({ tabs }: MultisigTabsProps) {
	const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");

	if (tabs.length === 0) return null;

	return (
		<>
			{/* Tab bar */}
			<div className="border-b border-border-subtle mb-6">
				<div className="flex items-center gap-6">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id)}
							className={[
								"pb-3 text-md font-semibold transition-colors relative",
								activeTab === tab.id
									? "text-text-primary"
									: "text-text-tertiary hover:text-text-secondary",
							].join(" ")}
						>
							{tab.label}
							{activeTab === tab.id && (
								<span className="absolute bottom-0 left-0 right-0 h-px bg-text-primary" />
							)}
						</button>
					))}
				</div>
			</div>

			{/* Tab content */}
			{tabs.find((t) => t.id === activeTab)?.content}
		</>
	);
}
