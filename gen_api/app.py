"""
Main application module for the Media API service.

This module sets up the Flask application with all necessary blueprints,
configurations, and error handlers.
"""

import os
import logging
from flask import Flask, jsonify
from controllers.media_controller import media_blueprint
import dotenv

# Load environment variables
dotenv.load_dotenv()

def create_app(config=None):
    """
    Application factory function to create and configure the Flask app.
    
    Args:
        config (dict, optional): Configuration dictionary to override defaults.
    
    Returns:
        Flask: Configured Flask application instance
    """
    # Create and configure the app
    app = Flask(__name__)
    
    # Default configuration
    app.config.update({
        'DEBUG': os.environ.get('FLASK_DEBUG', 'False') == 'True',
        'TESTING': os.environ.get('FLASK_TESTING', 'False') == 'True',
        'SECRET_KEY': os.environ.get('SECRET_KEY', 'dev-key-for-development-only'),
        'UPLOAD_FOLDER': os.environ.get('UPLOAD_FOLDER', 'uploads'),
    })
    
    # Override with custom config if provided
    if config:
        app.config.update(config)
    
    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Setup logging
    logging.basicConfig(
        level=logging.DEBUG if app.config['DEBUG'] else logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Register blueprints
    app.register_blueprint(media_blueprint)
    
    # Basic route
    @app.route('/', methods=['GET'])
    def home():
        """Root endpoint to verify the API is running."""
        return "API Media"
    
    # Register error handlers
    register_error_handlers(app)
    
    return app


def register_error_handlers(app):
    """
    Register error handlers for common HTTP errors.
    
    Args:
        app (Flask): Flask application instance
    """
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad request', 'message': str(error)}), 400
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found', 'message': str(error)}), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({'error': 'Method not allowed', 'message': str(error)}), 405
    
    @app.errorhandler(500)
    def server_error(error):
        return jsonify({'error': 'Internal server error', 'message': str(error)}), 500


# Create the application instance
app = create_app()

if __name__ == '__main__':
    # Use threaded=False for better compatibility with some dependencies
    app.run(port=int(os.environ.get('API_PORT', 3333)), 
            debug=app.config['DEBUG'], 
            threaded=False)