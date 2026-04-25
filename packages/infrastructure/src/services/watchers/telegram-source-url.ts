export function buildTelegramSourceUrl(
	chatId: string,
	messageId: string,
): string | null {
	if (chatId.startsWith("-100")) {
		return `https://t.me/c/${chatId.slice(4)}/${messageId}`;
	}
	return null;
}
