import type { Metadata } from "next";
import { getMultisigList } from "@/lib/api";
import { MultisigsTable } from "./MultisigsTable";

export const metadata: Metadata = {
	title: "Multisigs",
	description:
		"Explore monitored Solana multisig wallets and their security scores.",
};

export default async function MultisigsPage() {
	const multisigs = await getMultisigList();

	return (
		<main className="min-h-screen">
			<div className="max-w-6xl mx-auto px-6 py-16">
				<div className="text-center mb-12">
					<h1 className="font-display text-3xl font-bold">Multisigs</h1>
					<p className="text-text-secondary mt-3 text-lg">
						Explore monitored Solana multisig wallets and their security scores.
					</p>
				</div>

				<MultisigsTable multisigs={multisigs} />
			</div>
		</main>
	);
}
