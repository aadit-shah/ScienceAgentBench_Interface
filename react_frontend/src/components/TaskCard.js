import React from 'react';
import { Link } from 'react-router-dom';
import './TaskCard.css';

const TaskCard = ({ task, onCategoryClick }) => {
    // Simple array check - if string, split by comma, otherwise use empty array
    const categories = typeof task.subtask_categories === 'string' 
      ? task.subtask_categories.split(',').map(cat => cat.trim())
      : [];
  
    return (
      <Link to={`/tasks/${task.instance_id}`} className="task-card">
        <div className="domain-badge" data-domain={task.domain}>{task.domain}</div>
        <div className="task-content">
          <p>{task.task_inst}</p>
        </div>
        <div className="tag-container">
          {categories.map((category, index) => (
            <span 
              key={index} 
              className="tag"
              onClick={(e) => {
                e.preventDefault();
                onCategoryClick?.(category);
              }}
            >
              {category}
            </span>
          ))}
        </div>
      </Link>
    );
};

export default TaskCard;