const socket = new WebSocket("ws://localhost:8080");

const userAgent = navigator.userAgent;

function getBrowserName() {
  if (
    userAgent.includes("Chrome") &&
    !userAgent.includes("Edge") &&
    !userAgent.includes("Brave")
  ) {
    return "Google Chrome";
  } else if (userAgent.includes("Firefox")) {
    return "Firefox";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    return "Safari";
  } else if (userAgent.includes("Edge")) {
    return "Microsoft Edge";
    // } else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) {
    //   return "Internet Explorer";
  } else {
    return "Unknown Browser";
  }
}

function sendEvent(socket, action, channel, requestId, payload) {
  socket.send(
    JSON.stringify({
      action,
      channel,
      requestId,
      payload: JSON.stringify(payload),
    }),
  );
}

function getMessage(event) {
  try {
    const message = JSON.parse(event.data);
    return {
      action: message.action,
      channel: message.channel,
      requestId: message.requestId,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

function getCurrentUrl() {
  return window.location.href;
}
function getCurrentTab() {
  return document.title;
}

function isGetCurrentUrlEvent(action, channel) {
  return action === "request" && channel === `${browserName}.GET_CURRENT_URL`;
}
function isGetCurrentTabEvent(action, channel) {
  return action === "request" && channel === `${browserName}.GET_CURRENT_TAB`;
}

const browserName = getBrowserName();
socket.addEventListener("open", () => {
  console.log("Connected to WebSocket server");
  sendEvent(socket, "subscribe", `${browserName}.GET_CURRENT_TAB`, null);
  sendEvent(socket, "subscribe", `${browserName}.GET_CURRENT_URL`, null);
  socket.addEventListener("message", (event) => {
    try {
      const message = getMessage(event);
      if (!message) {
        // to support non json messages from the server
        return;
      }
      if (message)
        if (isGetCurrentUrlEvent(message.action, message.channel)) {
          sendEvent(
            socket,
            "response",
            message.channel,
            message.requestId,
            getCurrentUrl(),
          );
        }
      if (isGetCurrentTabEvent(message.action, message.channel)) {
        sendEvent(
          socket,
          "response",
          message.channel,
          message.requestId,
          getCurrentTab(),
        );
      }
    } catch (error) {
      console.log(error, event.data);
    }
  });
});
