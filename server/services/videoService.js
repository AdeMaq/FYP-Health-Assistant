const AppDataSource = require("../datasource");
const { google } = require("googleapis");
const YouTube = require("youtube-sr").default; // Layer 2 Backup
const axios = require("axios"); // Import Axios for Dictionary API
require("dotenv").config();

// Initialize Google API (Layer 1)
const youtubeAPI = google.youtube({
    version: "v3",
    auth: process.env.GOOGLE_API_KEY,
});

// Repositories
const videoRepo = () => AppDataSource.getRepository("Video");
const synonymRepo = () => AppDataSource.getRepository("Synonym");
const stopWordRepo = () => AppDataSource.getRepository("StopWord");

// --- HELPER FUNCTIONS ---

/**
 * Fetches synonyms from Datamuse API
 * Returns an array of strings (e.g., ["strong", "powerful", "sturdy"])
 */
const fetchOnlineSynonyms = async (word) => {
    try {
        // 'rel_syn' stands for Related Synonyms
        const response = await axios.get(`https://api.datamuse.com/words?rel_syn=${word}`);
        
        // Extract the words from the response object
        const synonyms = response.data.map(item => item.word);

        // Limit to top 5 synonyms to keep DB clean and relevant
        return synonyms.slice(0, 5);
    } catch (error) {
        console.warn(`⚠️ Could not fetch synonyms for "${word}":`, error.message);
        return []; // Return empty array on failure so the app doesn't crash
    }
};

/**
 * Parses the prompt using DB-stored synonyms and stop words.
 * Learns new unknown words by fetching synonyms online and saving to DB.
 */
const extractSearchQuery = async (prompt) => {
    // 1. Fetch Dictionaries from DB
    const stopWordsData = await stopWordRepo().find();
    const synonymData = await synonymRepo().find();

    const stopWordsList = stopWordsData.map(sw => sw.word.toLowerCase());

    // Clean and split prompt
    const cleanPrompt = prompt.toLowerCase().replace(/[^\w\s]/gi, '');
    const words = cleanPrompt.split(/\s+/);

    let coreKeywords = [];
    let expandedTags = [];
    let queryTerms = [];
    let unknownWords = [];

    // 2. Process each word
    for (const w of words) {
        if (w.length < 2) continue; // Skip single letters

        if (stopWordsList.includes(w)) {
            continue; // Skip stop words
        }

        // Check if word exists in our Synonym Map (either as a Key or inside the Synonyms list)
        const mappedEntry = synonymData.find(s => s.keyword === w);

        if (mappedEntry) {
            // It's a known keyword
            coreKeywords.push(w);
            // If synonyms exist, use the first one for the query, otherwise use the word itself
            const primaryTerm = (mappedEntry.synonyms && mappedEntry.synonyms.length > 0)
                ? mappedEntry.synonyms[0]
                : w;

            queryTerms.push(primaryTerm);

            // Add all related terms to tags for scoring
            expandedTags.push(w);
            if (mappedEntry.synonyms) {
                expandedTags.push(...mappedEntry.synonyms);
            }
        } else {
            // It's an UNKNOWN word
            coreKeywords.push(w);
            queryTerms.push(w);
            expandedTags.push(w);
            unknownWords.push(w);
        }
    }

    // 3. LEARNING LOGIC: Save unknown words + Fetch Synonyms
    if (unknownWords.length > 0) {
        for (const word of unknownWords) {
            // Double check it's not already saved
            const exists = await synonymRepo().findOneBy({ keyword: word });
            
            if (!exists) {
                console.log(`🤔 Encountered new word: "${word}". Fetching synonyms...`);
                
                // Fetch synonyms from external API
                const onlineSynonyms = await fetchOnlineSynonyms(word);
                
                // Save to DB (TypeORM 'simple-array' handles array -> CSV conversion)
                try {
                    await synonymRepo().save({
                        keyword: word,
                        synonyms: onlineSynonyms, 
                        isNew: true 
                    });
                    
                    const logMsg = onlineSynonyms.length > 0 
                        ? `🧠 Learned "${word}" with synonyms: [${onlineSynonyms.join(", ")}]`
                        : `🧠 Learned "${word}" (No online synonyms found)`;
                    
                    console.log(logMsg);
                    
                    // Add the newly found synonyms to the current search tags immediately
                    expandedTags.push(...onlineSynonyms);
                    
                } catch (err) {
                    console.error("Error learning word:", err.message);
                }
            }
        }
    }

    // Ensure we have a valid query, otherwise default
    const finalQuery = queryTerms.length > 0 ? [...new Set(queryTerms)].join(" ") + " workout" : "full body workout";

    return {
        searchQuery: finalQuery,
        tags: [...new Set(expandedTags)]
    };
};

/**
 * STRATEGY 1: GOOGLE API
 */
