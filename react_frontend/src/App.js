import React from 'react';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import { Route, Routes, Link } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <nav className="app-navbar">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            ScienceAgentBench
          </Link>
          <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            {/* Add more navigation links as needed */}
          </div>
        </div>
      </nav>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<TaskList />} />
          <Route path="/tasks/:instanceId" element={<TaskDetail />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>© 2024 ScienceAgentBench</p>
      </footer>
    </div>
  );
}

export default App;