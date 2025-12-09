// C:\Users\User\are-f\vite-project\Frontend\src\pages\SourcesPage.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PAGE_SIZE = 10; 

const SourcesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { recommendedSources, assignmentDetails } = location.state || {}; 
  
  const [sources, setSources] = useState(recommendedSources || []); 
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pastedSourceText, setPastedSourceText] = useState(''); 
  
  // NEW STATE FOR CHAT REFINEMENT
  const [refinementInput, setRefinementInput] = useState('');
  const [refining, setRefining] = useState(false);

  if (!assignmentDetails) {
     return <div style={{padding: '20px'}}>Error: Missing assignment details. Please start from the home page.</div>;
  }
  
  const handleRefineSearch = () => {
      navigate('/'); 
  };
  
  const handleLoadMore = async () => {
    setLoadingMore(true);
    
    try {
        const topic = encodeURIComponent(assignmentDetails.assignmentTopic);
        const currentCount = sources.length;

        const response = await fetch(`http://localhost:3000/api/load-more?topic=${topic}&currentCount=${currentCount}`);

        if (!response.ok) {
            throw new Error('Failed to load more sources.');
        }

        const newSources = await response.json();
        
        setSources(prevSources => {
            const existingIds = new Set(prevSources.map(s => s.id));
            const uniqueNewSources = newSources.filter(s => s.id && !existingIds.has(s.id));
            return [...prevSources, ...uniqueNewSources];
        });
        
        setLoadingMore(false);
    } catch (err) {
        setError(err.message);
        setLoadingMore(false);
    }
  };

  const handleGenerateAssignment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            assignmentDetails, 
            recommendedSources: sources,
            pastedSourceText 
        }) 
      });

      if (!response.ok) {
        const errorText = await response.json();
        throw new Error(errorText.message || 'AI Generation failed on the server side.');
      }

      const result = await response.json();
      setGeneratedContent(result.generatedContent); 
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // NEW HANDLER FOR CHAT REFINEMENT
  const handleRefinementSubmit = async (e) => {
    e.preventDefault();
    if (!refinementInput.trim() || !generatedContent) return;

    setRefining(true);
    setError(null);

    try {
        const response = await fetch('http://localhost:3000/api/refine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                originalContent: generatedContent,
                refinementRequest: refinementInput,
                assignmentDetails: assignmentDetails,
                recommendedSources: sources
            })
        });

        if (!response.ok) {
            const errorText = await response.json();
            throw new Error(errorText.message || 'AI Refinement failed on the server side.');
        }

        const result = await response.json();
        setGeneratedContent(result.refinedContent); // Update content with refined text
        setRefinementInput(''); // Clear input
        setRefining(false);

    } catch (err) {
        setError(err.message);
        setRefining(false);
    }
  };
  // END NEW HANDLER
  
  const handleDownload = () => {
      if (!generatedContent) return;
      const blob = new Blob([generatedContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Generated_Draft_${assignmentDetails.format}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); 
  };
  
  return (
    <div className="container" style={{maxWidth: '900px', margin: 'auto', padding: '20px'}}>
      <h2>📚 Sources for "{assignmentDetails.assignmentTopic}"</h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <button onClick={handleRefineSearch} style={{padding: '10px 15px'}}>
          ⬅️ Refine Search / Change Details
        </button>
        <p>Total sources loaded: **{sources.length}**</p>
      </div>

      <div className="sources-list" style={{border: '1px solid #ccc', padding: '15px', maxHeight: '300px', overflowY: 'auto', marginBottom: '15px'}}>
        {sources.length === 0 ? (
          <div>
            <p style={{ color: 'red', fontWeight: 'bold' }}>🛑 No sources found. Try refining your topic.</p>
            <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderLeft: '3px solid #007bff' }}>
                <p><strong>Debug Information:</strong></p>
                <ul>
                    <li>**Topic Searched:** <code>{assignmentDetails.assignmentTopic}</code></li>
                    <li>**Search Adapters Used:** Crossref, OpenAlex, PubMed (NCBI)</li>
                    <li>**Possible Issues:** <ul>
                            <li>The topic is too narrow or uses specific jargon.</li>
                            <li>The Backend server cannot connect to the external APIs (check your <code>.env</code> file for valid keys, especially <code>NCBI_API_KEY</code>).</li>
                        </ul>
                    </li>
                </ul>
            </div>
          </div>
        ) : (
          sources.map((source, index) => (
              <div key={source.id || index} className="source-card" style={{borderBottom: '1px dotted #eee', paddingBottom: '10px', marginBottom: '10px'}}>
                <h4>{source.title}</h4>
                <p style={{fontSize: '0.9em'}}><strong>Source:</strong> {source.source} | <strong>Year:</strong> {source.publicationYear} | <strong>Authors:</strong> {Array.isArray(source.authors) ? source.authors.join(', ') : source.authors}</p>
                <a href={source.url} target="_blank" rel="noopener noreferrer">View Source</a>
            </div>
          ))
        )}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button onClick={handleLoadMore} disabled={loadingMore} style={{padding: '10px 30px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px'}}>
          {loadingMore ? 'Loading...' : `Load More Sources (+${PAGE_SIZE})`}
        </button>
      </div>
      
      <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #0056b3', borderRadius: '4px', backgroundColor: '#f0f8ff' }}>
        <h3>📝 Citations Context (Optional)</h3>
        <p style={{ fontSize: '0.9em', color: '#333' }}>
          **Copy and paste key quotes or text snippets from your chosen sources here.** The AI will use this text *specifically* to create accurate **direct quotes** (with "quotation marks") and **paraphrased citations** using APA 7th style, while avoiding your previous formatting concerns.
        </p>
        <textarea
          value={pastedSourceText}
          onChange={(e) => setPastedSourceText(e.target.value)}
          placeholder="Paste key text snippets here (e.g., 'The study found a strong correlation between group cohesion and performance (Smith, 2023, p. 5).')."
          rows={6}
          style={{ width: '100%', resize: 'vertical', padding: '10px', marginTop: '10px' }}
        />
      </div>

      <hr />
      
      <button onClick={handleGenerateAssignment} disabled={loading || generatedContent} style={{padding: '12px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', cursor: 'pointer', display: 'block', width: '100%', marginBottom: '15px', borderRadius: '4px'}}>
        {loading ? 'Generating Draft...' : 'Generate Assignment Draft'}
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {generatedContent && (
        <div className="generated-output" style={{ marginTop: '20px' }}>
          <h3>Generated Assignment Draft</h3>
          
          <button onClick={handleDownload} style={{ marginBottom: '10px', padding: '8px 15px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>
            ⬇️ Download Draft (.txt)
          </button>

          <textarea 
            readOnly 
            value={generatedContent} 
            rows={20} 
            style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace', padding: '10px', border: '1px solid #007bff' }}
          />
        
          {/* NEW REFINEMENT CHAT BOX */}
          <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ff9900', borderRadius: '4px', backgroundColor: '#fff8ee' }}>
            <h4>💬 Refine the Content</h4>
            <p style={{ fontSize: '0.9em', color: '#333' }}>
              Submit requests (e.g., "Remove any remaining asterisks", "Expand the conclusion section", or "Rewrite the introduction to focus more on the adaptive-relational perspective").
            </p>
            <form onSubmit={handleRefinementSubmit}>
                <input
                    type="text"
                    value={refinementInput}
                    onChange={(e) => setRefinementInput(e.target.value)}
                    placeholder="Enter your refinement request here..."
                    disabled={refining}
                    style={{ width: 'calc(100% - 80px)', padding: '10px', border: '1px solid #ccc', borderRadius: '4px 0 0 4px' }}
                />
                <button 
                    type="submit" 
                    disabled={refining}
                    style={{ width: '80px', padding: '10px', backgroundColor: '#ff9900', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '0 4px 4px 0' }}
                >
                    {refining ? '...' : 'Refine'}
                </button>
            </form>
          </div>
          {/* END NEW REFINEMENT CHAT BOX */}
        </div>
      )}
    </div>
  );
};

export default SourcesPage;