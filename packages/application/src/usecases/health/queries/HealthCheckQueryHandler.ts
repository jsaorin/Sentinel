import { injectFromBase, injectable } from "inversify";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	HealthCheckQueryInputDto,
	HealthCheckQueryOutputDto,
} from "../dtos/HealthCheckQueryDto.js";

@injectable()
@injectFromBase()
export class HealthCheckQueryHandler extends BaseUseCase<
	HealthCheckQueryInputDto,
	HealthCheckQueryOutputDto
> {
	async execute(
		_input: HealthCheckQueryInputDto,
	): Promise<HealthCheckQueryOutputDto> {
		this.logger.debug("Health check requested");

		return {
			status: "ok",
		};
	}
}
