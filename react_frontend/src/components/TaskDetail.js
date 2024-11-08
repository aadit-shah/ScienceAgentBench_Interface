import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTask, evaluateTask } from '../api/api'; // Import the new API function
import "./TaskDetail.css";

const TaskDetail = () => {
  const { instanceId } = useParams();
  const [task, setTask] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [showDatasetPreview, setShowDatasetPreview] = useState(false); // State for dataset preview visibility
  const [showRepoInfo, setShowRepoInfo] = useState(false);
  const [showDatasetStructure, setShowDatasetStructure] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [goldProgram, setGoldProgram] = useState(null);
  const [predictedCode, setPredictedCode] = useState(null);
  const [selectedFramework, setSelectedFramework] = useState('');
  const navigate = useNavigate();

  const availableModels = [
    'Llama-3.1-Instruct-70B',
    'Llama-3.1-Instruct-405B',
    'Mistral-Large-2 (2407)',
    'GPT-4o (2024-05-13)',
    'Claude-3.5-Sonnet (2024-06-20)',
    'OpenAI o1'
  ];

  const availableFrameworks = [
    'Self Debug',
    'OpenHands CodeAct',
    'Use Knowledge'
  ];

  useEffect(() => {
    console.log("Fetching task with instanceId:", instanceId);
    fetchTask(instanceId)
      .then((response) => {
        if (response.data.error) {
          setError(new Error(response.data.error));
          setLoading(false);
          return;
        }
        setTask(response.data);
        console.log(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching task:", error);
        setError(error);
        setLoading(false);
      });
  }, [instanceId]);

  useEffect(() => {
    if (task?.gold_program_name) {
      fetch(`/api/gold-program/${task.gold_program_name}`)
        .then(response => response.text())
        .then(code => setGoldProgram(code))
        .catch(error => console.error('Error fetching gold program:', error));
    }
  }, [task]);

  const handleEvaluate = async () => {
    if (!selectedModel) {
      alert('Please select a model first');
      return;
    }
    if (!selectedFramework) {
      alert('Please select a framework first');
      return;
    }

    try {
      setEvaluating(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set placeholder metrics and predicted code
      setEvaluation({
        sr: "15.2",
        cbs: "82.5",
        ver: "36.0",
        cost: "0.017"
      });
      
      // Set placeholder predicted code
      setPredictedCode(`import numpy as np
import matplotlib.pyplot as plt

def analyze_flooding():
    # Placeholder predicted code
    elevation_data = np.random.rand(100, 100)
    flood_risk = elevation_data < 0.5
    
    plt.figure(figsize=(10, 10))
    plt.imshow(flood_risk)
    plt.colorbar(label='Flood Risk')
    plt.title('Predicted Flood Risk Analysis')
    plt.savefig('pred_results/flooding_analysis.png')

if __name__ == "__main__":
    analyze_flooding()`);
      
    } catch (error) {
      console.error("Error during evaluation:", error);
    } finally {
      setEvaluating(false);
    }
  };

 
  if (loading) return <div className="loading-state">Loading task details...</div>;
  if (error) return <div className="error-state">Error loading task details: {error.message}</div>;
  if (!task) return <div className="error-state">Task not found.</div>;

  return (
    <div className="task-detail-container">
      <button 
        onClick={() => navigate(-1)} 
        className="back-button"
      >
        ← Back to Tasks
      </button>

      {/* Header Section */}
      <div className="task-header">
        <div className="header-top">
          <h2 className="task-title">Task</h2>
          <div className="domain-badge" data-domain={task.domain}>
            {task.domain}
          </div>
        </div>
        <div className="task-description">
          {task.task_inst}
        </div>
        <div className="categories-container">
          {task.subtask_categories?.split(',').map((category, index) => (
            <span 
              key={index} 
              className="category-tag"
              data-category={category.trim()}
            >
              {category.trim()}
            </span>
          ))}
        </div>
      </div>

      <div className="content-grid">
        {/* Main Info Section */}
        <div className="main-info">
          {/* Domain Knowledge Section */}
          <section className="section">
            <h3>Domain Knowledge</h3>
            <div className="content-preview">
              <p>{task.domain_knowledge}</p>
            </div>
          </section>

          {/* Repository Information */}
          <section className="section">
            <h3>Repository Information</h3>
            <div className="repo-link">
              <a 
                href={`https://github.com/${task.github_name}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="github-link"
              >
                <span className="github-icon">📂</span>
                View Original Repository
              </a>
            </div>
          </section>
        </div>

        {/* Code and Data Section */}
        <div className="code-data-section">
          {/* Dataset Structure */}
          <section className="section">
            <h3 onClick={() => setShowDatasetStructure(!showDatasetStructure)} style={{ cursor: 'pointer' }}>
              Dataset Structure {showDatasetStructure ? '▼' : '▶'}
            </h3>
            <div className="content-preview">
              <span>View folder structure</span>
              {showDatasetStructure && (
                <div className="file-tree expanded-content">
                  {task.dataset_folder_tree}
                </div>
              )}
            </div>
          </section>

          {/* Dataset Preview Section */}
          <section className="section">
            <h3 onClick={() => setShowDatasetPreview(!showDatasetPreview)} style={{ cursor: 'pointer' }}>
              Dataset Preview {showDatasetPreview ? '▼' : '▶'}
            </h3>
            <div className="content-preview">
              <span>View dataset contents</span>
              {showDatasetPreview && (
                <div className="code-block expanded-content">
                  {task.dataset_preview}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Evaluation section */}
        <section className="section evaluation-section">
          <h3>Evaluation</h3>
          <div className="evaluation-content">
            <div className="model-selection">
              <label htmlFor="model-select">Select Language Model:</label>
              <select
                id="model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="model-dropdown"
              >
                <option value="">Select a model...</option>
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>

              <label htmlFor="framework-select">Select Framework:</label>
              <select
                id="framework-select"
                value={selectedFramework}
                onChange={(e) => setSelectedFramework(e.target.value)}
                className="model-dropdown"
              >
                <option value="">Select a framework...</option>
                {availableFrameworks.map((framework) => (
                  <option key={framework} value={framework}>
                    {framework}
                  </option>
                ))}
              </select>
            </div>
            {/* <div className="info-grid">
              <span className="info-label">Output File:</span>
              <span className="info-value">{task.output_fname}</span>
              <span className="info-label">Evaluation Script:</span>
              <span className="info-value">{task.eval_script_name}</span>
            </div> */}
            <button 
              onClick={handleEvaluate} 
              disabled={evaluating || !selectedModel}
              className="evaluate-button"
            >
              {evaluating ? 'Evaluating...' : 'Run Evaluation'}
            </button>
            {evaluation && (
              <div className="evaluation-results">
                <table className="metrics-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Success Rate (SR)</td>
                      <td>{evaluation.sr}%</td>
                    </tr>
                    <tr>
                      <td>Code Block Success (CBS)</td>
                      <td>{evaluation.cbs}%</td>
                    </tr>
                    <tr>
                      <td>Verification Rate (VER)</td>
                      <td>{evaluation.ver}%</td>
                    </tr>
                    <tr>
                      <td>Cost</td>
                      <td>${evaluation.cost}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Code Comparison section */}
        <section className="section code-comparison-section">
          <h3>Code Comparison</h3>
          <div className="code-comparison">
            <div className="code-panel">
              <h4>Gold Program</h4>
              <div className="code-block">
                <pre>
                  <code className="language-python">
                    {goldProgram || 'Loading gold program...'}
                  </code>
                </pre>
              </div>
            </div>
            
            <div className="code-panel">
              <h4>Predicted Program</h4>
              <div className="code-block">
                <pre>
                  <code className="language-python">
                    {predictedCode || 'Run evaluation to generate prediction...'}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TaskDetail;