const vision = require("@google-cloud/vision");
const functions = require("@google-cloud/functions-framework");
const { Storage } = require("@google-cloud/storage");
const { executeQuery } = require("../outils/dataBase");

const storage = new Storage();
functions.cloudEvent("analyse", async (cloudEvent) => {
  const file = cloudEvent.data;
  try {
    [buffer] = await storage.bucket(file.bucket).file(file.name).download();
  } catch (error) {
    console.error("Error downloading image: ", error);
    throw new Error({
      message: "Error downloading image",
      details: error,
    });
  }

  const imageTags = await imageAnalyser(buffer);
  const sql = `UPDATE photos SET tags = ? WHERE url = ?`;
  values = [
    imageTags,
    `https://storage.googleapis.com/imgs-public/${file.name}`,
  ];
  await executeQuery(sql, values);
  console.log("Image tags added to database: ");
});

const imageAnalyser = async (buffer) => {
  try {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.labelDetection(buffer);
    return result.labelAnnotations.map((label) => label.description).join(", ");
  } catch (error) {
    console.log("Error analysing image: ", error);
    throw new Error({
      message: "Error analysing image",
      details: error,
    });
  }
};
