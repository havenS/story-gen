from pedalboard import Pedalboard, HighShelfFilter, LowShelfFilter
from pedalboard.io import AudioFile
import subprocess

def apply_equalization(input_audio_path, output_audio_path):
    try:
        with AudioFile(input_audio_path) as f:
            audio = f.read(f.frames)
            samplerate = f.samplerate
        
        # Reduce volume to 95%
        audio *= 0.95

        board = Pedalboard([
            LowShelfFilter(gain_db=-23, cutoff_frequency_hz=74),     # To attenuate bass around 74 Hz
            HighShelfFilter(gain_db=4.6, cutoff_frequency_hz=199),   # To amplify mediums/bass around 199 Hz
            HighShelfFilter(gain_db=-9.5, cutoff_frequency_hz=890),  # To attenuate mediums around 890 Hz
            HighShelfFilter(gain_db=0, cutoff_frequency_hz=1200),    # No change for 1200 Hz
            HighShelfFilter(gain_db=5.4, cutoff_frequency_hz=2780),  # Amplify treble around 2780 Hz
            HighShelfFilter(gain_db=7, cutoff_frequency_hz=7400),    # Amplify treble around 7400 Hz
        ])

        processed_audio = board(audio, samplerate)
        
        with AudioFile(output_audio_path, 'w', samplerate, processed_audio.shape[0]) as f:
            f.write(processed_audio)
    except Exception as e:
        print(f"Error applying equalization: {e}")

def slow_audio(input_audio_path, output_audio_path):
    # Run soundstretch synchronously to ensure it completes before continuing
    result = subprocess.run(
        ["soundstretch", input_audio_path, output_audio_path, f"-tempo=-8"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    # Check if there were any errors during execution
    if result.returncode != 0:
        print(f"Error in audio processing: {result.stderr.decode()}")
        return False

