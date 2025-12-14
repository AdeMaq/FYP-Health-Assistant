const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "StopWord",
    tableName: "stop_words",
    columns: {
        id: { primary: true, type: "int", generated: true },
        word: { type: "varchar", unique: true },
    },
});