const stateCache = "inteliagent-message-push-state";
const stateUrl = new URL("/__message_push_account__", self.location.origin)
  .href;
async function account() {
  const cache = await caches.open(stateCache);
  const value = await cache.match(stateUrl);
  return value ? value.json() : null;
}
self.addEventListener("install", (event) =>
  event.waitUntil(self.skipWaiting()),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);
self.addEventListener("message", (event) => {
  if (event.data?.type !== "MESSAGE_PUSH_ACCOUNT") return;
  event.waitUntil(
    (async () => {
      const cache = await caches.open(stateCache);
      if (
        event.data.previousUserId &&
        event.data.previousUserId !== (await account())
      )
        return;
      await cache.put(
        stateUrl,
        new Response(JSON.stringify(event.data.userId)),
      );
      if (!event.data.userId)
        (await self.registration.getNotifications()).forEach((item) =>
          item.close(),
        );
    })(),
  );
});
self.addEventListener("push", (event) =>
  event.waitUntil(
    (async () => {
      let payload;
      try {
        payload = event.data?.json();
      } catch {
        return;
      }
      if (
        !payload?.data ||
        Number(payload.data.recipientId) !== (await account())
      )
        return;
      const sender = Number(payload.data.senderId);
      if (!Number.isSafeInteger(sender) || sender < 1) return;
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      // The conversation itself already receives the message over Socket.IO.
      if (
        windows.some(
          (client) =>
            client.visibilityState === "visible" &&
            new URL(client.url).pathname === "/mensagens" &&
            new URL(client.url).searchParams.get("with") === String(sender),
        )
      )
        return;
      await self.registration.showNotification("Inteliagent", {
        body: "Você recebeu uma nova mensagem.",
        tag: "message-" + payload.data.messageId,
        data: {
          url: "/mensagens?with=" + sender,
          recipientId: payload.data.recipientId,
        },
      });
    })(),
  ),
);
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      if (Number(event.notification.data?.recipientId) !== (await account()))
        return;
      const url = new URL(event.notification.data.url, self.location.origin);
      if (url.origin !== self.location.origin || url.pathname !== "/mensagens")
        return;
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const client = windows.find(
        (item) => new URL(item.url).origin === self.location.origin,
      );
      if (client) {
        await client.navigate(url.href);
        await client.focus();
      } else await self.clients.openWindow(url.href);
    })(),
  );
});
