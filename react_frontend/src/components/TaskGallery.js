import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchTasks } from '../api/api';
import TaskCard from './TaskCard';
import './TaskGallery.css';
import { Link } from 'react-router-dom';

const TaskGallery = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDomains, setSelectedDomains] = useState(new Set());
  const [availableDomains, setAvailableDomains] = useState([]);
  const [groupByDomain, setGroupByDomain] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTasks()
      .then((response) => {
        setTasks(response.data);
        const domains = [...new Set(response.data.map(task => task.domain))];
        setAvailableDomains(domains);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        setError(error);
        setLoading(false);
      });
  }, []);

  const toggleDomain = (domain) => {
    setSelectedDomains(prev => {
      const newSet = new Set(prev);
      if (newSet.has(domain)) {
        newSet.delete(domain);
      } else {
        newSet.add(domain);
      }
      return newSet;
    });
  };

  const handleGroupByDomain = () => {
    setGroupByDomain(prev => !prev);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesDomain = selectedDomains.size === 0 || selectedDomains.has(task.domain)
    const matchesSearch = (searchQuery === '') || (task.task_inst.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesDomain && matchesSearch
  });

  const sortedTasks = groupByDomain
    ? filteredTasks.sort((a, b) => a.domain.localeCompare(b.domain))
    : filteredTasks;

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading tasks...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <h3>⚠️ Error loading tasks</h3>
      <p>{error.message}</p>
    </div>
  );

  return (
    <div className="task-list-container">
      <div className="fixed-header-section">
        <header className="task-list-header">
          <div className="header-content">
            <h2>Tasks</h2>
            <p className="task-count">
              <span className="count-number">{sortedTasks.length}</span>
              <span className="count-label">Tasks Available</span>
            </p>
            <Link to="/tasks/new" className="add-task-button">
              + Add New Task
            </Link>
          </div>
          <div className="header-divider"></div>
        </header>

        <div className="search-and-filter-container">
          <input
            type="text"
            placeholder="Search tasks"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="main-content-wrapper">
        <div className="scrollable-content">
          <motion.div 
            className="task-grid"
            layout
          >
            <AnimatePresence mode="popLayout">
              {sortedTasks.map((task) => (
                <motion.div
                  key={task.instance_id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 },
                    layout: { duration: 0.3 }
                  }}
                >
                  <TaskCard task={task} onCategoryClick={(category) => console.log('Category clicked:', category)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="legend-container">
          <div className="legend-title">Domains</div>
          {availableDomains.map(domain => (
            <div
              key={domain}
              className={`legend-item ${selectedDomains.has(domain) ? 'active' : ''}`}
              data-domain={domain}
              onClick={() => toggleDomain(domain)}
            >
              {domain}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskGallery;