import os
import json
import tempfile
import asyncio
import logging
from flask import jsonify, send_file
from moviepy.editor import TextClip, CompositeVideoClip, concatenate_videoclips, AudioFileClip, ImageClip, vfx, afx, concatenate_audioclips, CompositeAudioClip, VideoFileClip
from pydub import AudioSegment
from .image_service import apply_vignette
from .audio_service import get_intro_voice_over, loop_audio, sanitize_audio_file, text_to_speech_async, get_horror_background_sound_path, get_love_background_sound_path
import subprocess
from unittest.mock import MagicMock
import dotenv
import moviepy
from pydub.silence import detect_nonsilent
from aeneas.executetask import ExecuteTask
from aeneas.task import Task

# Load environment variables
dotenv.load_dotenv()

os.environ["FFMPEG_LOGLEVEL"] = "quiet"
default_font_size = 100
# Basic logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# title_font_path = "assets/fonts/Spectral_SC/SpectralSC-Medium.ttf"
# chapter_font_path = "assets/fonts/Spectral/Spectral-Medium.ttf"
title_font_path = "assets/fonts/Caveat_Brush/CaveatBrush-Regular.ttf"
chapter_font_path = "assets/fonts/Caveat_Brush/CaveatBrush-Regular.ttf"

def generate_chapter_video(request):
    logger.info("Starting chapter video generation.")
    
    # Retrieve text data
    title = request.form.get('title')
    story_type = request.form.get('type', 'Horror')
    chapter = request.form.get('chapter')
    content = request.form.get('content')
    background_sound_key = request.form.get('background_sound')
    font_size = int(request.form.get('font_size', default_font_size))
    output_filename = request.form.get("filename", "output_video.mp4")

    # Log received data
    logger.info(f"Type: {story_type}, Title: {title}, Chapter: {chapter}, Content: {len(content)} characters, Background sound: {background_sound_key}")

    # Retrieve the image file
    background_image_file = request.files.get('background_image')
    if background_image_file:
        # Temporarily save the image for use
        temp_image_path = tempfile.mktemp(suffix=".jpg")
        background_image_file.save(temp_image_path)
        logger.info(f"Background image temporarily saved at: {temp_image_path}")
    else:
        logger.error("Missing background image in the request.")
        return None, "Missing background image"

    # Chapter introduction with voice-over of "chapter"
    try:
        logger.info("Creating the first part of the video.")
        silence = AudioSegment.silent(duration=2000)  # 2000 ms = 2 seconds
        temp_silence_path = tempfile.mktemp(suffix=".wav")
        silence.export(temp_silence_path, format="wav")

        logger.info(f"Creating TextClip with chapter={chapter}, fontsize={font_size}, font={chapter_font_path}")
        chapter_clip = TextClip(txt=chapter, fontsize=font_size, color='white', font=chapter_font_path).set_duration(6)
        chapter_clip = vfx.fadein(chapter_clip, 2.5)
        chapter_clip = chapter_clip.set_position(("center", "center")).set_start(4)
        
        logger.info(f"Creating TextClip with title={title}, fontsize={font_size}, font={title_font_path}")
        title_clip = TextClip(txt=title, fontsize=font_size, color='white', font=title_font_path).set_duration(10)
        title_clip = vfx.fadein(title_clip, 5)
        title_clip = title_clip.set_position(("center", chapter_clip.size[1] + 100))

        # Configure the voice-over to start exactly at 2 seconds
        silence_clip = AudioFileClip(temp_silence_path)
        voice_over_intro_title = AudioFileClip(get_intro_voice_over(story_type, title))
        voice_over_intro_chapter = AudioFileClip(get_intro_voice_over(story_type, chapter))
        voice_over_with_silence = concatenate_audioclips([silence_clip, voice_over_intro_title, silence_clip, voice_over_intro_chapter])

        # Create video composite with audio set to start at 2 seconds
        video_intro = CompositeVideoClip([title_clip, chapter_clip], size=(1920, 1080), bg_color=(0, 0, 0))
        video_intro = video_intro.set_audio(voice_over_with_silence)

        # Apply fade out using vfx
        video_intro = vfx.fadeout(video_intro, 2) # 2 seconds fade out
        logger.info("First part of the video created successfully.")
    except Exception as e:
        logger.error(f"Error creating the first part of the video: {e}")
        return None, str(e)

    # Chapter reading with voice-over of "content"
    try:
        # Generate voice-over for "content"
        content_voiceover_path = "content_voiceover.wav"
        asyncio.run(text_to_speech_async(story_type, content, content_voiceover_path))
        content_voice_over = AudioFileClip(content_voiceover_path)

        logger.info("Creating the second part of the video.")
        
        # Load background sound based on the key
        background_sound_path = get_horror_background_sound_path(background_sound_key) if story_type == "Horror" else get_love_background_sound_path(background_sound_key)

        # Sanitize the audio file to avoid metadata issues
        sanitized_audio_path = tempfile.mktemp(suffix=".wav")
        sanitize_audio_file(background_sound_path, sanitized_audio_path)

        # Load the sanitized audio file
        background_sound_clip = AudioFileClip(sanitized_audio_path).volumex(0.25)
        
        # Create looped background with fade
        background_sound = loop_audio(background_sound_clip, duration=content_voice_over.duration + 5)
        background_sound = background_sound.volumex(0.25)
        
        logger.info(f"Background sound loaded from: {background_sound_path}")
        
        # Create composite audio with content voice over
        composite_audio_content = CompositeAudioClip([background_sound, content_voice_over]).set_duration(background_sound.duration)
        # Apply fade out to the final audio
        composite_audio_content = afx.audio_fadeout(composite_audio_content, 2)
        chapter_voice_over_with_silence = concatenate_audioclips([silence_clip, composite_audio_content])

        temp_vignette_image_path = apply_vignette(temp_image_path)
        print("Duration of content voice over:", content_voice_over.duration)
        background_image_clip = ImageClip(temp_vignette_image_path, duration=chapter_voice_over_with_silence.duration).resize(height=1080)

        video_content = CompositeVideoClip([background_image_clip], size=(1920, 1080), bg_color=(0, 0, 0))
        video_content = video_content.set_audio(chapter_voice_over_with_silence)

        # Apply fade in/out using vfx
        video_content = vfx.fadein(video_content, 1)
        video_content = vfx.fadeout(video_content, 1)  # 1 second fade out
        logger.info("Second part of the video created successfully.")
    except Exception as e:
        logger.error(f"Error creating the second part of the video: {e}")
        return None, str(e)

    # Concatenate the two parts of the video
    try:
        logger.info("Concatenating the two parts of the video.")
        final_video = concatenate_videoclips([video_intro, video_content])
    except Exception as e:
        logger.error(f"Error concatenating: {e}")
        logger.error(f"video_intro duration: {video_intro.duration}, video_content duration: {video_content.duration}")
        return None, str(e)
    
    try:
        logger.info("Exporting the video.")
        final_video.write_videofile(output_filename, fps=24, bitrate="8000k", preset="slow", codec="libx264", audio_codec="aac")
        logger.info(f"Final video exported to: {output_filename}")
    except Exception as e:
        logger.error(f"Error exporting the video: {e}")
        logger.error(f"video_intro duration: {video_intro.duration}, video_content duration: {video_content.duration}")
        return None, str(e)
    finally:
        # Delete the temporary image file after use
        final_video.close()
        os.remove(temp_image_path)
        os.remove(temp_silence_path)
        os.remove(content_voiceover_path)
        os.remove(temp_vignette_image_path)
        logger.info("Temporary files deleted")

    return output_filename, None

