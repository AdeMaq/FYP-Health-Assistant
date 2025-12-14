const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Video",
    tableName: "videos",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        title: {
            type: "varchar",
        },
        link: {
            type: "varchar",
        },
        tags: {
            type: "simple-array", 
            nullable: true,
        },
        createdAt: {
            type: "timestamp",
            createDate: true,
        },
        updatedAt: {
            type: "timestamp",
            updateDate: true,
        },
    },
});
