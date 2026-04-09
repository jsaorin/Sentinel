import { num, str } from "envalid";

const envValidationConfig = {
	API_PORT: num({ default: 3000 }),
	API_VERSION: str({ default: "v1" }),
	BASE_PATH: str({ default: "api" }),
	SOLANA_RPC_URL: str({ default: "https://api.mainnet-beta.solana.com" }),
};

export default envValidationConfig;
