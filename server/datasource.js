const { DataSource } = require("typeorm");
const Video = require("./entities/Video");
const StopWord = require("./entities/StopWord"); 
const Synonym = require("./entities/Synonym");   

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true, 
    logging: false,
    entities: [Video,StopWord,Synonym],
});

AppDataSource.initialize()
    .then(() => console.log("Database connected"))
    .catch((err) => console.error("Database connection error", err));
    
module.exports = AppDataSource;