def generate_full_story_video(request):
    # Parse request, get the 3 videos then concatenate all of them in one video to return
    logger.info("Generating full story video")
    
    story_type = request.form.get('type', 'Horror')
    output_filename = request.form.get("filename", "output_video.mp4")
    
    # Check if we have a JSON string of chapter files
    chapter_files_json = request.form.get('chapter_files')
    if chapter_files_json:
        try:
            chapter_files = json.loads(chapter_files_json)
            if not isinstance(chapter_files, list) or not chapter_files:
                logger.error("Invalid chapter files format in request.")
                return None, "Invalid chapter files format"
                
            # Load each video file
            video_clips = []
            for chapter in chapter_files:
                if not os.path.exists(chapter['path']):
                    logger.error(f"Video file not found: {chapter['path']}")
                    return None, f"Video file not found: {chapter['path']}"
                clip = VideoFileClip(chapter['path'])
                video_clips.append(clip)
        except json.JSONDecodeError:
            logger.error("Invalid JSON format for chapter_files")
            return None, "Invalid JSON format for chapter_files"
    else:
        # Get individual chapter files
        chapter_1_file = request.files.get('chapter_1')
        chapter_2_file = request.files.get('chapter_2')
        chapter_3_file = request.files.get('chapter_3')
        
        if not chapter_1_file or not chapter_2_file or not chapter_3_file:
            logger.error("Missing chapter files in the request.")
            return None, "Missing chapter files in the request."
        
        # Save the files
        temp_chapter_1_path = tempfile.mktemp(suffix=".mp4")
        temp_chapter_2_path = tempfile.mktemp(suffix=".mp4")
        temp_chapter_3_path = tempfile.mktemp(suffix=".mp4")
        chapter_1_file.save(temp_chapter_1_path)
        chapter_2_file.save(temp_chapter_2_path)
        chapter_3_file.save(temp_chapter_3_path)
        
        logger.info(f"Chapter files saved to temporary locations")
        
        # Load the video clips
        video_clips = [
            VideoFileClip(temp_chapter_1_path),
            VideoFileClip(temp_chapter_2_path),
            VideoFileClip(temp_chapter_3_path)
        ]
    
    # Load the generic video
    generique_filename = "assets/generique_short.mov" if story_type == "Horror" else "assets/gen_hot_diaries.mov"
    generique_clip = VideoFileClip(generique_filename)
    generique_base_time = 5 if story_type == "Horror" else 8
    
    # Generate voice-over for the title
    title = request.form.get('title', '')
    if title:
        title_voiceover_path = "title_voiceover.wav"
        asyncio.run(text_to_speech_async(story_type, title, title_voiceover_path))
        title_voice_over = AudioFileClip(title_voiceover_path).set_start(generique_base_time + 2)
        
        # Composite the title text and voice-over onto the generic video
        generique_audio = CompositeAudioClip([generique_clip.audio, title_voice_over]).set_end(generique_base_time + 5)
        generique_video = generique_clip.set_audio(generique_audio).set_end(generique_base_time + 5)
        generique_video = generique_video.set_audio(CompositeAudioClip([generique_video.audio, title_voice_over]))
    else:
        generique_video = generique_clip.set_end(generique_base_time + 5)
    
    generique_video = generique_video.resize(height=1080)
    # Apply fade out using vfx
    generique_video = vfx.fadeout(generique_video, 2)
    
    # Concatenate the generic video with the chapter videos
    # try:
    if True:
        logger.info("Concatenating the generic video with the three parts of the video.")
        final_video = concatenate_videoclips([
            generique_video,
            video_clips[0],
            video_clips[1],
            video_clips[2]
        ])

        text_clip = TextClip(
            txt=title,
            font=title_font_path,
            fontsize=default_font_size,
            color="white",
            stroke_color="black",
            stroke_width=2,
            size=(final_video.w, None),
            method="label"
        ).set_position(("center", "center")).set_start(generique_base_time + 1).set_end(generique_base_time + 5)
        # Apply fade in using vfx
        text_clip = vfx.fadein(text_clip, 2)

        print(final_video.duration)
        print(text_clip.duration)
        final_video = CompositeVideoClip([final_video, text_clip])    # except Exception as e:
    #     logger.error(f"Error concatenating the video: {e}")
    #     return jsonify({"error": str(e)}), 500
    
    try:
        final_video.write_videofile(output_filename, fps=24, bitrate="8000k", preset="slow", codec="libx264", audio_codec="aac")
        final_video.close()
        logger.info(f"Final video exported to: {output_filename}")
        return output_filename, None
    except Exception as e:
        logger.error(f"Error exporting the video: {e}")
        return None, str(e)

