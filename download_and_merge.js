const fs = require('fs');
const path = require('path');
const axios = require('axios');
const m3u8Parser = require('m3u8-parser');
const concatSegments = require('./merge_segments');

const getAbsoluteUrl = (baseUrl, relativeUrl) => {
  try {
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    const base = new URL(baseUrl);
    return new URL(relativeUrl, base).toString();
  } catch (error) {
    console.error(`❌ Error forming absolute URL from base: ${baseUrl} and relative: ${relativeUrl}`);
    throw error;
  }
};

const getHighestResolutionStream = async (m3u8Content, baseUrl) => {
  console.log('🔍 Fetching and parsing the M3U8 file for the highest resolution stream...');
  const parser = new m3u8Parser.Parser();
  parser.push(m3u8Content);
  parser.end();

  const manifest = parser.manifest;
  if (!manifest.playlists || manifest.playlists.length === 0) {
    throw new Error('No playlists found in M3U8 file');
  }

  manifest.playlists.sort((a, b) => b.attributes.RESOLUTION.height - a.attributes.RESOLUTION.height);
  const highestResUri = getAbsoluteUrl(baseUrl, manifest.playlists[0].uri);
  console.log(`✅ Highest resolution stream found: ${highestResUri}`);
  return highestResUri;
};

const downloadSegment = async (url, outputDir, segmentIndex, retries = 3) => {
  console.log(`⬇️ Downloading segment ${segmentIndex}...`);
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const segmentPath = path.join(outputDir, `segment_${segmentIndex}.ts`);
    fs.writeFileSync(segmentPath, response.data);
    console.log(`✅ Segment ${segmentIndex} downloaded`);
    return segmentPath;
  } catch (error) {
    console.error(`❌ Error downloading segment ${segmentIndex}: ${error.message}`);
    if (retries > 0) {
      console.log(`🔄 Retrying segment ${segmentIndex} download (${retries} retries left)...`);
      return downloadSegment(url, outputDir, segmentIndex, retries - 1);
    }
    return null;
  }
};

const downloadM3u8 = async (m3u8FilePath, downloadDir, outputDir, outputFileName) => {
  try {
    console.log(`🌐 Reading M3U8 file: ${m3u8FilePath}...`);
    const m3u8Content = fs.readFileSync(m3u8FilePath, 'utf8');
    const highestResUrl = await getHighestResolutionStream(m3u8Content, m3u8FilePath);

    console.log('🌐 Fetching highest resolution stream M3U8 file...');
    const response = await axios.get(highestResUrl);
    console.log('✅ Highest resolution stream M3U8 file fetched');

    const parser = new m3u8Parser.Parser();
    parser.push(response.data);
    parser.end();

    const manifest = parser.manifest;
    const segments = manifest.segments;

    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
      console.log('📁 Download directory created');
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log('📁 Output directory created');
    }

    const segmentPaths = [];
    for (let i = 0; i < segments.length; i++) {
      const segmentUrl = getAbsoluteUrl(highestResUrl, segments[i].uri);
      const segmentPath = await downloadSegment(segmentUrl, downloadDir, i);
      if (segmentPath) {
        segmentPaths.push(`file '${segmentPath}'`);
      } else {
        console.error(`❌ Skipping segment ${i} due to download error`);
      }
    }

    if (segmentPaths.length === 0) {
      throw new Error('No segments were downloaded successfully');
    }

    const segmentsFilePath = path.join(downloadDir, 'segments.txt');
    fs.writeFileSync(segmentsFilePath, segmentPaths.join('\n'));
    console.log('✅ Segment list file created');

    const outputFilePath = path.join(outputDir, outputFileName);
    await concatSegments(segmentsFilePath, outputFilePath);
    console.log(`🎉 All segments downloaded and merged to ${outputFileName}`);
  } catch (error) {
    console.error(`❌ Error processing ${m3u8FilePath}: ${error.message}`);
  }
};

const processAllM3u8Files = async () => {
  const sourceDir = path.resolve(__dirname, 'source');
  const downloadDir = path.resolve(__dirname, 'downloads');
  const outputDir = path.resolve(__dirname, 'merged');

  if (!fs.existsSync(sourceDir)) {
    console.error('❌ Source directory does not exist.');
    return;
  }

  const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.m3u8'));

  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    const outputFileName = `${path.basename(file, '.m3u8')}.mp4`;
    await downloadM3u8(filePath, downloadDir, outputDir, outputFileName);
  }
};

processAllM3u8Files()
  .then(() => console.log('✅ All downloads and merges complete'))
  .catch(err => console.error('❌ Error:', err));
