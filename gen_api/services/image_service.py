import os
import tempfile
import gc
from flask import jsonify, send_file, current_app
from diffusers import DiffusionPipeline, EulerDiscreteScheduler
import torch
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from huggingface_hub import login
import dotenv

# Load environment variables
dotenv.load_dotenv()

# Global variables for the diffusion model
pipe = None
generator = None
model_loaded = False

def load_model():
    """
    Load the diffusion model from Hugging Face.
    This function is skipped in testing mode.
    """
    global pipe, generator, model_loaded
    
    # Skip model loading if already loaded or in test mode
    if model_loaded:
        print('Model already loaded')
        return
        
    if current_app and current_app.config.get('TESTING', False):
        print('Test mode active - skipping model loading')
        return
    
    # Get model details from environment variables with defaults
    model_id = os.environ.get('HF_MODEL_ID', 'SG161222/RealVisXL_V5.0_Lightning')
    hf_token = os.environ.get('HF_TOKEN', '')
    
    print(f"Loading diffusion model: {model_id}")
    
    # Log in to Hugging Face if token is provided
    if hf_token:
        login(token=hf_token)
    
    # Load the model
    scheduler = EulerDiscreteScheduler.from_pretrained(model_id, subfolder="scheduler")
    pipe = DiffusionPipeline.from_pretrained(
        model_id, 
        scheduler=scheduler,
    )
    
    # Configure the model
    pipe.to("mps")
    pipe.enable_attention_slicing()
    pipe.enable_vae_slicing()
    pipe.safety_checker = None
    
    # Set up the generator for reproducibility
    generator = torch.Generator(device=pipe.device).manual_seed(42)
    model_loaded = True
    print("Model loaded successfully")

