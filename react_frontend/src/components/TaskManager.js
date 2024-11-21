import React, { useState, useEffect } from 'react';
import { fetchTasks } from '../api/api';
import TaskDetail from './TaskDetail';
import './TaskManager.css';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [activePanel, setActivePanel] = useState('new');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskName, setTaskName] = useState('');
  const [taskDomain, setTaskDomain] = useState('');
  const [taskInstruction, setTaskInstruction] = useState('');
  const [goldProgram, setGoldProgram] = useState('');
  const [userCreatedTasks, setUserCreatedTasks] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetchTasks()
      .then((response) => {
        if (response && response.data) {
          setTasks(response.data.map(task => ({ ...task, isEditable: false })));
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
        setError(error);
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTask = {
      id: Date.now().toString(),
      instance_id: Date.now().toString(),
      task_name: taskName,
      domain: taskDomain,
      task_inst: taskInstruction,
      gold_program: goldProgram,
      isEditable: true,
      timestamp: new Date().toISOString()
    };

    setUserCreatedTasks(prev => [...prev, newTask]);
    setTasks(prev => [...prev, newTask]);
    setActivePanel(newTask.instance_id);
    resetForm();
  };

  const resetForm = () => {
    setTaskName('');
    setTaskDomain('');
    setTaskInstruction('');
    setGoldProgram('');
  };

  const renderPanel = () => {
    if (activePanel === 'new') {
      return (
        <div className="panel-content">
          <h2>Create New Task</h2>
          <div className="task-layout">
            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-group">
                <label htmlFor="task-name">Task Name</label>
                <input
                  type="text"
                  id="task-name"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="task-domain">Domain</label>
                <input
                  type="text"
                  id="task-domain"
                  value={taskDomain}
                  onChange={(e) => setTaskDomain(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="task-instruction">Task Instruction</label>
                <textarea
                  id="task-instruction"
                  value={taskInstruction}
                  onChange={(e) => setTaskInstruction(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="gold-program">Gold Program</label>
                <textarea
                  id="gold-program"
                  value={goldProgram}
                  onChange={(e) => setGoldProgram(e.target.value)}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Create Task
                </button>
              </div>
            </form>

            <div className="preview-panel">
              <div className="preview-header">
                <h3>Preview</h3>
              </div>
              <div className="preview-content">
                {taskName || taskDomain || taskInstruction || goldProgram ? (
                  <div className="task-preview">
                    {taskName && <h4>{taskName}</h4>}
                    {taskDomain && (
                      <div className="task-domain" data-domain={taskDomain}>
                        {taskDomain}
                      </div>
                    )}
                    {taskInstruction && (
                      <div className="preview-section">
                        <h5>Instruction</h5>
                        <p>{taskInstruction}</p>
                      </div>
                    )}
                    {goldProgram && (
                      <div className="preview-section">
                        <h5>Gold Program</h5>
                        <pre><code>{goldProgram}</code></pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-preview">
                    Start filling out the form to see a preview
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    const task = tasks.find(t => t.instance_id === activePanel);
    if (!task) return null;

    return (
      <div className="panel-content">
        <h2>{task.isEditable ? 'Edit Task' : 'View Task'}</h2>
        <TaskDetail task={task} onUpdate={task.isEditable ? handleUpdateTask : null} />
      </div>
    );
  };

  return (
    <div className="task-manager-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>Tasks</h3>
        </div>
        <div className="sidebar-items">
          <button
            className="sidebar-item new-task-button"
            onClick={() => setActivePanel('new')}
          >
            + New Task
          </button>
          {loading ? (
            <div className="loading-message">Loading tasks...</div>
          ) : error ? (
            <div className="error-message">Error loading tasks</div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.instance_id}
                className={`sidebar-card ${activePanel === task.instance_id ? 'active' : ''} ${task.isEditable ? 'editable' : ''}`}
                onClick={() => setActivePanel(task.instance_id)}
              >
                <div className="task-domain" data-domain={task.domain}>
                  {task.domain}
                </div>
                <p className="task-description">{task.task_name || task.task_inst.split('. ')[0]}</p>
              </div>
            ))
          )}
        </div>
      </aside>
      <main className="main-content">
        {loading ? (
          <div className="loading-container">Loading...</div>
        ) : error ? (
          <div className="error-container">
            <h3>Error loading tasks</h3>
            <p>{error.message}</p>
          </div>
        ) : (
          renderPanel()
        )}
      </main>
    </div>
  );
};

export default TaskManager;