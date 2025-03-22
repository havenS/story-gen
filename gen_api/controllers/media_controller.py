import asyncio
from flask import Blueprint, request, jsonify, send_file
from services.tts_service import generate_tts
from services.image_service import generate_image, generate_thumbnail
from services.video_service import generate_chapter_video, generate_full_story_video, generate_short
import json
from io import BytesIO

media_blueprint = Blueprint('media', __name__)

def get_request_data():
    """Helper function to get request data and handle invalid JSON"""
    if request.is_json:
        try:
            return request.get_json(), None
        except json.JSONDecodeError:
            return None, 'Invalid JSON request'
    else:
        try:
            return request.form, None
        except:
            return None, 'Invalid request data'

def send_file_response(file_obj, mimetype):
    """Helper function to send file responses"""
    try:
        if isinstance(file_obj, str):
            return send_file(file_obj, mimetype=mimetype, as_attachment=True)
        if isinstance(file_obj, BytesIO):
            file_obj.seek(0)
            return send_file(file_obj, mimetype=mimetype, as_attachment=True)
        file_obj.seek(0)
        return send_file(BytesIO(file_obj.read()), mimetype=mimetype, as_attachment=True)
    except Exception as e:
        return jsonify({'error': f'Failed to send file: {str(e)}'}), 500

@media_blueprint.route('/generate-tts', methods=['POST'])
def generate_tts_route():
    """
    Generate text-to-speech audio
    
    Required body parameters:
    - text (string): The text to convert to speech
    
    Optional body parameters:
    - type (string): The type of TTS to generate
    """
    print('Generating TTS')
    
    try:
        data, error = get_request_data()
        if error:
            return jsonify({'error': error}), 400

        if not data or 'text' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
            
        result = asyncio.run(generate_tts(request))
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@media_blueprint.route('/generate-image', methods=['POST'])
def generate_image_route():
    """
    Generate an image
    
    Required body parameters:
    - text (string): The text prompt for image generation
    
    Optional body parameters:
    - type (string): The type of image to generate
    """
    print('Generating image')
    try:
        data, error = get_request_data()
        if error:
            return jsonify({'error': error}), 400

        if not data or 'text' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
            
        result = generate_image(request)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@media_blueprint.route('/generate-chapter', methods=['POST'])
def generate_chapter_video_route():
    """
    Generate a chapter video
    
    Required body parameters:
    - chapter (string): The chapter content
    
    Optional body parameters:
    - type (string): The type of video to generate
    """
    print('Generating chapter video')
    try:
        data, error = get_request_data()
        if error:
            return jsonify({'error': error}), 400

        if not data or 'chapter' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
            
        output_filename, error = generate_chapter_video(request)
        if error:
            return jsonify({'error': error}), 400
        if not output_filename:
            return jsonify({'error': 'Failed to generate video'}), 500
        return send_file_response(output_filename, 'video/mp4')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@media_blueprint.route('/generate-full-story', methods=['POST'])
def generate_full_story_video_route():
    """
    Generate a full story video
    
    Required body parameters:
    - title (string): The story title
    
    Optional body parameters:
    - type (string): The type of video to generate
    """
    print('Generating full story video')
    try:
        data, error = get_request_data()
        if error:
            return jsonify({'error': error}), 400

        if not data or 'title' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
            
        output_filename, error = generate_full_story_video(request)
        if error:
            return jsonify({'error': error}), 400
        if not output_filename:
            return jsonify({'error': 'Failed to generate video'}), 500
        return send_file_response(output_filename, 'video/mp4')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@media_blueprint.route('/generate-thumbnail', methods=['POST'])
def generate_full_story_thumbnail_route():
    """
    Generate a thumbnail for a full story
    
    Required body parameters:
    - title (string): The story title
    
    Optional body parameters:
    - type (string): The type of thumbnail to generate
    """
    print('Generating full story thumbnail')
    try:
        data, error = get_request_data()
        if error:
            return jsonify({'error': error}), 400

        if not data or 'title' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
            
        output_filename, error = generate_thumbnail(request)
        if error:
            return jsonify({'error': error}), 400
        if not output_filename:
            return jsonify({'error': 'Failed to generate thumbnail'}), 500
        return send_file_response(output_filename, 'image/jpeg')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@media_blueprint.route('/generate-short', methods=['POST'])
def generate_story_short_route():
    """
    Generate a short-form video
    
    Required body parameters:
    - text (string): The content for the short video
    
    Optional body parameters:
    - type (string): The type of short video to generate
    """
    print('Generating story short')
    try:
        data, error = get_request_data()
        if error:
            return jsonify({'error': error}), 400

        if not data or 'text' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
            
        output_filename, error = generate_short(request)
        if error:
            return jsonify({'error': error}), 400
        if not output_filename:
            return jsonify({'error': 'Failed to generate short video'}), 500
        return send_file_response(output_filename, 'video/mp4')
    except Exception as e:
        return jsonify({'error': str(e)}), 500
