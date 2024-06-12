const ffmpeg = require('fluent-ffmpeg');

const concatSegments = (segmentsFilePath, outputFilePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(segmentsFilePath)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .outputOptions('-c', 'copy')
      .on('end', () => {
        console.log(`✅ Merging complete: ${outputFilePath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`❌ Error during merging: ${err.message}`);
        reject(err);
      })
      .save(outputFilePath);
  });
};

module.exports = concatSegments;
