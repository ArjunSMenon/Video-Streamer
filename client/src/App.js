import React, { useState } from 'react'

const App = () => {
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  const handlePlay = () => {
    const vPlayer = document.getElementById('videoPlayer');

    vPlayer.pause();
    vPlayer.removeAttribute('src');
    vPlayer.load();

    const videoSource = `http://localhost:8000/stream/${season}/${episode}`;
    vPlayer.src = videoSource;

    vPlayer.load();
    vPlayer.play().catch((err) => {
      console.error("Error when playing video", err)
    });
    
    console.log(`Playing: Season ${season}, Episode ${episode}`);
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>The Big Bang Theory Streaming App</h1>
      <div>
        <label>
          Season
          <input
            type='number'
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            min="1"
          />
        </label>
        <label>
          Episode
          <input
            type='number'
            value={episode}
            onChange={(e) => setEpisode(e.target.value)}
            min="1"
          />
        </label>
        <button onClick={handlePlay}>
          Play 
        </button>
      </div>
      <video id='videoPlayer' controls width="640" style={{ marginTop: '20px' }} />
    </div>
  )
}

export default App;