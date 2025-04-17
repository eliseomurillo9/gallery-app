const vision = require("@google-cloud/vision");
const functions = require("@google-cloud/functions-framework");

functions.cloudEvent("analyse", async (cloudEvent) => {
  const file = cloudEvent.data;
  console.log("COUCOU FROM ANALYSE LOCAL FUNCTION");
});
