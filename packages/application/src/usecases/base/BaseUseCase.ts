import type { ILogger } from "@sentinel/common/logger";
import { inject, injectable } from "inversify";
import { APPLICATION_TYPES } from "../../types.js";

@injectable()
export abstract class BaseUseCase<TInput, TOutput> {
	@inject(APPLICATION_TYPES.Logger)
	protected logger!: ILogger;

	abstract execute(input: TInput): Promise<TOutput>;
}
