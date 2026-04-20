import {
	APPLICATION_TYPES,
	type IngestThreatSignalCommandHandler,
} from "@sentinel/application";
import type { ILogger } from "@sentinel/common/logger";
import {
	DOMAIN_TYPES,
	type ThreatSource,
	type ThreatSourceKind,
} from "@sentinel/domain";
import { Bot, GrammyError, HttpError } from "grammy";
import { inject, injectable } from "inversify";

export type TelegramChannelConfig = {
	id: string;
	label?: string;
};

export type TelegramWatcherConfig = {
	botToken: string;
	channels: TelegramChannelConfig[];
};

@injectable()
export class TelegramWatcherService {
	private bot: Bot | null = null;
	private readonly sourceByChannelId: Map<string, ThreatSource>;

	constructor(
		@inject(DOMAIN_TYPES.TelegramWatcherConfig)
		private readonly config: TelegramWatcherConfig,
		@inject(APPLICATION_TYPES.IngestThreatSignalCommandHandler)
		private readonly ingestHandler: IngestThreatSignalCommandHandler,
		@inject(DOMAIN_TYPES.Logger)
		private readonly logger: ILogger,
	) {
		const kind: ThreatSourceKind = "telegram";
		this.sourceByChannelId = new Map(
			config.channels.map((c) => [
				c.id,
				{ kind, identifier: c.id, label: c.label },
			]),
		);
	}

	async start(): Promise<void> {
		if (this.bot) return;

		if (!this.config.botToken) {
			throw new Error(
				"TelegramWatcherService: TELEGRAM_BOT_TOKEN is required",
			);
		}

		if (this.config.channels.length === 0) {
			this.logger.warning(
				"telegram:no-channels-configured",
				{ hint: "Set TELEGRAM_CHANNELS to a non-empty JSON array" },
			);
		}

		const bot = new Bot(this.config.botToken);
		this.bot = bot;

		await bot.api.deleteWebhook();

		bot.on("channel_post", async (ctx) => {
			const chatId = String(ctx.chat.id);
			const source = this.sourceByChannelId.get(chatId);
			if (!source) {
				this.logger.info("telegram:channel-post-ignored", { chatId });
				return;
			}

			const post = ctx.channelPost;
			const content = post.text ?? post.caption ?? "";
			if (!content) {
				this.logger.info("telegram:empty-message-skipped", {
					chatId,
					messageId: post.message_id,
				});
				return;
			}

			try {
				await this.ingestHandler.execute({
					source,
					externalId: String(post.message_id),
					content,
					capturedAt: new Date(post.date * 1000),
				});
			} catch (error) {
				this.logger.error("telegram:ingest-failed", {
					chatId,
					messageId: post.message_id,
					err: (error as Error).message,
				});
			}
		});

		bot.catch((err) => {
			const cause = err.error;
			if (cause instanceof GrammyError) {
				this.logger.error("telegram:api-error", {
					description: cause.description,
				});
			} else if (cause instanceof HttpError) {
				this.logger.error("telegram:network-error", {
					err: cause.message,
				});
			} else {
				this.logger.error("telegram:unknown-error", { err: String(cause) });
			}
		});

		void bot
			.start({
				allowed_updates: ["channel_post"],
				onStart: (info) => {
					this.logger.info("telegram:watcher-started", {
						botUsername: info.username,
						channels: this.config.channels.length,
					});
				},
			})
			.catch((err) => {
				this.logger.error("telegram:polling-stopped", {
					err: (err as Error).message,
				});
			});
	}

	async stop(): Promise<void> {
		if (!this.bot) return;
		await this.bot.stop();
		this.bot = null;
		this.logger.info("telegram:watcher-stopped");
	}
}
