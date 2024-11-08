from flask import Blueprint, request, jsonify
import subprocess

evaluation_blueprint = Blueprint('evaluation', __name__)

@evaluation_blueprint.route("/", methods=["POST"])
def evaluate_task():
    data = request.json
    instance_id = data.get('instance_id')
    
    try:
        # Run the evaluation script with the instance ID as an argument
        result = subprocess.run(
            ["python3", "evaluation_scripts/eval_script.py", instance_id],
            capture_output=True, text=True
        )
        
        # Return the output of the evaluation script
        return jsonify({"success": True, "output": result.stdout})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
