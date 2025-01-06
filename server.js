const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

const PORT = 8000;

app.use(cors());

app.use(`/videos`, express.static(path.join(__dirname, 'The-Big-Bang-Theory')));

app.get(`/stream/:season/:episode`, (req, res) => {
  let season = req.params.season
  let episode = req.params.episode

  if (season < 10) season = `0${season}`;
  if (episode < 10) episode = `0${episode}`;

  const filePath = path.join(__dirname, `The-Big-Bang-Theory/Season${season}/S${season}E${episode}.mp4`)

  if (!fs.existsSync(filePath)) {
    res.status(404).send('Episode Not Found');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? Math.min(parseInt(parts[1], 10), fileSize - 1) : fileSize - 1;

    if (isNaN(start) || isNaN(end) || start >= fileSize || end >= fileSize || start > end) {
      console.error('Invalid range request');
      return res.status(416).send('Requested range not satisfiable');
    }

    const chunkSize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });

    console.log(`Serving file: ${filePath}`);
    console.log(`Range header: ${range}`);
    console.log(`Parsed range: start=${start}, end=${end}, chunkSize=${chunkSize}`);

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': `bytes`,
      'Content-Length': chunkSize,
      'Content-Type': `video/mp4`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    fileStream.on('open', () => {
      console.log(`Streaming started: ${filePath}`);
    })
    fileStream.on('close', () => {
      console.log(`Streaming ended: ${filePath}`);
    })
    fileStream.on('error', () => {
      console.log(`Stream Error: ${error.message}`);
    })
    res.on('close', () => {
      fileStream.destroy(); //clean up the stream when the response closes
      console.log(`response closed, stream destroyed: ${filePath}`);
    })
    fileStream.pipe(res);
  } else {
    res.writeHead(206, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    });
    fs.createReadStream(filePath).pipe(res);
  }
})

app.listen(PORT, () => {
  console.log(`Backend Server Running on port: ${PORT}`);
})