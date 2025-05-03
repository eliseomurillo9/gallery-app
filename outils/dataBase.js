const mysql = require("promise-mysql");
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
const executeQuery = async (query, values = []) => {
  const connection = await DBConnection();

  try {
    const result = await connection.query(query, values);
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

module.exports = { executeQuery };
