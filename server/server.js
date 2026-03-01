require("dotenv").config();
const express = require("express");
const cors = require("cors");
const AppDataSource = require("./datasource");
const videoRoutes = require("./routes/videoRoutes");
const errorHandler = require("./middleware/errorHandler");
const { initCron } = require("./services/cronService");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/videos", videoRoutes);

app.use(errorHandler);

AppDataSource.initialize()
    .then(() => {
        console.log("Database connected");
        initCron();
        app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
    })
    .catch((err) => console.error("Error during Data Source initialization", err));
