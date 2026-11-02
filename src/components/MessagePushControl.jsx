import { useEffect, useState } from "react";
import { IconButton, Tooltip, Snackbar, Alert } from "@mui/material";
import {
  NotificationsNoneOutlined,
  NotificationsActiveOutlined,
} from "@mui/icons-material";
import { api } from "../services/api";
import { CHAT_URL } from "../tools/config";
import { getSession } from "../services/session";
import { uuid } from "../tools/uuid";
const key = "inteliagent-web-push-installation";
const supported = () =>
  window.isSecureContext &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;
function installation() {
  let value = localStorage.getItem(key);
  if (!value) {
    value = uuid();
    localStorage.setItem(key, value);
  }
  return value;
}
export default function MessagePushControl({ user }) {
  const [enabled, setEnabled] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function register(ask = false) {
    if (!supported()) {
      if (ask)
        throw new Error(
          "Abra o painel em HTTPS ou localhost para ativar as notificações.",
        );
      return;
    }
    if (ask && (await Notification.requestPermission()) !== "granted")
      throw new Error(
        "Permita as notificações nas configurações do navegador.",
      );
    if (Notification.permission !== "granted") return;
    const { data } = await api.get(CHAT_URL + "/push/config");
    if (!data.webEnabled || !data.webPublicKey) {
      if (ask)
        throw new Error(
          "As notificações ainda não foram configuradas neste servidor.",
        );
      return;
    }
    const registration = await navigator.serviceWorker.register(
      "/message-push-sw.js",
    );
    await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const raw = atob(data.webPublicKey.replace(/-/g, "+").replace(/_/g, "/"));
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: Uint8Array.from(raw, (c) => c.charCodeAt(0)),
      });
    }
    if (getSession()?.id !== user.id) return;
    await api.put(CHAT_URL + "/push/devices/" + installation(), {
      userId: user.id,
      kind: "web",
      subscription: subscription.toJSON(),
    });
    if (getSession()?.id !== user.id) return;
    registration.active?.postMessage({
      type: "MESSAGE_PUSH_ACCOUNT",
      userId: user.id,
    });
    setEnabled(true);
  }
  useEffect(() => {
    register().catch(() => {});
    return () => {
      if ("serviceWorker" in navigator)
        navigator.serviceWorker
          .getRegistration("/message-push-sw.js")
          .then((reg) => {
            reg?.active?.postMessage({
              type: "MESSAGE_PUSH_ACCOUNT",
              userId: null,
              previousUserId: user.id,
            });
          })
          .catch(() => {});
    };
  }, [user.id]);
  return (
    <>
      <Tooltip
        title={
          enabled
            ? "Notificações de mensagens ativadas"
            : "Ativar notificações de mensagens"
        }
      >
        <IconButton
          aria-label={
            enabled
              ? "Notificações de mensagens ativadas"
              : "Ativar notificações de mensagens"
          }
          disabled={busy || enabled}
          onClick={async () => {
            setBusy(true);
            try {
              await register(true);
            } catch (cause) {
              setError(cause.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {enabled ? (
            <NotificationsActiveOutlined />
          ) : (
            <NotificationsNoneOutlined />
          )}
        </IconButton>
      </Tooltip>
      <Snackbar
        open={!!error}
        autoHideDuration={7000}
        onClose={() => setError("")}
      >
        <Alert severity="info" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
