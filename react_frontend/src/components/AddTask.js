import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddTask.css';

const AddTask = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    task_inst: '',
    domain: '',
    domain_knowledge: '',
    dataset_preview: '',
    dataset_folder_tree: '',
    github_name: '',
    subtask_categories: '',
    gold_program_name: ''
  });

  const domains = [
    'Computational Chemistry',
    'Bioinformatics',
    'Geographical Information Science',
    'Psychology and Cognitive science'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/tasks', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false
      });
      if (response.data.success) {
        alert('Task created successfully!');
        navigate('/gallery');
      }
    } catch (error) {
      alert('Error creating task: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="add-task-container">
      <div className="add-task-content">
        <h2>Add New Task</h2>
        <form onSubmit={handleSubmit} className="add-task-form">
          <div className="form-group">
            <label htmlFor="task_inst">Task Description</label>
            <textarea
              id="task_inst"
              name="task_inst"
              value={formData.task_inst}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="domain">Domain</label>
            <select
              id="domain"
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              required
            >
              <option value="">Select a domain...</option>
              {domains.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="domain_knowledge">Domain Knowledge</label>
            <textarea
              id="domain_knowledge"
              name="domain_knowledge"
              value={formData.domain_knowledge}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dataset_preview">Dataset Preview</label>
            <textarea
              id="dataset_preview"
              name="dataset_preview"
              value={formData.dataset_preview}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dataset_folder_tree">Dataset Structure</label>
            <textarea
              id="dataset_folder_tree"
              name="dataset_folder_tree"
              value={formData.dataset_folder_tree}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="github_name">GitHub Repository</label>
            <input
              type="text"
              id="github_name"
              name="github_name"
              value={formData.github_name}
              onChange={handleChange}
              placeholder="username/repository"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subtask_categories">Categories (comma-separated)</label>
            <input
              type="text"
              id="subtask_categories"
              name="subtask_categories"
              value={formData.subtask_categories}
              onChange={handleChange}
              placeholder="Data Processing, Visualization, etc."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gold_program_name">Gold Program Filename</label>
            <input
              type="text"
              id="gold_program_name"
              name="gold_program_name"
              value={formData.gold_program_name}
              onChange={handleChange}
              placeholder="solution.py"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTask;
