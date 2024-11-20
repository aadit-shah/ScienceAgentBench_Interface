from flask import Flask
from flask_cors import CORS
from routes.tasks import tasks_blueprint
from routes.evaluation import evaluation_blueprint

app = Flask(__name__)

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": False,
        "max_age": 3600
    }
})

app.register_blueprint(tasks_blueprint, url_prefix='/api/tasks')
app.register_blueprint(evaluation_blueprint, url_prefix='/api/evaluate')

if __name__ == "__main__":
    app.run(debug=True)
