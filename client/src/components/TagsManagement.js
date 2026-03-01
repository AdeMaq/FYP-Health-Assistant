import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function TagsManagement() {
  const [synonyms, setSynonyms] = useState([]);
  const [stopwords, setStopwords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [newStopword, setNewStopword] = useState("");
  const [editSynonym, setEditSynonym] = useState(null); 
  const [synInput, setSynInput] = useState({ keyword: "", synonyms: "" });

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // Adjust URL based on your actual backend port/route
      const res = await axios.get("http://localhost:5000/api/videos/tags");
      setSynonyms(res.data.synonyms);
      setStopwords(res.data.stopwords);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeed = async () => {
      if(window.confirm("Load defaults from JSON?")) {
          await axios.post("http://localhost:5000/api/videos/tags/seed");
          fetchData();
      }
  };

  // --- STOP WORDS ---
  const addStopword = async (e) => {
    e.preventDefault();
    if (!newStopword) return;
    await axios.post("http://localhost:5000/api/videos/tags/stopword", { word: newStopword });
    setNewStopword("");
    fetchData();
  };

  const deleteStopword = async (id) => {
    await axios.delete(`http://localhost:5000/api/videos/tags/stopword/${id}`);
    fetchData();
  };

  // --- SYNONYMS ---
  const saveSynonym = async (e) => {
    e.preventDefault();
    const payload = {
        id: editSynonym ? editSynonym.id : null,
        keyword: synInput.keyword,
        synonyms: synInput.synonyms
    };
    await axios.post("http://localhost:5000/api/videos/tags/synonym", payload);
    setEditSynonym(null);
    setSynInput({ keyword: "", synonyms: "" });
    fetchData();
  };

  const startEdit = (item) => {
    setEditSynonym(item);
    setSynInput({ 
        keyword: item.keyword, 
        synonyms: item.synonyms ? item.synonyms.join(", ") : "" 
    });
  };

  const deleteSynonym = async (id) => {
    if(window.confirm("Delete this keyword?")) {
        await axios.delete(`http://localhost:5000/api/videos/tags/synonym/${id}`);
        fetchData();
    }
  };

  // Inline styles for tables
  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px"
  };
  
  const thStyle = {
    borderBottom: "2px solid #ddd",
    padding: "10px",
    textAlign: "left",
    backgroundColor: "#f8f9fa",
    position: "sticky",
    top: 0
  };

  const tdStyle = {
    borderBottom: "1px solid #ddd",
    padding: "8px",
    verticalAlign: "top"
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto", fontFamily: "Arial" }}>
      <button onClick={() => navigate("/")} style={{marginBottom:"20px", padding: "5px 10px", cursor: "pointer"}}>← Back to Chat</button>
      
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: "20px"}}>
        <h1>Tags & Logic Management</h1>
        <button onClick={handleSeed} style={{backgroundColor:"#28a745", color:"white", border:"none", padding:"10px", borderRadius: "5px", cursor: "pointer"}}>
            Load Defaults (JSON)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px" }}>
        
        {/* LEFT COLUMN: SYNONYM TABLE */}
        <div>
          <h2>Synonym Map</h2>
          <p style={{fontSize:"13px", color:"#666"}}>
              Map keywords to their synonyms. 
              <br/><strong>Red rows</strong> indicate new words learned from chat that need setup.
          </p>

          {/* INPUT FORM */}
          <form onSubmit={saveSynonym} style={{ background: "#f0f0f0", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
            <div style={{display: "flex", gap: "10px"}}>
                <input 
                    placeholder="Keyword (e.g. skinny)" 
                    value={synInput.keyword} 
                    onChange={e => setSynInput({...synInput, keyword: e.target.value})}
                    style={{flex: 1, padding:"8px"}}
                />
                <input 
                    placeholder="Synonyms (comma separated)" 
                    value={synInput.synonyms} 
                    onChange={e => setSynInput({...synInput, synonyms: e.target.value})}
                    style={{flex: 2, padding:"8px"}}
                />
            </div>
            <div style={{marginTop: "10px", display: "flex", gap: "10px"}}>
                <button type="submit" style={{padding:"8px 20px", backgroundColor:"#007bff", color:"white", border:"none", borderRadius: "4px", cursor: "pointer"}}>
                    {editSynonym ? "Update Logic" : "Add Logic"}
                </button>
                {editSynonym && (
                    <button type="button" onClick={()=>{setEditSynonym(null); setSynInput({keyword:"", synonyms:""})}} style={{padding:"8px 10px", cursor: "pointer"}}>
                        Cancel Edit
                    </button>
                )}
            </div>
          </form>

          {/* TABLE CONTAINER */}
          <div style={{ maxHeight: "500px", overflowY: "auto", border: "1px solid #ddd", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>Keyword</th>
                        <th style={thStyle}>Synonyms</th>
                        <th style={{...thStyle, width: "120px"}}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {synonyms.map(item => (
                        <tr key={item.id} style={{ backgroundColor: item.isNew ? "#fff0f0" : "white" }}>
                            <td style={tdStyle}>
                                <strong>{item.keyword}</strong>
                                {item.isNew && <span style={{color:"red", fontSize:"10px", display:"block"}}> (NEW)</span>}
                            </td>
                            <td style={tdStyle}>
                                {item.synonyms && item.synonyms.length > 0 ? (
                                    item.synonyms.map((s, idx) => (
                                        <span key={idx} style={{background:"#e9ecef", padding:"2px 6px", margin:"2px", borderRadius:"4px", fontSize:"12px", display: "inline-block"}}>
                                            {s}
                                        </span>
                                    ))
                                ) : (
                                    <span style={{color:"red", fontSize:"12px"}}>No synonyms defined</span>
                                )}
                            </td>
                            <td style={tdStyle}>
                                <button onClick={() => startEdit(item)} style={{marginRight:"5px", cursor: "pointer"}}>Edit</button>
                                <button onClick={() => deleteSynonym(item.id)} style={{color:"red", cursor: "pointer"}}>Del</button>
                            </td>
                        </tr>
                    ))}
                    {synonyms.length === 0 && (
                        <tr><td colSpan="3" style={{textAlign:"center", padding:"20px"}}>No synonyms found.</td></tr>
                    )}
                </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: STOP WORDS TABLE */}
        <div>
          <h2>Stop Words</h2>
          <p style={{fontSize:"13px", color:"#666"}}>Words removed from user prompts.</p>
          
          <form onSubmit={addStopword} style={{ marginBottom: "20px", display:"flex", gap: "5px" }}>
            <input 
                value={newStopword} 
                onChange={e => setNewStopword(e.target.value)} 
                placeholder="New stop word..."
                style={{flex:1, padding:"8px"}}
            />
            <button type="submit" style={{padding:"8px 15px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer"}}>Add</button>
          </form>

          <div style={{ maxHeight: "500px", overflowY: "auto", border: "1px solid #ddd", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>Word</th>
                        <th style={{...thStyle, width: "60px"}}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {stopwords.map(sw => (
                        <tr key={sw.id} style={{backgroundColor: "white"}}>
                            <td style={tdStyle}>{sw.word}</td>
                            <td style={tdStyle}>
                                <button 
                                    onClick={() => deleteStopword(sw.id)}
                                    style={{color:"red", border: "none", background: "none", cursor: "pointer", fontWeight: "bold"}}
                                >
                                    ✕
                                </button>
                            </td>
                        </tr>
                    ))}
                     {stopwords.length === 0 && (
                        <tr><td colSpan="2" style={{textAlign:"center", padding:"20px"}}>No stop words found.</td></tr>
                    )}
                </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default TagsManagement;