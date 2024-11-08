import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchTasks } from '../api/api';
import TaskCard from './TaskCard';
import './TaskList.css';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDomains, setSelectedDomains] = useState(new Set());
  const [availableDomains, setAvailableDomains] = useState([]);
  const [groupByDomain, setGroupByDomain] = useState(false); // New state for grouping
  

  useEffect(() => {
    fetchTasks()
      .then((response) => {
        setTasks(response.data);
        // Extract unique domains from tasks
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
    setGroupByDomain(prev => !prev); // Toggle grouping
  };

  const filteredTasks = tasks.filter(task => 
    selectedDomains.size === 0 || selectedDomains.has(task.domain)
  );

  // Sort tasks by domain if grouping is enabled
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
      <header className="task-list-header">
        <div className="header-content">
          <h2>Tasks</h2>
          <p className="task-count">
            <span className="count-number">{sortedTasks.length}</span>
            <span className="count-label">Tasks Available</span>
          </p>
        </div>
        <div className="header-divider"></div>
      </header>
      
      <div className="filter-container">
        {availableDomains.map(domain => (
          <motion.button
            key={domain}
            className={`filter-button ${selectedDomains.has(domain) ? 'active' : ''}`}
            onClick={() => toggleDomain(domain)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {domain}
          </motion.button>
        ))}
        <motion.button
          className="filter-button"
          onClick={handleGroupByDomain}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {groupByDomain ? 'Ungroup' : 'Group By Domain'}
        </motion.button>
      </div>

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
  );
};

export default TaskList;