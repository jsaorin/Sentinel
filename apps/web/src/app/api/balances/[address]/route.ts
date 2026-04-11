import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const HELIUS_API_KEY = process.env.HELIUS_API_KEY ?? "";
const RPC_URL = HELIUS_API_KEY
	? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
	: "https://api.mainnet-beta.solana.com";

const connection = new Connection(RPC_URL);

// Cache Jupiter token list in memory (refreshes on server restart)
let tokenMap: Map<string, { symbol: string; name: string }> | null = null;

async function getTokenMap() {
	if (tokenMap) return tokenMap;
	try {
		const res = await fetch("https://token.jup.ag/strict");
		const list: Array<{ address: string; symbol: string; name: string }> =
			await res.json();
		tokenMap = new Map(list.map((t) => [t.address, { symbol: t.symbol, name: t.name }]));
	} catch {
		tokenMap = new Map();
	}
	return tokenMap;
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ address: string }> },
) {
	const { address } = await params;

	try {
		const pubkey = new PublicKey(address);

		const [lamports, tokenAccounts, tMap] = await Promise.all([
			connection.getBalance(pubkey),
			connection.getParsedTokenAccountsByOwner(pubkey, {
				programId: TOKEN_PROGRAM_ID,
			}),
			getTokenMap(),
		]);

		const sol = lamports / 1e9;

		const tokens = tokenAccounts.value
			.map((account) => {
				const parsed = account.account.data.parsed.info;
				const mint = parsed.mint as string;
				const tokenInfo = tMap.get(mint);
				return {
					mint,
					symbol: tokenInfo?.symbol ?? null,
					name: tokenInfo?.name ?? null,
					amount: parsed.tokenAmount.amount as string,
					decimals: parsed.tokenAmount.decimals as number,
					uiAmount: parsed.tokenAmount.uiAmount as number | null,
				};
			})
			.filter((t) => t.uiAmount && t.uiAmount > 0)
			.sort((a, b) => (b.uiAmount ?? 0) - (a.uiAmount ?? 0));

		return NextResponse.json({ sol, tokens });
	} catch {
		return NextResponse.json(
			{ error: "Invalid address or RPC error" },
			{ status: 400 },
		);
	}
}
