const { cloudEvent } = require("@google-cloud/functions-framework");

cloudEvent("consultation", async () => {
  const sql = `SELECT * FROM photos WHERE tags LIKE "%${tags}%"`;
  const values = [];
  const result = await request(sql, values);
  console.log("Result: ", result);
  return result;
});
