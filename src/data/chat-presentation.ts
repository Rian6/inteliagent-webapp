export const chatInitials = (name: string) =>
  String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
export const chatDay = (value: string) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? [date.getFullYear(), date.getMonth(), date.getDate()].join("-")
    : "";
};
export const chatTime = (value: string) =>
  new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
export function chatDate(value: string, now = new Date()) {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (chatDay(value) === chatDay(now.toISOString())) return "Hoje";
  if (chatDay(value) === chatDay(yesterday.toISOString())) return "Ontem";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
export const chatPreview = (contact: any) =>
  contact.lastMessage ||
  (contact.lastAttachmentMime?.startsWith("image/")
    ? "Imagem"
    : contact.lastAttachmentMime?.startsWith("audio/")
      ? "Mensagem de voz"
      : "Toque para conversar");
