import { handlerManager } from "../../handler";

handlerManager.addHandler((info) => {
  if (info.input.content_type !== "text") {
    info.next(null);
    return null;
  }
  const out = {
    content_type: "text" as const,
    content: `received: ${info.input.content}`,
  };
  return out;
});
