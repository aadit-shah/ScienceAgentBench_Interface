import axios from 'axios';

const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

export const fetchTasks = () => api.get("/tasks/");
export const fetchTask = (instanceId) => api.get(`/tasks/${instanceId}`);
export const createTask = (data) => api.post("/tasks/", data);
export const evaluateTask = (data) => api.post("/evaluate", data);
export const fetchGoldProgram = (goldProgramName) => {
  return api.get(`/gold-program/${goldProgramName}`);
};
// Function to fetch source file code
export const fetchSourceFile = async (githubName, srcFileOrPath) => {
  const url = `https://raw.githubusercontent.com/${githubName}/master/${srcFileOrPath}`;
  console.log("Fetching source file from URL:", url); // Log the URL for debugging
  const response = await axios.get(url);
  return response.data;
};