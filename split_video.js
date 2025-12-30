const { exec } = require("child_process");
const fs = require("fs");

// Check if ffmpeg is available
function checkFFmpeg() {
  return new Promise((resolve, reject) => {
    exec("which ffmpeg", (error, stdout, stderr) => {
      if (error) {
        reject("ffmpeg is not installed or not available in PATH");
      } else {
        console.log("ffmpeg found at:", stdout.trim());
        resolve(stdout.trim());
      }
    });
  });
}

// Create output folder
function createOutputFolder(folderName) {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
    console.log(`Created folder: ${folderName}`);
  } else {
    console.log(`Folder ${folderName} already exists`);
  }
}

// Get video duration
function getVideoDuration(inputVideo) {
  return new Promise((resolve, reject) => {
    const command = `ffprobe -v quiet -show_entries format=duration -of csv=p=0 ${inputVideo}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error getting video duration: ${error}`);
      } else {
        const duration = parseFloat(stdout.trim());
        resolve(duration);
      }
    });
  });
}

// Split video with text overlay
function splitVideoWithText(inputVideo, startTime, endTime, outputFile, text) {
  return new Promise((resolve, reject) => {
    // Format times for ffmpeg
    const startTimeFormatted = formatTimeForFFmpeg(startTime);
    const endTimeFormatted = formatTimeForFFmpeg(endTime);

    const command = `ffmpeg -i "${inputVideo}" -ss ${startTimeFormatted} -to ${endTimeFormatted} -vf "drawtext=fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:text='${text}':box=1:boxcolor=black@0.5" -c:a copy "${outputFile}"`;

    console.log(`Executing: ${command}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error splitting video: ${error}`);
      } else {
        console.log(`Successfully created: ${outputFile}`);
        resolve();
      }
    });
  });
}

// Format time for ffmpeg (convert seconds to HH:MM:SS.mmm format)
function formatTimeForFFmpeg(seconds) {
  const date = new Date(null);
  date.setSeconds(seconds);
  const formatted = date.toISOString().substr(11, 12);
  return formatted;
}

// Main function
async function main() {
  const inputVideo = "videoplayback.mp4";
  const outputFolder = "video_parts";

  try {
    // Check if input video exists
    if (!fs.existsSync(inputVideo)) {
      throw new Error(`Input video ${inputVideo} does not exist`);
    }

    // Check if ffmpeg is available
    await checkFFmpeg();

    // Create output folder
    createOutputFolder(outputFolder);

    // Get video duration
    const duration = await getVideoDuration(inputVideo);
    console.log(
      `Video duration: ${duration} seconds (${formatTimeForFFmpeg(duration)})`
    );

    // Determine split duration based on total video length
    // If video is longer than 15 minutes, use 1-minute segments
    // If video is 15 minutes or less, use 45-second segments
    const minutesInVideo = duration / 60;
    const segmentDuration = minutesInVideo > 15 ? 60 : 45; // 60 seconds (1 minute) or 45 seconds

    console.log(`Video is ${minutesInVideo.toFixed(2)} minutes long`);
    console.log(`Using ${segmentDuration}-second segments`);

    // Calculate number of full segments and remainder
    const totalSegments = Math.floor(duration / segmentDuration);
    const remainder = duration % segmentDuration;

    console.log(
      `Creating ${totalSegments} full segments of ${segmentDuration} seconds each`
    );
    if (remainder > 0) {
      console.log(`Plus a final segment of ${remainder.toFixed(2)} seconds`);
    }

    // Split video into segments
    for (let i = 0; i < totalSegments; i++) {
      const start = i * segmentDuration;
      const end = (i + 1) * segmentDuration;
      const partNumber = i + 1;
      const text = `Part ${partNumber}`;

      await splitVideoWithText(
        inputVideo,
        start,
        end,
        `${outputFolder}/part${partNumber}.mp4`,
        text
      );
    }

    // Handle the final segment if there's a remainder
    if (remainder > 0) {
      const partNumber = totalSegments + 1;
      const start = totalSegments * segmentDuration;
      const end = duration; // end at the actual video duration
      const text = `End Video`;

      await splitVideoWithText(
        inputVideo,
        start,
        end,
        `${outputFolder}/part${partNumber}.mp4`,
        text
      );
    }

    console.log(
      "Video splitting completed! Check the video_parts folder for the results."
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the main function
main();
