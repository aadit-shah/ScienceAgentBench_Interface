import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTask, evaluateTask } from '../api/api';
import Prism from 'prismjs';
import { motion } from 'framer-motion';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-javascript';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import './TaskDetail.css';

const TaskDetail = () => {
  const { instanceId } = useParams();
  const [task, setTask] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [goldProgram, setGoldProgram] = useState(null);
  const [predictedCode, setPredictedCode] = useState(null);
  const [selectedFramework, setSelectedFramework] = useState('');
  const [activeProgram, setActiveProgram] = useState('gold');
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
    fetchTask(instanceId)
      .then((response) => {
        if (response.data.error) {
          setError(new Error(response.data.error));
          setLoading(false);
          return;
        }
        setTask(response.data);
        setLoading(false);
      })
      .catch((error) => {
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
    if (!selectedModel || !selectedFramework) {
      alert('Please select a model and framework first');
      return;
    }

    try {
      setEvaluating(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEvaluation({
        sr: "15.2",
        cbs: "82.5",
        ver: "36.0",
        cost: "0.017"
      });
      setPredictedCode(`import numpy as np
import matplotlib.pyplot as plt

def analyze_flooding():
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

  useEffect(() => {
    if (goldProgram || predictedCode) {
      Prism.highlightAll();
    }
  }, [goldProgram, predictedCode, activeProgram]);

  if (loading) return <div className="loading-state">Loading task details...</div>;
  if (error) return <div className="error-state">Error loading task details: {error.message}</div>;
  if (!task) return <div className="error-state">Task not found.</div>;

  return (
    <div className="task-detail-container">
      <div className="content-wrapper">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back to Tasks
        </button>

        <motion.div 
          className="task-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-content">
            <h2 className="task-title">Task</h2>
            <div className="task-description">{task.task_inst}</div>
            <div className="metadata">
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
          </div>
          <div className="domain-badge" data-domain={task.domain}>
            {task.domain}
          </div>
        </motion.div>

        <motion.div 
          className="main-content-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <InfoBox title="Domain Knowledge" content={task.domain_knowledge} />
          <InfoBox title="Dataset Preview" content={task.dataset_preview} isCode />
          <RepoDatasetInfo task={task} />
        </motion.div>

        <CodeComparison 
          goldProgram={goldProgram} 
          predictedCode={predictedCode} 
          activeProgram={activeProgram} 
          setActiveProgram={setActiveProgram} 
        />

        <EvaluationSection 
          availableModels={availableModels} 
          availableFrameworks={availableFrameworks} 
          selectedModel={selectedModel} 
          setSelectedModel={setSelectedModel} 
          selectedFramework={selectedFramework} 
          setSelectedFramework={setSelectedFramework} 
          handleEvaluate={handleEvaluate} 
          evaluating={evaluating} 
          evaluation={evaluation} 
        />
      </div>
    </div>
  );
};

const InfoBox = ({ title, content, isCode }) => (
  <section className="info-box">
    <h3>{title}</h3>
    <div className={`content ${isCode ? 'code-block' : ''}`}>
      {isCode ? <pre><code>{content}</code></pre> : <p>{content}</p>}
    </div>
  </section>
);

const RepoDatasetInfo = ({ task }) => (
  <section className="info-box repo-dataset">
    <div className="repo-section">
      <h3>Repository Information</h3>
      <a href={`https://github.com/${task.github_name}`} 
         target="_blank" 
         rel="noopener noreferrer"
         className="github-link">
        <span className="github-icon">📂</span>
        View Original Repository
      </a>
    </div>
    <div className="structure-section">
      <h3>Dataset Structure</h3>
      <div className="file-tree">
        {task.dataset_folder_tree}
      </div>
    </div>
  </section>
);

const CodeComparison = ({ goldProgram, predictedCode, activeProgram, setActiveProgram }) => (
  <section className="code-comparison-section">
    <div className="code-comparison-header">
      <h3>Code Comparison</h3>
      <div className="program-toggle">
        <button 
          className={`toggle-btn ${activeProgram === 'gold' ? 'active' : ''}`}
          onClick={() => setActiveProgram('gold')}
        >
          Gold Program
        </button>
        <button 
          className={`toggle-btn ${activeProgram === 'predicted' ? 'active' : ''}`}
          onClick={() => setActiveProgram('predicted')}
        >
          Predicted Program
        </button>
      </div>
    </div>
    
    <div className="code-panel">
      <div className="code-block">
        <pre className="line-numbers">
          <code className="language-python">
            {activeProgram === 'gold' 
              ? (goldProgram || 'Loading gold program...') 
              : (predictedCode || 'Run evaluation to generate prediction...')}
          </code>
        </pre>
      </div>
    </div>
  </section>
);

const EvaluationSection = ({
  availableModels, availableFrameworks, selectedModel, setSelectedModel,
  selectedFramework, setSelectedFramework, handleEvaluate, evaluating, evaluation
}) => (
  <section className="evaluation-section">
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
);

export default TaskDetail;