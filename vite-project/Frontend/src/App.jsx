// C:\Users\User\are-f\vite-project\Frontend\src\App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SourcesPage from './pages/SourcesPage';
// Ensure your CSS files are correctly linked here
import './index.css'; 
import './App.css'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sources" element={<SourcesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;