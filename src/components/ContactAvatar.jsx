import { useEffect, useState } from "react";
import { Avatar } from "@mui/material";
import { api } from "../services/api";
import { CHAT_URL } from "../tools/config";

export default function ContactAvatar({ photoUrl, children, ...props }) {
  const [photo, setPhoto] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    let url;
    if (photoUrl) {
      api.get(CHAT_URL + photoUrl, { responseType: "blob", signal: controller.signal })
        .then(({ data }) => {
          if (controller.signal.aborted) return;
          url = URL.createObjectURL(data);
          setPhoto({ path: photoUrl, url });
        })
        .catch(() => {});
    }
    return () => {
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [photoUrl]);
  return <Avatar {...props} src={photo && photo.path === photoUrl ? photo.url : undefined}>{children}</Avatar>;
}