const fetchViaGoogleAPI = async (query, limit) => {
    try {
        console.log(`📡 [Layer 1] Google API Search: "${query}"`);
        const response = await youtubeAPI.search.list({
            part: "snippet",
            q: query,
            type: "video",
            maxResults: limit,
            relevanceLanguage: "en",
        });
        if (!response.data.items) return null;
        return response.data.items.map(item => ({
            title: item.snippet.title,
            link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            tags: [],
            source: "google_api"
        }));
    } catch (error) {
        console.error(`⚠️ Google API Failed: ${error.message}`);
        return null; // Return null to trigger fallback
    }
};

/**
 * STRATEGY 2: YOUTUBE-SR SCRAPER (Fallback)
 */
const fetchViaScraper = async (query, limit) => {
    try {
        console.log(`🕸️ [Layer 2] Scraper Search: "${query}"`);
        const videos = await YouTube.search(query, { limit: limit });
        return videos.map(v => ({
            title: v.title,
            link: `https://www.youtube.com/watch?v=${v.id}`,
            tags: [],
            source: "scraper"
        }));
    } catch (error) {
        console.error(`⚠️ Scraper Failed: ${error.message}`);
        return null;
    }
};

// --- MAIN EXPORTED FUNCTIONS ---

exports.processChatPrompt = async (prompt) => {
    // AWAIT the extraction because it now hits the database
    const { searchQuery, tags } = await extractSearchQuery(prompt);

    const VIDEO_LIMIT = 4;

    // 1. CHECK DATABASE FIRST
    const allVideos = await videoRepo().find();

    let scoredVideos = allVideos.map(video => {
        let score = 0;
        const titleLower = video.title.toLowerCase();

        // Exact keyword match (first word of query)
        if (titleLower.includes(searchQuery.split(" ")[0])) score += 50;

        // Tag match
        tags.forEach(tag => {
            if (titleLower.includes(tag)) score += 20;
            if (video.tags && video.tags.some(t => t.includes(tag))) score += 15;
        });

        return { ...video, score };
    });

    let recommendedVideos = scoredVideos
        .filter(v => v.score > 15)
        .sort((a, b) => b.score - a.score)
        .slice(0, VIDEO_LIMIT);

    let source = "database";

    // 2. IF DATABASE MISSES, FETCH FROM EXTERNAL
    if (recommendedVideos.length < VIDEO_LIMIT) {
        const missingCount = VIDEO_LIMIT - recommendedVideos.length;
        let externalVideos = null;

        // Try Layer 1 (Google API)
        externalVideos = await fetchViaGoogleAPI(searchQuery, missingCount + 1);

        // Try Layer 2 (Scraper) if Layer 1 failed
        if (!externalVideos || externalVideos.length === 0) {
            externalVideos = await fetchViaScraper(searchQuery, missingCount + 1);
        }

        // Process External Results
        if (externalVideos && externalVideos.length > 0) {
            source = recommendedVideos.length > 0 ? "mixed" : externalVideos[0].source;

            for (const vid of externalVideos) {
                // Prevent Duplicates
                const exists = allVideos.find(v => v.link === vid.link);
                if (!exists) {
                    const newVideo = await videoRepo().save(videoRepo().create({
                        title: vid.title,
                        link: vid.link,
                        tags: tags // Save smart tags
                    }));
                    recommendedVideos.push(newVideo);
                } else {
                    recommendedVideos.push(exists);
                }
            }
        }
    }

    // 3. CLEANUP & RETURN
    // Ensure unique list
    const uniqueList = Array.from(new Set(recommendedVideos.map(v => v.id)))
        .map(id => recommendedVideos.find(v => v.id === id))
        .slice(0, VIDEO_LIMIT);

    if (uniqueList.length === 0) {
        // LAYER 3: LAST RESORT LINK
        const directLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
        return {
            source: "fallback_link",
            videos: [],
            message: `I couldn't load videos directly, but here is a [link to search results for ${searchQuery}](${directLink}).`
        };
    }

    return {
        source: source,
        videos: uniqueList,
        message: `Found these exercises for **${searchQuery.replace(" workout", "")}**:`
    };
};

// --- STANDARD VIDEO MANAGEMENT FUNCTIONS ---

exports.getAllVideos = async () => {
    return await videoRepo().find();
};

exports.getVideoById = async (id) => {
    return await videoRepo().findOneBy({ id: parseInt(id) });
};

exports.createVideo = async (videoData) => {
    const video = videoRepo().create(videoData);
    return await videoRepo().save(video);
};

exports.updateVideo = async (id, videoData) => {
    await videoRepo().update(id, videoData);
    return await videoRepo().findOneBy({ id: parseInt(id) });
};

exports.deleteVideo = async (id) => {
    return await videoRepo().delete(id);
};