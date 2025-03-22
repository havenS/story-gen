"""
Test configuration for pytest fixtures.
"""
import pytest
import os
import tempfile
from app import create_app
import time

@pytest.fixture
def app():
    """Create app instance for testing."""
    # Create a temporary directory for test files
    with tempfile.TemporaryDirectory() as temp_dir:
        # Set the upload folder to the temporary directory
        app = create_app({
            'TESTING': True,
            'DEBUG': False,
            'UPLOAD_FOLDER': temp_dir
        })
        yield app

@pytest.fixture
def client(app):
    """Create test client using the app fixture."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """Create CLI test runner using the app fixture."""
    return app.test_cli_runner()

# Sample data fixtures for tests
@pytest.fixture
def tts_request_data():
    """Sample data for TTS request"""
    return {
        "text": "This is a test message for text to speech conversion",
    }

@pytest.fixture
def image_request_data():
    """Sample data for image generation request"""
    return {
        "prompt": "A beautiful sunset over mountains",
        "filename": "test_image.png",
        "width": 160, "height": 96
    }

@pytest.fixture
def chapter_request_data():
    """Sample data for chapter video request"""
    return {
        "title": "Test Chapter",
        "type": "Horror",
        "chapter": "Chapter 1",
        "content": "This is a test chapter content.",
        "background_sound": "ambient",
        "font_size": "24",
        "filename": "test_output.mp4"
    }

@pytest.fixture(autouse=True)
def cleanup_test_files():
    """Automatically clean up test files after each test."""
    yield
    # List of files that might be created during tests
    test_files = [
        'test_output.wav',
        'test_output.mp3',
        'test_output.mp4',
        'test_image.png',
        'test_thumbnail.jpg'
    ]
    for file in test_files:
        if os.path.exists(file):
            try:
                os.remove(file)
            except OSError:
                pass

@pytest.fixture
def wait_for_stream_response():
    """Helper to wait for streamed response to complete"""
    def _wait(response, timeout=5):
        """
        Wait for a streamed response to complete
        
        Args:
            response: Flask response object
            timeout: Maximum wait time in seconds
            
        Returns:
            The completed response
        """
        start_time = time.time()
        while time.time() - start_time < timeout:
            if hasattr(response, '_streamed_response_finished') and response._streamed_response_finished:
                return response
            time.sleep(0.1)
        return response
    return _wait
