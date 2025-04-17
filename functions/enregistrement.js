const functions = require("@google-cloud/functions-framework");
const { Storage } = require("@google-cloud/storage");
const mysql = require("promise-mysql");
const sharp = require("sharp");
const storage = new Storage();

// Register a CloudEvent callback with the Functions Framework that will
// be triggered by Cloud Storage.
functions.cloudEvent("helloGCS", async (cloudEvent) => {
  console.log("COUCOU FROM CLOUD TP LOCAL FUNCTION");

  const file = cloudEvent.data;
  const bucketName = file.bucket;
  const objectName = file.name;
  if (!isValidImg(file.contentType)) {
    console.log("Invalid image type");
    throw new Error({
      message: "Invalid image type",
      details: 'Extentions allowed: "image/jpeg", "image/jpg"',
    });
  }

  try {
    const bucket = storage.bucket(bucketName);
    const fileObject = bucket.file(objectName);
    const [buffer] = await fileObject.download();
    const image = await resizeImage(buffer);

    console.log("Resized image: ", image);
    const { imgUrl } = moveImage(image, file.contentType);
    await addImageToDB(imgUrl);
    await deleteImg(file);
  } catch (error) {
    console.error("Error processing file: ", error);
    throw new Error({
      message: "Error processing file",
      details: error,
    });
  }
});

const moveImage = (newResizedImage, contentType) => {
  try {
    const newImgName = formatimageName();
    const bucketName = "imgs-public";
    storage
      .bucket("imgs-public")
      .file(newImgName)
      .save(newResizedImage, {
        metadata: {
          contentType: contentType,
        },
      });
    return {
      imgUrl: `https://storage.googleapis.com/${bucketName}/${newImgName}`,
    };
  } catch (error) {
    console.error("Error copying image: ", error);
    throw new Error({
      message: "Error copying image",
      details: error,
    });
  }
};

const deleteImg = async (file) => {
  try {
    await storage.bucket(file.bucket).file(file.name).delete();
    console.log("Image deleted from private bucket");
  } catch (error) {
    console.error("Error deleting image: ", error);
    throw new Error({
      message: "Error deleting image",
      details: error,
    });
  }
};

const formatimageName = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
};

const isValidImg = (contentType) => {
  const validImageTypes = ["image/jpeg", "image/jpeg"];
  return validImageTypes.includes(contentType);
};

const resizeImage = async (buffer) => {
  try {
    const imageResized = await sharp(buffer).resize(400, 400).toBuffer();
    console.log(
      `Image resized successfully. New size: ${imageResized.length} bytes`,
      imageResized
    );
    return imageResized;
  } catch (error) {
    console.log("Error resizing image: ", error);
    throw new Error({
      message: "Error resizing image",
      details: error,
    });
  }
};

const DBConnection = async () => {
  try {
    return mysql.createConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      socketPath: process.env.DB_SOCKET_PATH,
    });
  } catch (error) {
    console.error("Error connecting to database: ", error);
    throw new Error({
      message: "Error connecting to database",
      details: error,
    });
  }
};

const addImageToDB = async (imagePath) => {
  console.log("Adding image to database", imagePath);
  const connection = await DBConnection();
  const tableName = "photos";

  const sql = `INSERT INTO ${tableName} (url) VALUES (?)`;
  const values = [imagePath];
  try {
    const result = await connection.query(sql, values);
    console.log("Image added to database: ", result);
  } catch (error) {
    console.error("Error adding image to database: ", error);
    throw new Error({
      message: "Error adding image to database",
      details: error,
    });
  } finally {
    connection.end();
  }
};
