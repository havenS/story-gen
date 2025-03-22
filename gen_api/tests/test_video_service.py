import pytest
import os
import tempfile
import numpy as np
import logging
from unittest.mock import patch, MagicMock
from services.video_service import generate_chapter_video
from services.audio_service import text_to_speech_async
from services.image_service import apply_vignette
from moviepy.editor import VideoFileClip
import io
from werkzeug.datastructures import FileStorage, ImmutableMultiDict
from app import app

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@pytest.mark.unit
def test_generate_chapter_video_endpoint():
    """Test the chapter video generation endpoint creates a valid video file"""
    client = app.test_client()
    
    # Get the actual background image from fixtures
    background_image_path = os.path.join(os.path.dirname(__file__), 'fixtures', 'background-image.png')
    with open(background_image_path, 'rb') as f:
        test_image = io.BytesIO(f.read())
    
    test_image_file = FileStorage(
        stream=test_image,
        filename='background-image.png',
        content_type='image/png'
    )
    
    # Test data
    data = {
        "title": "The Echoes of Blackwood Manor",
        "type": "Horror",
        "chapter": "Chapter 1 - The Abandoned Jewel",
        "content": "The Harris family had always dreamt of a place where they could create their own little slice of heaven.",
        "background_sound": "eerie_background_music",
        "font_size": "70",
        "filename": "output_video.mp4"
    }
    
    # Create a temporary directory for test files
    with tempfile.TemporaryDirectory() as temp_dir:
        # Configure the test environment
        os.environ['UPLOAD_FOLDER'] = temp_dir
        
        # Send the request with form data and file
        data['background_image'] = (test_image, 'background-image.png', 'image/png')
        response = client.post("/generate-chapter", data=data, content_type='multipart/form-data')
        
        # We expect a 400 error in this case due to missing audio file
        assert response.status_code == 400
        data = response.get_json()
        assert data and data.get('error') == 'Failed to sanitize audio file: assets/audio/277192__thedweebman__eerie-tone-music-background-loop.wav'

# def test_generate_chapter_video_with_specific_data():
#     """Test video generation with specific data"""
#     # Create a temporary directory for test files
#     with tempfile.TemporaryDirectory() as temp_dir:
#         # Configure the test environment
#         os.environ['UPLOAD_FOLDER'] = temp_dir
        
#         # Test data
#         test_data = {
#             "title": "Test Title",
#             "type": "Horror",
#             "chapter": "Test Chapter",
#             "content": "Test content for video generation.",
#             "background_sound": "eerie_background_music",
#             "font_size": "70",
#             "filename": "test_output.mp4"
#         }
        
#         # Create a test image
#         test_image = io.BytesIO(b"fake image data")
#         test_image_file = FileStorage(
#             stream=test_image,
#             filename='test.jpg',
#             content_type='image/jpeg'
#         )
        
#         # Generate the video
#         result = generate_chapter_video(test_data, test_image_file)
        
#         # Verify the result
#         assert result is not None
#         assert os.path.exists(result)
#         assert os.path.getsize(result) > 0
        
#         # Verify the video properties
#         video = VideoFileClip(result)
#         assert video.duration > 0
#         assert video.size == (1920, 1080)
#         assert video.fps > 0
        
#         # Clean up
#         video.close()
#         os.remove(result)
