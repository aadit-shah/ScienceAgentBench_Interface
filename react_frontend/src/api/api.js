import axios from 'axios';

const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
});

export const fetchTasks = () => api.get("/tasks");
export const fetchTask = (instanceId) => {
    console.log("Request URL:", `/tasks/${instanceId}`);  // Log the request URL
    return api.get(`/tasks/${instanceId}`);
  };
export const evaluateTask = (data) => api.post("/evaluate", data);
// Function to fetch source file code
export const fetchSourceFile = async (githubName, srcFileOrPath) => {
  const url = `https://raw.githubusercontent.com/${githubName}/master/${srcFileOrPath}`;
  console.log("Fetching source file from URL:", url); // Log the URL for debugging
  const response = await axios.get(url);
  return response.data;
};