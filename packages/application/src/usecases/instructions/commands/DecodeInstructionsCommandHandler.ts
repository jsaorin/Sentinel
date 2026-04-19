import {
	DOMAIN_TYPES,
	type IDecodedInstructionRepository,
	type IInstructionDecoderService,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	DecodeInstructionsCommandInputDto,
	DecodeInstructionsCommandOutputDto,
} from "../dtos/DecodeInstructionsCommandDto.js";

@injectable()
@injectFromBase()
export class DecodeInstructionsCommandHandler extends BaseUseCase<
	DecodeInstructionsCommandInputDto,
	DecodeInstructionsCommandOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.DecodedInstructionRepository)
		private decodedInstructionRepository: IDecodedInstructionRepository,
		@inject(DOMAIN_TYPES.InstructionDecoderService)
		private instructionDecoderService: IInstructionDecoderService,
	) {
		super();
	}

	async execute(
		input: DecodeInstructionsCommandInputDto,
	): Promise<DecodeInstructionsCommandOutputDto> {
		const { instructions } = input;

		if (instructions.length === 0) {
			return { decoded: 0, unknown: 0, total: 0 };
		}

		this.logger.info("Decoding instructions", {
			count: instructions.length,
		});

		// 1. Decode all instructions
		const decodedData =
			await this.instructionDecoderService.decode(instructions);

		// 2. Upsert — creates new or replaces existing decoded data
		await this.decodedInstructionRepository.upsertMany(decodedData);

		const known = decodedData.filter((d) => d.isKnown).length;
		const unknown = decodedData.filter((d) => !d.isKnown).length;

		this.logger.info("Instructions decoded", {
			known,
			unknown,
			total: instructions.length,
		});

		return {
			decoded: known,
			unknown,
			total: instructions.length,
		};
	}
}
