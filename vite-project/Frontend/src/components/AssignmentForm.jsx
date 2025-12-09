// C:\Users\User\are-f\vite-project\Frontend\src\components\AssignmentForm.jsx

import React from 'react';

const AssignmentForm = ({ formData, handleChange, handleSubmit, loading, error, handleFileChange, handleKeySubmit, keyLoading }) => (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: 'auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '40px' }}>
        
        <h2>1. Assignment Details</h2>

        <label htmlFor="assignmentTopic">Topic / Main Question:</label>
        <textarea id="assignmentTopic" name="assignmentTopic" value={formData.assignmentTopic} onChange={handleChange} required rows="2" placeholder="e.g., The economic impact of the 2008 financial crisis." />
        
        <label htmlFor="rubric">Rubric / Requirements:</label>
        <textarea id="rubric" name="rubric" value={formData.rubric} onChange={handleChange} required rows="4" placeholder="e.g., Must use APA 7th edition, include 5 scholarly sources, discuss global trade." />
        
        <label htmlFor="format">Citation Format:</label>
        <select id="format" name="format" value={formData.format} onChange={handleChange} required>
            <option value="APA 7th Edition">APA 7th Edition</option>
            <option value="MLA 9th Edition">MLA 9th Edition</option>
            <option value="Chicago Manual of Style">Chicago Manual of Style</option>
        </select>

        <label htmlFor="userNotes">Specific Terminology / User Notes (Optional):</label>
        <textarea id="userNotes" name="userNotes" value={formData.userNotes} onChange={handleChange} rows="2" placeholder="e.g., Ensure the term 'systemic risk' is used exactly once." />

        <hr style={{ margin: '20px 0' }} />

        <h2>2. Optional Assignment File</h2>
        <p>Upload a file to include the exact structure or full prompt.</p>
        <input type="file" onChange={handleFileChange} />
        
        <hr style={{ margin: '20px 0' }} />

        <h2>3. ⚙️ Optional API Key Management</h2>
        <p>Paste one API key per line. These keys will be prioritized over the default keys.</p>

        <label htmlFor="aiApiKey">Generative AI Keys (e.g., Gemini/OpenAI):</label>
        <textarea id="aiApiKey" name="aiApiKey" value={formData.aiApiKey} onChange={handleChange} rows="3" placeholder="Paste custom AI API Keys here (one per line)" />

        <label htmlFor="articleApiKey">Additional Article API Keys (e.g., Scopus, specialized sources):</label>
        <textarea id="articleApiKey" name="articleApiKey" value={formData.articleApiKey} onChange={handleChange} rows="3" placeholder="Paste new scholarly Article API Keys here (one per line)" />

        <button type="button" onClick={handleKeySubmit} disabled={keyLoading} style={{ marginTop: '10px', backgroundColor: '#5cb85c', color: 'white', padding: '10px', border: 'none', borderRadius: '4px' }}>
            {keyLoading ? 'Updating Keys...' : 'Submit Custom Keys'}
        </button>
        
        {error && <p style={{ color: 'red', marginTop: '15px' }}>Error: {error}</p>}
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', marginTop: '20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Searching & Processing...' : 'Submit & Find Sources'}
        </button>
    </form>
);

export default AssignmentForm;