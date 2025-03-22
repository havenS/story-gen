import edge_tts
import os
from helpers.audio_helpers import apply_equalization
import asyncio
from moviepy.editor import concatenate_audioclips, AudioFileClip, afx

async def text_to_speech_async(type, text, output_file):
    text = text.replace("-", ".")
    voice = "en-US-AndrewMultilingualNeural"
    if(type == 'Love'):
        voice = "en-US-MichelleNeural"
    communicator = edge_tts.Communicate(
        text, voice=voice,
        rate="-10%", pitch="-8Hz",
        connect_timeout=3000,
        receive_timeout=18000,
    )
    await communicator.save(output_file)

    apply_equalization(output_file, output_file)
    
    return output_file

def get_intro_voice_over(type, text):
    tmp_filename = "intro_voice_over.wav"
    asyncio.run(text_to_speech_async(type, text, tmp_filename))
    return tmp_filename

def get_horror_background_sound_path(key):
    sound_paths = {
        "forest_night": "assets/audio/20575__dobroide__20060706nightforest02.wav",
        "distant_thunderstorm": "assets/audio/53605__arnaud-coutancier__01storm-orage.wav",
        "abandoned_basement": "assets/audio/73100__lg__water-basement-04.wav",
        "eerie_background": "assets/audio/277192__thedweebman__eerie-tone-music-background-loop.wav",
        "ominous_crickets": "assets/audio/519064__angelkunev__deep-forest.wav",
        "deep_forest": "assets/audio/653983__garuda1982__distant-dog-barking-at-night-forest-lake-in-summer.mp3",
        "wind_desert": "assets/audio/697217__dhallcomposer__looping-gentle-wind-ambience-on-an-open-desert-plain.wav",
        "old_house_creaks": "assets/audio/698824__funky_audio__woodfric_floor-boards-creaking-slowly_funky-audio_fass.wav",
        "cave_ambience": "assets/audio/705429__newlocknew__ambdsgn_creepy-troll-cavedropsrumblebatssticky-wormsmonk-whispers_em.mp3",
        "eerie_wind": "assets/audio/715231__newlocknew__ambpark_parksummerpoplars-in-the-windjackdawspigeonscrows.wav",
        "countryside_village_night": "assets/audio/734747__klankbeeld__dripping-village-731-am-220731_0467.wav",
        "distant_people": "assets/audio/757825__klankbeeld__park-distant-people-1214-am-240929_0921.wav",
        "music_box": "assets/audio/eerie_background_music.wav",
    }

    return sound_paths.get(key, "assets/audio/277192__thedweebman__eerie-tone-music-background-loop.wav")

def get_love_background_sound_path(key):
    sound_paths = {
        "gentle_piano": "assets/audio/soft_piano.mp3",
        "soft_guitar": "assets/audio/guitar.mp3",
        "romantic_strings": "assets/audio/string.mp3",
        "ocean_waves": "assets/audio/174763__timkahn__pacific-ocean.flac",
        "fireplace_ambiance": "assets/audio/104124__inchadney__fireplace.wav",
        "rain_on_window": "assets/audio/346642__inspectorj__rain-on-windows-interior-a.wav",
        "intimate_jazz": "assets/audio/jazz.mp3",
        "forest_spring": "assets/audio/628624__klankbeeld__forest-edge-spring-nl-1128am-220414_0336.wav",
        "sunset_ambiance": "assets/audio/584839__klankbeeld__rural-sunset-may-engelen-nl-160531_0891.wav",
        "peaceful_meadow": "assets/audio/440807__puzzleaudio__meadow.wav",
    }

    return sound_paths.get(key, "assets/audio/soft_piano.mp3")

def sanitize_audio_file(input_path, output_path):
    """
    Re-encodes an audio file to remove problematic metadata, such as chapters.
    """
    try:
        command = [
            "ffmpeg", "-y",
            "-i", input_path,
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "44100",
            "-ac", "2",
            output_path
        ]
        result = os.system(" ".join(command))
        if result != 0:
            raise RuntimeError(f"Failed to sanitize audio file: {input_path}")

    except Exception as e:
        print(f"Error sanitizing audio file: {e}")
        raise

def loop_audio(audio_clip, duration):
    clips = []
    current_duration = 0
    while current_duration < duration:
        clips.append(audio_clip)
        current_duration += audio_clip.duration
    
    concatenated_clip = concatenate_audioclips(clips).set_duration(duration)
    # Apply audio fades using afx - the correct function names in MoviePy 1.0.3
    final_clip = concatenated_clip
    final_clip = afx.audio_fadein(final_clip, 2)
    final_clip = afx.audio_fadeout(final_clip, 2)
    return final_clip