# Story Generation API

This is the backend API for the Story Generation project. It handles video, audio, and image generation for story content.

## Setup

### System Dependencies

Before installing the Python packages, you need to install these system dependencies:

#### On macOS:
```
$ brew install espeak ffmpeg imagemagick
$ export AENEAS_WITH_CEW=False
```

#### On Ubuntu/Debian:
```
$ sudo apt-get install espeak ffmpeg imagemagick
```

#### On Windows:
Download and install:
- espeak: http://espeak.sourceforge.net/download.html
- ffmpeg: https://ffmpeg.org/download.html
- imagemagick: https://imagemagick.org/script/download.php

### Python Environment

Create a virtual environment and install the required packages:

```
$ python -m venv venv
$ source venv/bin/activate  # On Windows: venv\Scripts\activate
$ pip install -r requirements.txt
```

Install Aenas:
https://github.com/sillsdev/aeneas-installer/releases

## Running the API

To run the API locally:

```
$ python app.py
```

## Testing

To run the tests:

```
$ python -m pytest
```

To run specific test files:

```
$ python -m pytest tests/test_video_service.py
```

To run integration tests (these require all system dependencies):

```
$ python -m pytest -m integration
```

To run only unit tests (skipping integration tests):

```
$ python -m pytest -m "not integration"
```

# Requirements

## Global
```
$ conda create -n story_gen python=3.9 -y
$ conda activate story_gen
```

## Intro-api
```
$ brew install imagemagick sox sound-touch
$ conda config --add channels conda-forge
$ conda install montreal-forced-aligner
$ mfa model download acoustic english_us_arpa 
$ mfa model download dictionary english_us_arpa 
$ pip install -r requirements.txt
```

# Run
```
$ PYTORCH_MPS_HIGH_WATERMARK_RATIO=0.0  waitress-serve --port=8001 --threads=1 --channel-timeout=3000 app:app
```

# Docker
```
$ docker build -t story_gen .
```