def generate_short(request):
    logger.info("Starting chapter short generation.")

    # Extract request parameters
    background_image_file = request.files.get('background_image')
    text = request.form.get("text")
    story_type = request.form.get('type', 'Horror')
    output_filename = request.form.get("filename", "short_video.mp4")

    if not background_image_file or not text:
        return None, "Missing required parameters"

    # Temporarily save the background image
    temp_image_path = "temp_background.jpg"
    background_image_file.save(temp_image_path)

    temp_audio_path = "temp_audio.mp3"
    voice_over_raw = AudioFileClip(get_intro_voice_over(story_type, text))
    voice_over = voice_over_raw.copy()
    voice_over_raw.write_audiofile(temp_audio_path)
    alignment = align_text_with_audio(text, temp_audio_path)

    # Log alignment data
    logger.info(f"Alignment data: {alignment}")

    background_sound_key = "default"
    background_sound_path = get_horror_background_sound_path(background_sound_key) if story_type == "Horror" else get_love_background_sound_path(background_sound_key)
    sanitized_audio_path = tempfile.mktemp(suffix=".wav")
    sanitize_audio_file(background_sound_path, sanitized_audio_path)
    background_sound_clip = AudioFileClip(sanitized_audio_path).volumex(0.25)

    composite_audio_content = CompositeAudioClip([voice_over, background_sound_clip]).set_duration(voice_over.duration + 2).fx(afx.audio_fadeout, 1)

    video_width = 1080
    video_height = 1920

    video_clip = ImageClip(temp_image_path, duration=composite_audio_content.duration)
    
    crop_width = min(video_clip.w, video_width)
    crop_height = min(video_clip.h, video_height)
    x_center = video_clip.w / 2
    y_center = video_clip.h / 2

    video_clip = video_clip.crop(
        width=crop_width,
        height=crop_height,
        x_center=x_center,
        y_center=y_center
    ).resize(height=video_height)

    text_clips = []
    for segment in alignment:
        start_time = segment["start_time"]
        end_time = segment["end_time"]
        segment_text = segment["text"]

        logger.info(f"Creating TextClip for word '{segment_text}' from {start_time:.2f}s to {end_time:.2f}s")

        # Create a text clip for each word
        text_clip = TextClip(
            txt=segment_text,
            font=chapter_font_path,
            fontsize=default_font_size,
            color="white",
            stroke_color="black",
            stroke_width=2,
            size=(video_width, None),
            method="caption"
        ).set_position(("center", "center")).set_start(start_time).set_duration(end_time - start_time)

        text_clips.append(text_clip)

    # Combine text segments with the video clip
    final_video = CompositeVideoClip([video_clip] + text_clips, size=(video_width, video_height)).set_audio(composite_audio_content).fx(vfx.fadeout, 1)

    # Export the video
    try:
        final_video.write_videofile(output_filename, fps=24, codec="libx264", audio_codec="aac")
        return output_filename, None
    except Exception as e:
        logger.error(f"Error exporting the video: {e}")
        return None, str(e)
    finally:
        # Clean up temporary files
        os.remove(temp_image_path)
        os.remove(temp_audio_path)
        os.remove(sanitized_audio_path)

