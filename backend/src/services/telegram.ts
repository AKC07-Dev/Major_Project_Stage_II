import https from 'https';

export async function sendTelegramNotification(message: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId || botToken.includes('your_')) {
    console.log('[Telegram Service] Bot token or chat ID not configured. Skipping telegram notification.');
    return false;
  }

  const encodedMessage = encodeURIComponent(message);
  const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodedMessage}`;

  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
        console.log('[Telegram Service] Notification sent successfully.');
        resolve(true);
      } else {
        console.error(`[Telegram Service] Failed to send notification. HTTP Status: ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.error('[Telegram Service] Error sending Telegram message:', err.message);
      resolve(false);
    });
  });
}
