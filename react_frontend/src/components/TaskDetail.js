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

const TaskDetail = ({ task: propTask, isEditable, availableModels, availableFrameworks, onUpdate }) => {
  const { instanceId } = useParams();
  const [task, setTask] = useState(propTask || null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(!propTask);
  const [error, setError] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [goldProgram, setGoldProgram] = useState(propTask?.gold_program || null);
  const [predictedCode, setPredictedCode] = useState(null);
  const [selectedFramework, setSelectedFramework] = useState('');
  const [activeProgram, setActiveProgram] = useState('gold');
  const navigate = useNavigate();

  // Add null checks and default values for arrays
  const models = availableModels || [
    'Llama-3.1-Instruct-70B',
    'Llama-3.1-Instruct-405B',
    'Mistral-Large-2 (2407)',
    'GPT-4o (2024-05-13)',
    'Claude-3.5-Sonnet (2024-06-20)',
    'OpenAI o1',
  ];

  const frameworks = availableFrameworks || [
    'Self Debug',
    'OpenHands CodeAct',
    'Use Knowledge'
  ];

  const handleEvaluate = async () => {
    if (!selectedModel || !selectedFramework) {
      alert('Please select both a model and a framework');
      return;
    }

    setEvaluating(true);
    try {
      const evaluationData = {
        task_id: task.instance_id,
        model: selectedModel,
        framework: selectedFramework
      };

      // Replace with your actual API call
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluationData),
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setEvaluation(result);
      setPredictedCode(result.predicted_code);
      setActiveProgram('predicted');
    } catch (error) {
      console.error('Evaluation failed:', error);
      alert('Failed to evaluate: ' + error.message);
    } finally {
      setEvaluating(false);
    }
  };

  useEffect(() => {
    // Update task when propTask changes
    if (propTask) {
      setTask(propTask);
      setGoldProgram(propTask.gold_program);
      setLoading(false);
      return;
    }

    // Only fetch if we have an instanceId and no propTask
    if (instanceId) {
      setLoading(true);
      fetchTask(instanceId)
        .then((response) => {
          if (response.data.error) {
            setError(new Error(response.data.error));
            return;
          }
          setTask(response.data);
          setGoldProgram(response.data.gold_program);
        })
        .catch((error) => {
          setError(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [instanceId, propTask]);

  if (loading) {
    return <div className="loading-container">Loading task details...</div>;
  }

  if (error) {
    return <div className="error-container">Error: {error.message}</div>;
  }

  if (!task) {
    return <div className="error-container">No task found</div>;
  }

  return (
    <div className="task-detail-container">
      <div className="task-header">
        <h2>{task.task_name || task.task_inst.split('. ')[0]}</h2>
        {isEditable && onUpdate && (
          <button className="edit-button" onClick={() => {/* Add edit handler */}}>
            Edit Task
          </button>
        )}
      </div>

      <motion.div 
        className="main-content-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <InfoBox title="Domain Knowledge" content={task.domain_knowledge || 'No domain knowledge provided'} />
        <InfoBox title="Dataset Preview" content={task.dataset_preview || 'No dataset preview available'} isCode />
        {task.repo_data && task.dataset_info && <RepoDatasetInfo task={task} />}
      </motion.div>

      <CodeComparison 
        goldProgram={goldProgram} 
        predictedCode={predictedCode} 
        activeProgram={activeProgram} 
        setActiveProgram={setActiveProgram} 
      />

    </div>
  );
};

// Make sure these components handle null/undefined props gracefully
const InfoBox = ({ title, content, isCode }) => {
  if (!content) return null;
  return (
    <div className="info-box">
      <h3>{title}</h3>
      {isCode ? (
        <pre className="code-block"><code>{content}</code></pre>
      ) : (
        <p>{content}</p>
      )}
    </div>
  );
};

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



export default TaskDetail;