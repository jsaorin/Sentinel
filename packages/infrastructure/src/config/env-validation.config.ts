import { str } from "envalid";

const envValidationConfig = {
	DATABASE_URL: str(),
};

export default envValidationConfig;
