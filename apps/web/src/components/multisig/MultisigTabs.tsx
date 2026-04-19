"use client";

import { useState, type ReactNode } from "react";

type Tab = {
	id: string;
	label: string;
	shortLabel?: string;
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
				<div className="flex items-center">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id)}
							className={[
								"flex-1 pb-3 text-xs sm:text-md font-semibold transition-colors relative text-center",
								activeTab === tab.id
									? "text-text-primary"
									: "text-text-tertiary hover:text-text-secondary",
							].join(" ")}
						>
							<span className="sm:hidden">{tab.shortLabel ?? tab.label}</span>
							<span className="hidden sm:inline">{tab.label}</span>
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
