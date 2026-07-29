export async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  title: string,
  body: string
): Promise<boolean> {
  try {
    const messageText = `⏰ *تذكير بمهمة جديدة*\n\n📌 *${title}*\n📝 ${body}\n\nبالتوفيق في مذاكرتك! 💪`;

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "Markdown",
      }),
    });

    return res.ok;
  } catch (error) {
    console.error("❌ Failed to send Telegram message:", error);
    return false;
  }
}