import { PublicKey } from "@solana/web3.js";
import { z } from "zod";

export const CreateMultisigSchema = z.object({
	address: z.string().refine(
		(val) => {
			try {
				new PublicKey(val);
				return true;
			} catch {
				return false;
			}
		},
		{ message: "Invalid Solana address" },
	),
	label: z.string().max(255).optional(),
});

export type CreateMultisigParams = z.infer<typeof CreateMultisigSchema>;
