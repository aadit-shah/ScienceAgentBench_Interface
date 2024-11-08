from flask import Flask
from flask_cors import CORS
from routes.tasks import tasks_blueprint
from routes.evaluation import evaluation_blueprint

app = Flask(__name__)

# Configure CORS to allow both localhost and 127.0.0.1 on port 3000
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

# Register Blueprints
app.register_blueprint(tasks_blueprint, url_prefix='/api/tasks')
app.register_blueprint(evaluation_blueprint, url_prefix='/api/evaluate')

if __name__ == "__main__":
    app.run(debug=True)
