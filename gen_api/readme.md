# Story Generation API

A Python-based API service for generating story content, including video, audio, and image generation.

## Features

- Video generation with transitions and effects
- Audio synthesis and processing
- Image generation and manipulation
- Story content processing
- Integration with various AI models

## Prerequisites

### System Dependencies

#### macOS
```bash
brew install espeak ffmpeg imagemagick
export AENEAS_WITH_CEW=False
```

#### Ubuntu/Debian
```bash
sudo apt-get install espeak ffmpeg imagemagick
```

#### Windows
Download and install:
- [espeak](http://espeak.sourceforge.net/download.html)
- [ffmpeg](https://ffmpeg.org/download.html)
- [imagemagick](https://imagemagick.org/script/download.php)

### Python Environment

1. Create and activate a conda environment:
```bash
conda create -n story_gen python=3.9 -y
conda activate story_gen
```

2. Install additional dependencies:
```bash
conda config --add channels conda-forge
conda install montreal-forced-aligner
mfa model download acoustic english_us_arpa
mfa model download dictionary english_us_arpa
```

3. Install Python packages:
```bash
pip install -r requirements.txt
pip install "setuptools<60.0"
AENEAS_WITH_CEW=False pip install aeneas
```

## Project Structure

```
gen_api/
├── app.py              # Main application entry point
├── controllers/        # API route controllers
├── services/          # Business logic services
├── helpers/           # Utility functions
├── assets/           # Static assets
├── uploads/          # Temporary file storage
├── tests/            # Test files
└── requirements.txt  # Python dependencies
```

## Running the Service

### Local Development
```bash
python app.py
```

### Production Server
```bash
PYTORCH_ENABLE_MPS_FALLBACK=1 \
PYTORCH_MPS_HIGH_WATERMARK_RATIO=0.0 \
waitress-serve --port=8001 --threads=1 --channel-timeout=3000 app:app
```

### Docker
```bash
docker build -t story_gen .
```

## Testing

### Running Tests
```bash
# Run all tests
python -m pytest

# Run specific test file
python -m pytest tests/test_video_service.py

# Run integration tests only
python -m pytest -m integration

# Run unit tests only
python -m pytest -m "not integration"
```

## Environment Variables

Create a `.env` file based on `.env.example`:
```env
OPENAI_API_KEY=your_openai_api_key
OLLAMA_API_URL=your_ollama_api_url
YOUTUBE_API_KEY=your_youtube_api_key
```

## API Endpoints

- `POST /generate/story` - Generate a complete story
- `POST /generate/video` - Generate video content
- `POST /generate/audio` - Generate audio content
- `POST /generate/image` - Generate images
