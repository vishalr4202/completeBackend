const Firstock = require("./Classes/Firstock");

const firstock = new Firstock();

const userDetails = {
    userId: "",
    password: "",
    TOTP: "",
    vendorCode: "",
    apiKey: "",
};

// firstock.login(
//   {
//     userId: userDetails.userId,
//     password: userDetails.password,
//     TOTP: userDetails.TOTP,
//     vendorCode: userDetails.vendorCode,
//     apiKey: userDetails.apiKey,
//   },
//   (err, result) => {
//     console.log("Error, ", err);
//     console.log("Result: ", result);
//   }
// );

// // //Initializer//
const ws = firstock.initializeWebSocket(1);

ws.on("open", function open() {
  firstock.getWebSocketDetails((err, result) => {
    if (!err) {
      firstock.initialSendWebSocketDetails(ws, result, () => {
        ws.send(firstock.subscribeFeedAcknowledgement("NSE|26000")); //Sending NIFTY 50 Token
        //Subscribe Feed
        // ws.send(firstock.subscribeFeed("NSE|22"))
        // ws.send(firstock.subscribeFeedAcknowledgement("NSE|26000#NSE|26009"))
        // ws.send(firstock.unsubscribeFeed("NSE|26000#NSE|26009#NSE|26017"))

        //Subscribe Depth
        //ws.send(firstock.subscribeDepth("NSE|26000"))
        //ws.send(firstock.subscribeDepthAcknowledgement("NSE|26000"))

        //Subscribe order
        //ws.send(firstock.subscribeOrderUpdate("TV0001"))
        //ws.send(firstock.subscribeOrderAcknowledgement());
      });
    }
  });
});

ws.on("error", function error(error) {
  console.log(`WebSocket error: ${error}`);
});

ws.on("message", function message(data) {
  const result = firstock.receiveWebSocketDetails(data);
  console.log("message: ", result);
  if (result["t"] === "tk" && result["ts"] === "Nifty 50") {
    ws.send(firstock.subscribeFeedAcknowledgement("NSE|26009#NSE|26017")); //Sending BANKNIFTY and INDIAVIX Token
  }
});
