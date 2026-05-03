import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import environment from "../env/api-environment.js";

const REALM = "sentinel-admin";

function compareConstantTime(a: string, b: string): boolean {
	const bufA = Buffer.from(a, "utf8");
	const bufB = Buffer.from(b, "utf8");
	if (bufA.length !== bufB.length) return false;
	return timingSafeEqual(bufA, bufB);
}

export function basicAuth(): RequestHandler {
	return (req: Request, res: Response, next: NextFunction) => {
		const expectedUser = environment.adminBasicAuthUser;
		const expectedPass = environment.adminBasicAuthPass;

		// Refuse if creds are not configured. Defense-in-depth: never let an
		// unconfigured admin endpoint fall through to "open access".
		if (!expectedUser || !expectedPass) {
			res.status(503).json({
				message: "admin endpoints disabled",
				data: null,
			});
			return;
		}

		const header = req.headers.authorization;
		if (!header?.startsWith("Basic ")) {
			res.set("WWW-Authenticate", `Basic realm="${REALM}"`);
			res.status(401).json({ message: "unauthorized", data: null });
			return;
		}

		const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
		const idx = decoded.indexOf(":");
		const user = idx >= 0 ? decoded.slice(0, idx) : decoded;
		const pass = idx >= 0 ? decoded.slice(idx + 1) : "";

		const userOk = compareConstantTime(user, expectedUser);
		const passOk = compareConstantTime(pass, expectedPass);
		if (!userOk || !passOk) {
			res.set("WWW-Authenticate", `Basic realm="${REALM}"`);
			res.status(401).json({ message: "unauthorized", data: null });
			return;
		}

		next();
	};
}