def align_text_with_audio(text, audio_path, global_offset=0.0):
    """
    Utilise Montreal Forced Aligner (MFA) pour aligner un texte avec un fichier audio.

    Args:
        text (str): Texte à aligner.
        audio_path (str): Chemin vers le fichier audio (WAV 16kHz mono).
        global_offset (float): Décalage global à appliquer à tous les timecodes (en secondes).

    Returns:
        list: Liste de dictionnaires contenant les mots et leurs timecodes.
    """
    # Prepare temporary paths
    temp_dir = tempfile.mkdtemp()
    temp_text_path = os.path.join(temp_dir, "input.txt")
    temp_audio_path = os.path.join(temp_dir, "input.wav")
    output_dir = os.path.join(temp_dir, "aligned")

    # Save the text in a temporary file
    with open(temp_text_path, "w") as f:
        f.write(text)

    # Copy or convert the audio to the required format
    os.system(f"cp {audio_path} {temp_audio_path}")

    # Paths for MFA models
    mfa_path = "mfa"  # Ensure mfa is installed and accessible via command line
    model_path = "english_us_arpa"  # Acoustic model
    lexicon_path = "english_us_arpa"  # Phonetic lexicon

    # MFA command for alignment
    command = [
        mfa_path,
        "align",
        temp_dir,  # Directory containing audio and text files
        lexicon_path,  # Phonetic dictionary
        model_path,  # Acoustic model
        output_dir,  # Output directory
        "--beam", "200",
        "--retry_beam", "800",
        "--output_format", "json",
        "--single_speaker", "true"
    ]

    # Execute MFA
    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Montreal Forced Aligner failed: {e}")

    # Load aligned results
    aligned_json_path = os.path.join(output_dir, "input.json")
    if not os.path.exists(aligned_json_path):
        raise RuntimeError("Alignment file not generated.")

    with open(aligned_json_path, "r") as f:
        alignment_data = json.load(f)

    # Clean up temporary files
    os.remove(temp_text_path)
    os.remove(temp_audio_path)
    os.remove(temp_dir + '/aligned/input.json')
    os.rmdir(temp_dir + '/aligned')
    os.rmdir(temp_dir)

    # Extract word alignments
    aligned_segments = []
    words_data = alignment_data["tiers"]["words"]["entries"]  # Access aligned words
    for word_entry in words_data:
        start_time = word_entry[0] + global_offset
        end_time = word_entry[1] + global_offset
        text = word_entry[2]
        if text:  # Ensure there is text
            aligned_segments.append({
                "start_time": max(0, start_time),
                "end_time": max(0, end_time),
                "text": text
            })

    return aligned_segments
