const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Synonym",
    tableName: "synonyms",
    columns: {
        id: { primary: true, type: "int", generated: true },
        keyword: { type: "varchar", unique: true },
        synonyms: { type: "simple-array", nullable: true }, // Stores as comma-separated string
        isNew: { type: "boolean", default: false } // Flag to identify words learnt from user prompts
    },
});