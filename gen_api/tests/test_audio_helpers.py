import pytest
import os
import numpy as np
from helpers.audio_helpers import apply_equalization, slow_audio
from pedalboard.io import AudioFile

@pytest.fixture
def sample_audio_file(tmp_path):
    """Create a sample audio file for testing"""
    # Create a simple sine wave
    sample_rate = 44100
    duration = 1  # seconds
    t = np.linspace(0, duration, int(sample_rate * duration))
    audio = np.sin(2 * np.pi * 440 * t)  # 440 Hz sine wave
    
    # Convert to stereo by duplicating the channel
    audio_stereo = np.column_stack((audio, audio))
    
    # Save as WAV file
    input_path = tmp_path / "input.wav"
    with AudioFile(str(input_path), 'w', sample_rate, num_channels=2) as f:
        f.write(audio_stereo)
    
    return str(input_path)

@pytest.fixture
def output_audio_path(tmp_path):
    """Create a path for output audio file"""
    return str(tmp_path / "output.wav")

def test_apply_equalization(sample_audio_file, output_audio_path):
    """Test the apply_equalization function"""
    # Apply equalization
    apply_equalization(sample_audio_file, output_audio_path)
    
    # Check if output file exists
    assert os.path.exists(output_audio_path)
    
    # Check if output file is not empty
    assert os.path.getsize(output_audio_path) > 0
    
    # Check if output file is a valid audio file
    with AudioFile(output_audio_path) as f:
        audio = f.read(f.frames)
        assert len(audio) > 0
        assert f.samplerate == 44100

def test_apply_equalization_with_invalid_input():
    """Test apply_equalization with invalid input file"""
    # The function prints an error message but doesn't raise an exception
    apply_equalization("nonexistent.wav", "output.wav")
    # We can't test for the error message since it's printed to stdout
    # but we can verify the function completes without raising an exception

def test_apply_equalization_with_invalid_output():
    """Test apply_equalization with invalid output path"""
    # Create a temporary input file
    with open("input.wav", "wb") as f:
        f.write(b"dummy wav content")
    
    # The function prints an error message but doesn't raise an exception
    apply_equalization("input.wav", "/invalid/path/output.wav")
    
    # Clean up
    os.remove("input.wav")

def test_slow_audio(sample_audio_file, output_audio_path):
    """Test the slow_audio function"""
    # Slow down the audio
    result = slow_audio(sample_audio_file, output_audio_path)
    
    # Check if the output file exists and is valid
    assert os.path.exists(output_audio_path)
    assert os.path.getsize(output_audio_path) > 0
    
    # Try to read the output file to verify it's a valid audio file
    with AudioFile(output_audio_path, 'r') as f:
        assert f.num_channels == 2
        assert f.samplerate == 44100
        assert f.frames > 0

def test_slow_audio_with_invalid_input():
    """Test slow_audio with invalid input file"""
    result = slow_audio("nonexistent.wav", "output.wav")
    assert result is False

def test_slow_audio_with_invalid_output():
    """Test slow_audio with invalid output path"""
    result = slow_audio("input.wav", "/invalid/path/output.wav")
    assert result is False

def test_slow_audio_with_missing_soundstretch():
    """Test slow_audio when soundstretch is not installed"""
    # Create a temporary input file
    with open("input.wav", "wb") as f:
        f.write(b"dummy wav content")
    
    # Temporarily modify PATH to make soundstretch unavailable
    original_path = os.environ["PATH"]
    os.environ["PATH"] = ""
    
    try:
        result = slow_audio("input.wav", "output.wav")
        assert result is False
    except FileNotFoundError:
        # This is also acceptable as it indicates soundstretch is not found
        pass
    finally:
        # Restore original PATH
        os.environ["PATH"] = original_path
        
        # Clean up
        if os.path.exists("input.wav"):
            os.remove("input.wav")
        if os.path.exists("output.wav"):
            os.remove("output.wav") 