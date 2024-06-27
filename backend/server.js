const path = require("path");
const express = require("express");
const cors = require("cors"); // Import the cors package

const app = express();

app.use(cors()); // Use the cors middleware

app.get("/plugin/:pluginName/index.ts", (req, res) => {
  const pluginName = req.params.pluginName;
  const filePath = path.join(__dirname, ".", "plugins", pluginName, "index.ts");
  res.sendFile(filePath);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
