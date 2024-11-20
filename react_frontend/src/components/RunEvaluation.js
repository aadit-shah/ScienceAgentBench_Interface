import React, { useState, useEffect } from 'react';
import { fetchTasks } from '../api/api';
import './RunEvaluation.css';

const RunEvaluation = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [activePanel, setActivePanel] = useState('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [evaluationName, setEvaluationName] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('');

  const availableModels = [
    'Llama-3.1-Instruct-70B',
    'Llama-3.1-Instruct-405B',
    'Mistral-Large-2 (2407)',
    'GPT-4o (2024-05-13)',
    'Claude-3.5-Sonnet (2024-06-20)',
    'OpenAI o1',
  ];

  const availableFrameworks = ['Self Debug', 'OpenHands CodeAct', 'Use Knowledge'];

  useEffect(() => {
    fetchTasks()
      .then((response) => setTasks(response.data))
      .catch((error) => console.error('Error fetching tasks:', error));
  }, []);

  useEffect(() => {
    const evaluation = evaluations.find((e) => e.id === activePanel);
    if (evaluation && activePanel !== 'new') {
      setSelectedTasks(evaluation.tasks);
      setSearchQuery('');
      setSelectedDomain('all');
    }
  }, [activePanel, evaluations]);

  const handleTaskToggle = (taskId) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!evaluationName || selectedTasks.length === 0 || !selectedModel || !selectedFramework) {
      alert('Please fill in all required fields.');
      return;
    }

    const newEvaluation = {
      id: Date.now().toString(),
      name: evaluationName,
      tasks: selectedTasks,
      model: selectedModel,
      framework: selectedFramework,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    setEvaluations((prev) => [...prev, newEvaluation]);
    setEvaluationName('');
    setSelectedTasks([]);
    setSelectedModel('');
    setSelectedFramework('');
    setSearchQuery('');
    setSelectedDomain('all');
    setActivePanel(newEvaluation.id);

    console.log('Evaluation created:', newEvaluation);
  };

  const handleUpdateEvaluation = async (e, evaluation) => {
    e.preventDefault();
    if (!evaluation.name || evaluation.tasks.length === 0 || !evaluation.model || !evaluation.framework) {
      alert('Please fill in all required fields.');
      return;
    }

    setEvaluations((prev) =>
      prev.map((ev) => (ev.id === evaluation.id ? { ...evaluation, timestamp: new Date().toISOString() } : ev))
    );

    console.log('Evaluation updated:', evaluation);
  };

  const renderEvaluationDetails = (evaluation) => (
    <div className="panel-content">
      <h2>Edit Evaluation</h2>
      <div className="evaluation-layout">
        <form onSubmit={handleSubmit} className="evaluation-form">
          <div className="form-group">
            <label htmlFor="evaluation-name">Evaluation Name</label>
            <input
              type="text"
              id="evaluation-name"
              value={evaluation.name}
              onChange={(e) => {
                const updatedEval = { ...evaluation, name: e.target.value };
                setEvaluations(prev => 
                  prev.map(ev => ev.id === evaluation.id ? updatedEval : ev)
                );
              }}
              placeholder="Enter evaluation name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="model-select">Language Model</label>
            <select
              id="model-select"
              value={evaluation.model}
              onChange={(e) => {
                const updatedEval = { ...evaluation, model: e.target.value };
                setEvaluations(prev => 
                  prev.map(ev => ev.id === evaluation.id ? updatedEval : ev)
                );
              }}
              required
            >
              <option value="">Select a model...</option>
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="framework-select">Framework</label>
            <select
              id="framework-select"
              value={evaluation.framework}
              onChange={(e) => {
                const updatedEval = { ...evaluation, framework: e.target.value };
                setEvaluations(prev => 
                  prev.map(ev => ev.id === evaluation.id ? updatedEval : ev)
                );
              }}
              required
            >
              <option value="">Select a framework...</option>
              {availableFrameworks.map((framework) => (
                <option key={framework} value={framework}>
                  {framework}
                </option>
              ))}
            </select>
          </div>
          <div className="tasks-selection">
            <h3>Select Tasks</h3>
            <div className="task-filters">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="domain-select"
              >
                <option value="all">All Domains</option>
                {Array.from(new Set(tasks.map((task) => task.domain))).map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>
            <div className="tasks-grid">
              {tasks
                .filter(
                  (task) =>
                    (selectedDomain === 'all' || task.domain === selectedDomain) &&
                    task.task_inst.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((task) => (
                  <div
                    key={task.instance_id}
                    className={`evaluation-task-card ${selectedTasks.includes(task.instance_id) ? 'selected' : ''}`}
                    onClick={() => handleTaskToggle(task.instance_id)}
                  >
                    <div className="task-domain" data-domain={task.domain}>
                      {task.domain}
                    </div>
                    <p className="task-description">{task.task_inst.split('. ')[0]}</p>
                  </div>
                ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-button">
              Create Evaluation
            </button>
          </div>
        </form>
        
        <div className="selected-tasks-panel">
          <div className="selected-tasks-header">
            <h3>Selected Tasks ({selectedTasks.length})</h3>
          </div>
          <div className="selected-tasks-content">
            {selectedTasks.length === 0 ? (
              <div className="no-tasks-selected">
                No tasks selected
              </div>
            ) : (
              selectedTasks.map((taskId) => {
                const task = tasks.find((t) => t.instance_id === taskId);
                return task && (
                  <div key={taskId} className="selected-task-item">
                    <div className="selected-task-info">
                      <div className="task-domain" data-domain={task.domain}>
                        {task.domain}
                      </div>
                      <div className="task-description">
                        {task.task_inst.split('. ')[0]}
                      </div>
                    </div>
                    <button
                      className="remove-task-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        handleTaskToggle(taskId);
                      }}
                      title="Remove task"
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPanel = () => {
    if (activePanel === 'new') {
      return (
        <div className="panel-content">
          <h2>Create New Evaluation</h2>
          <div className="evaluation-layout">
            <form onSubmit={handleSubmit} className="evaluation-form">
              <div className="form-group">
                <label htmlFor="evaluation-name">Evaluation Name</label>
                <input
                  type="text"
                  id="evaluation-name"
                  value={evaluationName}
                  onChange={(e) => setEvaluationName(e.target.value)}
                  placeholder="Enter evaluation name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="model-select">Language Model</label>
                <select
                  id="model-select"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  required
                >
                  <option value="">Select a model...</option>
                  {availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="framework-select">Framework</label>
                <select
                  id="framework-select"
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  required
                >
                  <option value="">Select a framework...</option>
                  {availableFrameworks.map((framework) => (
                    <option key={framework} value={framework}>
                      {framework}
                    </option>
                  ))}
                </select>
              </div>
              <div className="tasks-selection">
                <h3>Select Tasks</h3>
                <div className="task-filters">
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="domain-select"
                  >
                    <option value="all">All Domains</option>
                    {Array.from(new Set(tasks.map((task) => task.domain))).map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="tasks-grid">
                  {tasks
                    .filter(
                      (task) =>
                        (selectedDomain === 'all' || task.domain === selectedDomain) &&
                        task.task_inst.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((task) => (
                      <div
                        key={task.instance_id}
                        className={`evaluation-task-card ${selectedTasks.includes(task.instance_id) ? 'selected' : ''}`}
                        onClick={() => handleTaskToggle(task.instance_id)}
                      >
                        <div className="task-domain" data-domain={task.domain}>
                          {task.domain}
                        </div>
                        <p className="task-description">{task.task_inst.split('. ')[0]}</p>
                      </div>
                    ))}
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Create Evaluation
                </button>
              </div>
            </form>
            
            <div className="selected-tasks-panel">
              <div className="selected-tasks-header">
                <h3>Selected Tasks ({selectedTasks.length})</h3>
              </div>
              <div className="selected-tasks-content">
                {selectedTasks.length === 0 ? (
                  <div className="no-tasks-selected">
                    No tasks selected
                  </div>
                ) : (
                  selectedTasks.map((taskId) => {
                    const task = tasks.find((t) => t.instance_id === taskId);
                    return task && (
                      <div key={taskId} className="selected-task-item">
                        <div className="selected-task-info">
                          <div className="task-domain" data-domain={task.domain}>
                            {task.domain}
                          </div>
                          <div className="task-description">
                            {task.task_inst.split('. ')[0]}
                          </div>
                        </div>
                        <button
                          className="remove-task-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            handleTaskToggle(taskId);
                          }}
                          title="Remove task"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    const evaluation = evaluations.find((e) => e.id === activePanel);
    if (!evaluation) return null;

    return renderEvaluationDetails(evaluation);
  };

  return (
    <div className="evaluation-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>Evaluations</h3>
        </div>
        <div className="sidebar-items">
          <button
            className={`sidebar-item ${activePanel === 'new' ? 'active' : ''}`}
            onClick={() => setActivePanel('new')}
          >
            + New Evaluation
          </button>
          {evaluations.map((evaluation) => (
            <button
              key={evaluation.id}
              className={`sidebar-item ${activePanel === evaluation.id ? 'active' : ''}`}
              onClick={() => setActivePanel(evaluation.id)}
            >
              {evaluation.name}
            </button>
          ))}
        </div>
      </aside>
      <main className="main-content">{renderPanel()}</main>
    </div>
  );
};

export default RunEvaluation;
