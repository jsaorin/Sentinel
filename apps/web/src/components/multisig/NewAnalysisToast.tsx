"use client";

import { WarningIcon } from "@/components/icons";
import { useRealtimeRoom } from "@/hooks/useRealtimeRoom";
import { REALTIME_ACTIONS, REALTIME_ROOMS } from "@sentinel/common/realtime";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const AUTO_DISMISS_MS = 8000;

type Toast = { id: string };

type NewAnalysisToastProps = {
	multisigId: string;
};

export function NewAnalysisToast({ multisigId }: NewAnalysisToastProps) {
	const router = useRouter();
	const [toasts, setToasts] = useState<Toast[]>([]);

	const dismiss = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const handleNewAnalysis = useCallback(() => {
		const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
		setToasts((prev) => [...prev, { id }]);
		setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
		router.refresh();
	}, [dismiss, router]);

	useRealtimeRoom(
		REALTIME_ROOMS.multisig(multisigId),
		REALTIME_ACTIONS.NEW_ANALYSIS_MULTISIG,
		handleNewAnalysis,
	);

	if (toasts.length === 0) return null;

	return (
		<div className="fixed top-20 right-4 z-[70] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-96">
			{toasts.map((t) => (
				<div
					key={t.id}
					role="alert"
					className="flex items-start gap-3 rounded-lg border-l-4 border-l-high bg-bg-card border border-border-default px-4 py-3 shadow-lg animate-in slide-in-from-right-4 fade-in duration-300"
				>
					<WarningIcon className="w-5 h-5 shrink-0 mt-0.5 text-high" />
					<div className="flex-1 min-w-0">
						<p className="text-md font-semibold text-high">
							New Analysis Available
						</p>
						<p className="mt-1 text-base text-text-secondary">
							A new security analysis was just generated for this multisig.
						</p>
					</div>
					<button
						type="button"
						onClick={() => dismiss(t.id)}
						className="shrink-0 text-text-tertiary hover:text-text-primary transition-colors"
						aria-label="Dismiss notification"
					>
						✕
					</button>
				</div>
			))}
		</div>
	);
}
