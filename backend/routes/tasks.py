from flask import Blueprint, jsonify, request
from datasets import load_dataset
from flask import request
import pandas as pd
import uuid
import os

tasks_blueprint = Blueprint('tasks', __name__)
cached_data = None  


# Load data from Hugging Face
def get_data():
    global cached_data
    if cached_data is not None:
        return cached_data

    try:
        # Load the dataset and convert to a DataFrame
        dataset = load_dataset("osunlp/ScienceAgentBench", split="validation")
        data = pd.DataFrame(dataset)

        # Convert `instance_id` to string for consistency
        data['instance_id'] = data['instance_id'].astype(str)
        
        cached_data = data  # Cache the data
        return cached_data
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return None

@tasks_blueprint.route("/", methods=["GET", "POST", "OPTIONS"])
def tasks():
    if request.method == "OPTIONS":
        return "", 204
        
    if request.method == "POST":
        try:
            data = request.json
            data['instance_id'] = str(uuid.uuid4())
            
            # Add the new task to the dataset
            global cached_data
            cached_data = get_data()
            if cached_data is None:
                return jsonify({"error": "Failed to load dataset"}), 500
                
            cached_data.loc[len(cached_data)] = data
            
            return jsonify({"success": True, "instance_id": data['instance_id']})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    # Handle GET request
    data = get_data()
    if data is None:
        return jsonify({"error": "Failed to load dataset"}), 500
    tasks = data[['instance_id', 'domain', 'task_inst', 'subtask_categories']].to_dict(orient='records')
    return jsonify(tasks)

@tasks_blueprint.route("/<string:instance_id>", methods=["GET"])
def get_task(instance_id):
    data = get_data()
    if data is None:
        return jsonify({"error": "Failed to load dataset"}), 500

    # debug
    # print(f"Searching for instance_id: {instance_id}")
    # print(f"Available instance_ids: {data['instance_id'].unique()}")
    
    # Convert instance_id to string explicitly
    task = data[data['instance_id'].astype(str) == str(instance_id)].to_dict(orient='records')
    
    if not task:
        return jsonify({"error": f"Task not found with id: {instance_id}"}), 404
        
    return jsonify(task[0])

@tasks_blueprint.route("/gold-program/<filename>", methods=["GET"])
def get_gold_program(filename):
    try:
        file_path = os.path.join("benchmark/gold_programs", filename)
        with open(file_path, 'r') as file:
            return file.read()
    except Exception as e:
        return jsonify({"error": f"Failed to load gold program: {str(e)}"}), 500
    