# Video Splitter

A Node.js script to split videos into parts with text overlays.

## Prerequisites

- Node.js (v12 or higher)
- FFmpeg (must be installed and available in your system PATH)

## Installation

1. Make sure you have Node.js installed on your system
2. Install FFmpeg:
   - On macOS: `brew install ffmpeg`
   - On Ubuntu: `sudo apt update && sudo apt install ffmpeg`
   - On Windows: Download from https://ffmpeg.org/download.html

## Usage

1. Place your video file named `videoplayback.mp4` in the same directory as the script
2. Run the script using one of the following methods:

### Method 1: Using npm

```bash
npm install
npm start
```

### Method 2: Direct execution

```bash
node split_video.js
```

## What the script does

- Checks if FFmpeg is available on your system
- Creates a `video_parts` folder if it doesn't exist
- Gets the duration of your input video
- Splits the video based on its length:
  - If the video is 15 minutes or less, splits into 45-second segments
  - If the video is more than 15 minutes, splits into 1-minute segments
- Adds text overlays to each part:
  - "Part 1", "Part 2", etc. on each segment
  - "End Video" on the final segment (if there's a remainder)
- Saves the output videos in the `video_parts` folder as:
  - `video_parts/part1.mp4`
  - `video_parts/part2.mp4`
  - `video_parts/part3.mp4`
  - ...and so on, depending on the video length

## Customization

If you want to change the video file name, edit the `inputVideo` variable in the script.

You can also modify the text overlays by changing the text parameters in the `splitVideoWithText` function calls.

## FFmpeg Parameters Explained

- `-ss`: Start time for the video segment
- `-to`: End time for the video segment
- `-vf`: Video filter, specifically using `drawtext` to add text overlays
  - `fontsize=60`: Sets the font size
  - `fontcolor=white`: Sets the text color to white
- `x=(w-text_w)/2:y=(h-text_h)/2`: Centers the text on the video
- `box=1:boxcolor=black@0.5`: Adds a semi-transparent black box behind the text
- `-c:a copy`: Copies the audio stream without re-encoding
