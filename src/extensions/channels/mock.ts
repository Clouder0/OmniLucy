// mock channel

import { channelManager } from "../../channel";
import log from "../../utils/log";

const mock_channel = channelManager.addChannel({
  name: "mock",
  capability: {
    input: { text: true },
    output: { text: true, image: true },
  },
});

console.log("test");
log.debug("hey here");
log.debug(mock_channel.handleInput({}, { content_type: "text", content: "hello" }));
