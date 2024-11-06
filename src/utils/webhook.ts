interface WebhookPayload {
  [key: string]: any;
}

export const sendWebhook = async (payload: WebhookPayload): Promise<void> => {
  const webhookUrl = process.env.WEBHOOK_URL as string | URL;
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("Webhook envoyé avec succès !", payload);
  } catch (error) {
    console.error("Erreur lors de l'envoi du webhook :", error);
  }
};
