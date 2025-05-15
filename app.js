const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger/config.json");

const app = express();
const PORT = process.env.PORT || 8800;

app.use(cors());

// Routes
app.use("/api/whole", require("./routes/all"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/ratings", require("./routes/ratings"));
app.use("/api/recent", require("./routes/recent"));

// Swagger Docs
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health
app.get("/health", (_, res) => res.send("OK"));

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
