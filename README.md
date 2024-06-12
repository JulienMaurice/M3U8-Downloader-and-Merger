# M3U8 Downloader and Merger

This repository provides a utility to download and merge video segments from M3U8 files. M3U8 is a playlist file used by HTTP Live Streaming (HLS), which is commonly used for streaming video content over the internet. The script reads M3U8 files, downloads the highest resolution video segments, and merges them into a single video file.

## Features

-   Automatically selects and downloads the highest resolution stream.
-   Downloads video segments concurrently for faster performance.
-   Merges downloaded segments into a single video file.

## Requirements

To use this script, you need to have the following installed:

-   [Node.js](https://nodejs.org/)
-   [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
-   [ffmpeg](https://ffmpeg.org/) (Make sure `ffmpeg` is available in your system PATH)

## Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/m3u8-downloader-merger.git
    cd m3u8-downloader-merger
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```
    Or, if you prefer pnpm:
    ```bash
    pnpm install
    ```

## Directory Structure

Ensure your project directory has the following structure:

```plaintext
.
├── downloads              # Directory where video segments are downloaded
├── merged                 # Directory where merged videos are saved
├── node_modules           # Directory for node modules
├── source                 # Directory containing M3U8 files
├── download_and_merge.js  # Main script for downloading and merging videos
├── merge_segments.js      # Utility script for merging segments using ffmpeg
├── package.json           # Node.js project file
├── pnpm-lock.yaml         # Lock file for pnpm (optional)
```

## Usage

1. **Place M3U8 files in the `source` directory**:

    - Create `.m3u8` files containing the URLs for the different resolutions of the videos you want to download.
    - Example content of an M3U8 file:
        ```plaintext
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-STREAM-INF:AVERAGE_BANDWIDTH=336265,BANDWIDTH=363288,RESOLUTION=1920x1080,NAME=1080p
        https://example.com/deliveries/9e0c18f3cad3ed6aa0.m3u8
        #EXT-X-STREAM-INF:AVERAGE_BANDWIDTH=169580,BANDWIDTH=162936,RESOLUTION=400x224,NAME=224p
        https://example.com/deliveries/7c0ae27d61f097b3ca.m3u8
        #EXT-X-STREAM-INF:AVERAGE_BANDWIDTH=194223,BANDWIDTH=192104,RESOLUTION=640x360,NAME=360p
        https://example.com/deliveries/3415afb47215a2a425.m3u8
        #EXT-X-STREAM-INF:AVERAGE_BANDWIDTH=229267,BANDWIDTH=234368,RESOLUTION=960x540,NAME=540p
        https://example.com/deliveries/5cf028db90ff9fc6ad.m3u8
        #EXT-X-STREAM-INF:AVERAGE_BANDWIDTH=267103,BANDWIDTH=278320,RESOLUTION=1280x720,NAME=720p
        https://example.com/deliveries/d8449e9b051aed77b7.m3u8
        ```

2. **Run the main script**:
    - Execute the `download_and_merge.js` script to start the download and merging process.
    - Use the following command in the terminal:
        ```bash
        node download_and_merge.js
        ```

## How It Works

1. **Read M3U8 Files**:

    - The script reads all M3U8 files located in the `source` directory.

2. **Fetch and Parse the M3U8 File**:

    - It fetches the M3U8 file content and parses it to find the highest resolution stream available.

3. **Download Video Segments**:

    - The script downloads the video segments of the highest resolution stream and saves them in the `downloads` directory.

4. **Merge Segments**:
    - After downloading all segments, the script merges them into a single video file using `ffmpeg` and saves the merged video in the `merged` directory.

## Outcome

After running the script, you will find:

-   **Downloaded segments** in the `downloads` directory.
-   **Merged videos** in the `merged` directory, each named after the corresponding M3U8 file from the `source` directory.
