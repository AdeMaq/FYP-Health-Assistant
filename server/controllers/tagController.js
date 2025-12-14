const AppDataSource = require("../datasource");
const synonymData = require("../synonyms.json");
const stopWordData = require("../stopwords.json");

const synonymRepo = AppDataSource.getRepository("Synonym");
const stopWordRepo = AppDataSource.getRepository("StopWord");


exports.getData = async (req, res) => {
    try {
        // Fetch repository inside the request to ensure DB is ready
        const synonymRepo = AppDataSource.getRepository("Synonym");
        const stopWordRepo = AppDataSource.getRepository("StopWord");

        const synonyms = await synonymRepo.find({ order: { isNew: "DESC", keyword: "ASC" } });
        const stopwords = await stopWordRepo.find({ order: { word: "ASC" } });
        res.json({ synonyms, stopwords });
    } catch (err) { 
        console.error("Tags Error:", err); // Log the actual error to console for debugging
        res.status(500).json({ error: err.message }); 
    }
};

// Add/Update Synonym
exports.saveSynonym = async (req, res) => {
    try {
        const { id, keyword, synonyms, isNew } = req.body;
        // Ensure synonyms is an array
        const synArray = Array.isArray(synonyms) ? synonyms : synonyms.split(",").map(s => s.trim());
        
        const data = { keyword, synonyms: synArray, isNew: false }; // Mark as verified on save
        
        let result;
        if (id) {
            await synonymRepo.update(id, data);
            result = await synonymRepo.findOneBy({ id });
        } else {
            result = await synonymRepo.save(data);
        }
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Delete Synonym
exports.deleteSynonym = async (req, res) => {
    try {
        await synonymRepo.delete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Add Stopword
exports.saveStopWord = async (req, res) => {
    try {
        const { word } = req.body;
        const result = await stopWordRepo.save({ word });
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Delete Stopword
exports.deleteStopWord = async (req, res) => {
    try {
        await stopWordRepo.delete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// SEED DATA
exports.seedTags = async (req, res) => {
    try {
        // Clear existing (Optional: remove .clear() if you want to keep data)
        // await synonymRepo.clear(); 
        // await stopWordRepo.clear();

        for (const s of synonymData) {
            const exists = await synonymRepo.findOneBy({ keyword: s.keyword });
            if (!exists) await synonymRepo.save(s);
        }
        
        for (const w of stopWordData) {
             const exists = await stopWordRepo.findOneBy({ word: w.word });
             if (!exists) await stopWordRepo.save(w);
        }

        res.json({ message: "Tags and Stopwords Seeded!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};