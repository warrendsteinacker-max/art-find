// C:\Users\User\are-f\vite-project\Frontend\src\pages\HomePage.jsx

import React, { useState, useRef } from 'react'; 
import { useNavigate } from 'react-router-dom';
import AssignmentForm from '../components/AssignmentForm';

const HomePage = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null); 
  
  const [formData, setFormData] = useState({
    assignmentTopic: '',
    rubric: '',
    format: 'APA 7th Edition',
    userNotes: '',
    aiApiKey: '', 
    articleApiKey: '',
    fileContent: '', 
  });
  const [loading, setLoading] = useState(false);
  const [keyLoading, setKeyLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    fileRef.current = file;
    // File reading logic should be implemented here for real file parsing
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleKeySubmit = async () => {
    if (!formData.aiApiKey && !formData.articleApiKey) {
        alert("Please enter at least one key to submit.");
        return;
    }

    setKeyLoading(true);
    
    try {
        const response = await fetch('http://localhost:3000/api/configure-keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                aiApiKeyString: formData.aiApiKey, 
                articleApiKeyString: formData.articleApiKey
            }),
        });

        if (!response.ok) {
            throw new Error('Key update failed on the backend.');
        }

        const result = await response.json();
        alert(`Keys submitted successfully. Status: ${result.message}`);
        
    } catch (error) {
        alert(`Error submitting keys: ${error.message}.`);
    } finally {
        setKeyLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3000/api/search-and-process`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            assignmentTopic: formData.assignmentTopic,
            fileContent: formData.fileContent 
        }), 
      });

      if (!response.ok) {
        throw new Error('Network error or server failed to process search.');
      }

      const { sources, processedFileContent } = await response.json();
      
      setLoading(false);

      // Navigate to /sources with required data
      navigate('/sources', {
        state: { 
          recommendedSources: sources,
          assignmentDetails: { 
             ...formData,
             fileContent: processedFileContent 
          }
        }
      });

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{padding: '20px'}}>
      <h1>✍️ AI Assignment Preparation Tool</h1>
      
      <AssignmentForm 
        formData={formData} 
        handleChange={handleChange} 
        handleSubmit={handleSubmit} 
        loading={loading}
        error={error}
        handleFileChange={handleFileChange} 
        handleKeySubmit={handleKeySubmit}
        keyLoading={keyLoading}
      />
    </div>
  );
};

export default HomePage;