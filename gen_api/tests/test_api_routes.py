"""
Integration tests for API routes.
Tests API endpoints by making requests and checking status codes.
"""
import pytest
import json
import os
import io
from unittest.mock import patch, AsyncMock

def test_home_route(client):
    """Test the home endpoint returns a 200 OK status code."""
    response = client.get('/')
    assert response.status_code == 200

def test_tts_endpoint_success(client, tts_request_data):
    """Test that the TTS endpoint accepts valid JSON data."""
    with patch('controllers.media_controller.generate_tts', new_callable=AsyncMock) as mock_generate_tts:
        mock_generate_tts.return_value = {'audio': 'base64_encoded_audio'}
        
        response = client.post(
            '/generate-tts',
            data=json.dumps(tts_request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['audio'] == 'base64_encoded_audio'

def test_tts_endpoint_invalid_json(client):
    """Test that the TTS endpoint rejects invalid JSON."""
    response = client.post(
        '/generate-tts',
        data="not valid json",
        content_type='application/json'
    )
    assert response.status_code == 400
    data = response.get_json()
    assert data and data.get('error') == 'Invalid JSON request'

def test_tts_endpoint_missing_fields(client):
    """Test that the TTS endpoint rejects requests with missing fields."""
    response = client.post(
        '/generate-tts',
        data=json.dumps({}),  # Missing required fields
        content_type='application/json'
    )
    assert response.status_code == 400
    data = response.get_json()
    assert data and data.get('error') == 'Missing required fields'

def test_tts_endpoint_method_not_allowed(client):
    """Test that the TTS endpoint rejects GET requests."""
    response = client.get('/generate-tts')
    assert response.status_code == 405  # Method Not Allowed

def test_generate_short_endpoint(client):
    """Test the generate-short endpoint with form data and background image."""
    # Get the actual background image from fixtures
    background_image_path = os.path.join(os.path.dirname(__file__), 'fixtures', 'background-image.png')
    with open(background_image_path, 'rb') as f:
        test_image = io.BytesIO(f.read())
    
    # Test data matching the curl command
    data = {
        'text': 'One evening, as Emma was finishing up her homework in the living room, she felt a cold draft brush past her. She glanced around, but there was nothing out of place.',
        'type': 'Horror',
        'filename': 'short_output.mp4'
    }
    
    # Add the background image to the form data
    data['background_image'] = (test_image, 'background-image.png', 'image/png')
    
    # Send the request
    response = client.post(
        '/generate-short',
        data=data,
        content_type='multipart/form-data'
    )
    
    # We expect a 400 error in this case due to missing audio file
    assert response.status_code == 400
    data = response.get_json()
    assert data and data.get('error') == 'Failed to sanitize audio file: assets/audio/277192__thedweebman__eerie-tone-music-background-loop.wav'

def test_nonexistent_endpoint(client):
    """Test that requesting a non-existent endpoint returns 404."""
    response = client.get('/nonexistent-endpoint')
    assert response.status_code == 404 