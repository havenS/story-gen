import asyncio
from flask import jsonify, send_file
from .audio_service import text_to_speech_async

async def generate_tts(request):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON request"}), 400
            
        text = data.get('text')
        type = data.get('type')
        output_filename = data.get('filename', "output.wav")
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        try:
            # Call text_to_speech_async with equalization applied
            if asyncio.get_event_loop().is_running():
                processed_filename = await text_to_speech_async(type, text, output_filename)
            else:
                processed_filename = asyncio.run(text_to_speech_async(type, text, output_filename))

            # Send the processed audio file in response
            return send_file(processed_filename, as_attachment=True), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
