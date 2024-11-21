import React from 'react';
import TaskDetail from './components/TaskDetail';
import { Route, Routes, Link } from 'react-router-dom';
import TaskGallery from './components/TaskGallery';
import Home from './components/Home';
import AddTask from './components/AddTask';
import RunEvaluation from './components/RunEvaluation';
import TaskManager from './components/TaskManager';

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
            <Link to="/gallery" className="nav-link">Gallery</Link>
            <Link to="/add-task" className="nav-link">Add Task</Link>
            <Link to="/run-evaluation" className="nav-link">Run Evaluation</Link>
            <Link to="/task-manager" className="nav-link">Task Manager</Link>
            {/* Add more navigation links as needed */}
          </div>
        </div>
      </nav>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<TaskGallery />} />
          <Route path="/tasks/:instanceId" element={<TaskDetail />} />
          <Route path="/add-task" element={<AddTask />} />
          <Route path="/run-evaluation" element={<RunEvaluation />} />
          <Route path="/task-manager" element={<TaskManager />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;