def generate_image(request):
    """
    Generate an image using the diffusion model based on the provided prompt.
    """
    global pipe
    
    print("Generating image")
    data = request.get_json()
    prompt = data.get('prompt')
    width, height = int(data.get('width', 1280)), int(data.get('height', 720))
    output_filename = data.get('filename', "output_image.png")
    
    print(f"w: {width}, h: {height}, prompt: {prompt}")
    if not prompt:
        return jsonify({"error": "No text provided"}), 400

    # Check if we're in test mode
    is_test_mode = current_app.config.get('TESTING', False)
    
    try:
        # Use fewer inference steps in testing mode
        inference_steps = data.get('num_inference_steps', 15)
        if is_test_mode:
            inference_steps = 1
            print('Running in test mode with reduced inference steps')
            
            # Return a placeholder image for tests
            test_image = Image.new('RGB', (width, height), color='gray')
            test_draw = ImageDraw.Draw(test_image)
            test_draw.text((width//2-100, height//2), f"Test image - {prompt}", fill='white')
            test_image.save(output_filename)
            result = send_file(output_filename, as_attachment=True)
            # Proper cleanup
            test_image.close()
            return result
        
        # Load the model if not already loaded - only happens on first call
        if not model_loaded:
            load_model()
        
        # Standard negative prompt for better image quality
        negative_prompt = ("| | Low Quality | | text logos | | watermarks | | signatures | | out of frame | | "
                          "jpeg artifacts | | ugly | | extra limbs | | extra legs | | partial body | | "
                          "overlapping bodies | | merged bodies | | extra hands | | extra feet | | "
                          "backwards limbs | | extra fingers | | extra toes | | bad anatomy | | "
                          "cut off body pieces | | strange body positions | | impossible body positioning | | "
                          "Mismatched eyes | | cross eyed | | crooked face | | crooked lips | | unclear | | "
                          "undefined | | mutations | | deformities | | off center | | poor_composition | | "
                          "duplicate faces, photo, 3d, plastic, photorealistic, tiny, blurry, blurred, doll")
        
        # Generate the image
        image = pipe(prompt=prompt, 
                    negative_prompt=negative_prompt,
                    num_inference_steps=inference_steps, 
                    width=width, 
                    height=height,
                    generator=generator).images[0]
        
        print('Image generated')
        image.save(output_filename)
        print('Image saved')

        # Clear the PyTorch cache after generation
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        if hasattr(torch.mps, 'empty_cache'):
            torch.mps.empty_cache()
        
        gc.collect()  # Run garbage collection
        
        result = send_file(output_filename, as_attachment=True)
        # Proper cleanup
        image.close()
        return result
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        # Clear caches even on error
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        if hasattr(torch.mps, 'empty_cache'):
            torch.mps.empty_cache()
        gc.collect()
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(output_filename):
            os.remove(output_filename)
    
def generate_thumbnail(request):
    """
    Generate a thumbnail with overlays and text based on the provided image.
    """
    print("Generating thumbnail")
    image_file = request.files.get('image')
    brand = request.form.get('brand')
    title = request.form.get('title')
    story_type = request.form.get('type', 'Horror')
    filename = request.form.get('filename')

    print(f"brand: {brand}, title: {title}, filename: {filename}")
    print(f"image_file: {image_file}")

    thumbnail_font_path = "assets/fonts/EB_Garamond/static/EBGaramond-Medium.ttf"
    audio_font_path = "assets/fonts/Caveat_Brush/CaveatBrush-Regular.ttf"

    text_color = story_type == 'Horror' and "#FF0000" or "#FF60C2"
    fill_color = story_type == 'Horror' and "black" or "white"
    audio_image = story_type == 'Horror' and 'assets/images/audio-red.png' or 'assets/images/audio-pink.png'

    if not image_file or not brand or not title:
        return jsonify({"error": "Missing required parameters"}), 400

    image = None
    waves = None
    temp_image_path = None
    temp_vignette_path = None
    
    try:
        # Load the image from the request
        print("Loading image from request")
        image = Image.open(image_file)
        
        # Apply vignette effect
        print("Applying vignette effect")
        temp_image_path = tempfile.mktemp(suffix=".png")
        image.save(temp_image_path)
        temp_vignette_path = apply_vignette(temp_image_path)
        
        # Close the first image before opening the new one
        image.close()
        image = Image.open(temp_vignette_path)

        # Add waves.png with a light black shadow at the top right corner
        print("Adding waves image")
        waves = Image.open(audio_image)
        waves = waves.resize((400, int(waves.height * (400 / waves.width))))
        image.paste(waves, (image.width - waves.width - 40, 30), waves)
        # Close the waves image after pasting
        waves.close()

        # Add "Audio" text under the waves image
        print("Adding 'Audio' text")
        draw = ImageDraw.Draw(image)
        font_audio = ImageFont.truetype(audio_font_path, 90)

        contour_width = 4
        for x_offset in range(-contour_width, contour_width + 1):
            for y_offset in range(-contour_width, contour_width + 1):
                if x_offset != 0 or y_offset != 0:
                    draw.text(((image.width - waves.width + 50) + x_offset, (20 + waves.height) + y_offset), "AUDIO", font=font_audio, fill=fill_color)
        draw.text((image.width - waves.width + 50, 20 + waves.height), "AUDIO", font=font_audio, fill=text_color)

        # Add title text at the bottom left corner
        print("Adding title text")
        font_title = ImageFont.truetype(audio_font_path, 150)
        # Draw the title text with a contour
        contour_width = 5
        for x_offset in range(-contour_width, contour_width + 1):
            for y_offset in range(-contour_width, contour_width + 1):
                if x_offset != 0 or y_offset != 0:
                    draw.text((50 + x_offset, image.height-200 + y_offset), title, font=font_title, fill=fill_color)
        draw.text((50, image.height-200), title, font=font_title, fill=text_color)

        # Resize the image to 1280 x 720
        print("Resizing image to 1280x720")
        image = image.resize((1280, 720))
        image.save(filename)
        print('Thumbnail generated and saved')

        return filename, None
    except Exception as e:
        print(f"Error generating thumbnail: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up PIL Image resources
        if image:
            try:
                image.close()
            except Exception:
                pass
        
        if waves and hasattr(waves, 'close'):
            try:
                waves.close()
            except Exception:
                pass
        
        # Run garbage collection
        gc.collect()

def apply_vignette(image_path, intensity=0.45, blur_strength=1251):
    """
    Apply a vignette effect to the image at the given path.
    
    Args:
        image_path: Path to the input image
        intensity: Vignette intensity (0.0-1.0)
        blur_strength: Strength of the Gaussian blur for the vignette edges
        
    Returns:
        Path to the processed image with vignette effect
    """
    # Load the image
    image = None
    temp_vignette_path = 'temp_vignette_image.png'
    try:
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image from {image_path}")
            
        rows, cols = image.shape[:2]

        # Create a black mask (the size of the image)
        mask = np.zeros((rows, cols), dtype=np.uint8)

        # Draw a centered white ellipse
        center = (cols // 2, rows // 2)
        axes = (int(cols * intensity), int(rows * intensity))  # Size of the ellipse
        cv2.ellipse(mask, center, axes, 0, 0, 360, 255, -1)

        # Apply a stronger Gaussian blur to the mask for a more diffuse effect
        mask = cv2.GaussianBlur(mask, (blur_strength, blur_strength), 0)

        # Apply the blurred mask to each channel (BGR)
        vignetted = np.copy(image)
        for i in range(3):
            vignetted[:, :, i] = vignetted[:, :, i] * (mask / 255)
        
        cv2.imwrite(temp_vignette_path, vignetted)
        return temp_vignette_path
    except Exception as e: 
        print(f"Error applying vignette: {str(e)}")
        return None
    finally:
        # Explicitly release OpenCV resources
        if image is not None:
            del image
            
        # Set variables to None to help garbage collection
        image = None
        mask = None
        vignetted = None
        gc.collect()
            