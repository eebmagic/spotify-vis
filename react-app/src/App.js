import { useEffect, useState, useRef } from 'react';
import URLEntry from './Entry.js';
import PList from './PList';
import { ForceGraph2D } from 'react-force-graph';

const App = () => {
  const [token, setToken] = useState("");

  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState({nodes: [], links: []});
  const [waiting, setWaiting] = useState(false);

  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userImage, setUserImage] = useState("");

  // Func for making call to python server and updated tracks
  const getPlaylist = (url) => {
    if (!waiting) {
      console.log(` Sending: ${url}`);
      setWaiting(true);
      fetch(`http://localhost:8000?url=${encodeURIComponent(url)}&email=${encodeURIComponent(userEmail)}&username=${encodeURIComponent(username)}`)
        .then(response => response.json())
        .then(data => {
          data.forEach(node => {
            const image = document.createElement('img');
            image.src = node.image.url;
            node.imageObj = image;
            const SCALE = 1000;
            node.x = node.startx * SCALE;
            node.y = node.starty * SCALE;
            const fullName = `${node.title} by ${node.artists.join(", ")}`
            node.id = fullName
          });

          var gdata = {
            nodes: data,
            links: []
          }
          console.log(`Recieved ${gdata.nodes.length} track nodes`);
          console.log(data)

          setTracks(gdata);
          setWaiting(false)
        });
    } else {
      console.log(`Blocked call because still waiting on last call`);
    }
  }

  // Run this effect when the component mounts to initiate the Spotify authentication flow
  useEffect(() => {
    var tokenAttempt = window.location.hash.split('&')[0].split('=')[1];
    var onlyOne = window.location.hash.split('&').length === 1;

    if (onlyOne && window.location.hash.split('&')[0] === "") {
      console.log(`Sending user to auth page...`)
      const clientId = '23344cb1f4b24df2927c825beeddf97c';
      const redirectUri = 'http://localhost:3000';
      const scopes = ['user-read-private', 'user-read-email', 'playlist-read-private'];

      const authorizeUrl = 'https://accounts.spotify.com/authorize';
      const responseType = 'token';
      const state = 'some-random-state';

      const authorizeUrlWithParams =
        `${authorizeUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scopes.join('%20')}&state=${state}`;

      // Redirect the user to the Spotify authorization page
      window.location.href = authorizeUrlWithParams;
    } else {
      console.log(`FOUND TOKEN from auth process`)
      setToken(tokenAttempt)
    }
  }, []);

  // Once the user has authenticated, the redirect URI will include an access token in the hash fragment
  const accessToken = window.location.hash.split('&')[0].split('=')[1];

  // Get user playlists
  useEffect(() => {
    if (accessToken) {
      fetch('https://api.spotify.com/v1/me/playlists?limit=3', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
        .then(response => response.json())
        .then(data => {
          setPlaylists(data.items);
        });
    }
  }, [accessToken]);

  // Get the username, email, and userimage
  useEffect(() => {
    if (accessToken) {
      fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
        .then(response => response.json())
        .then(data => {
          setUsername(data.display_name);
          setUserEmail(data.email);
          setUserImage(data.images[0].url);
        })
    }
  }, [accessToken])

  const [drawCount, setDrawCount] = useState(0);
  const fgRef = useRef();

  useEffect(() => {
    // console.log('fgRef was changed. Running useEffect');
    // console.log(fgRef)
    // if (fgRef.current) {
      // fgRef.current.d3Force('center').strength(-1);
      // const f = d3.forceCenter(0, 0);
      // f.strength = -10;
      // console.log(f);
      // console.log(f.strength)
      // console.log(fgRef.current.d3Force('charge'))
      // fgRef.current.d3Force('center', () => {return -10})
      // fgRef.current.d3Force('charge', d3.forceManyBody(10))
    // }
  }, [])

  const hanldeClick = () => {
    getPlaylist('https://open.spotify.com/playlist/5QzeLb74u9IyKdVCn9qVeI?si=06b42bd054724d14');
  }

  return (
    <div>
      <URLEntry submitFunc={getPlaylist}/>
      <button onClick={hanldeClick}>OK MUSIC SENIOR</button>
      {/* {tracks.nodes.length === 0 ? null */}
      {(0 == 1) ? null
        :
        <ForceGraph2D
          graphData={tracks}
          ref={fgRef}
          backgroundColor="#000000"
          linkColor={() => "#ffffff"}
          // d3AlphaDecay={0.16}
          d3VelocityDecay={0.15}
          width={800}
          height={600}
          nodeLabel="id"
          nodeVal={4*100*0.6}
          enableNodeDrag={false}
          onNodeClick={(node, event) => {
            console.log(`fgRef.current:`);
            console.log(fgRef.current);
            console.log(`Clicked on node: ${node.trackURL}`);
            window.open(node.trackURL, '_blank');
            return;
          }}
          cooldownTime={500}
          onEngineStop={() => {
            console.log(`ZOOMING TO FIT!`);
            fgRef.current.zoomToFit(400);
          }}
          nodeCanvasObject={(node, ctx) => {
            const SIZE = 100;
            const {imageObj, x, y} = node;
            ctx.drawImage(imageObj, x-(SIZE/2), y-(SIZE/2), SIZE, SIZE);

            setDrawCount(drawCount + 1);
          }}
        />
      }

      <h1>My Playlists</h1>
      {playlists.map(playlist => {
        return <PList plist={playlist} key={playlist.id} submitFunc={getPlaylist}/>
      })}
      
      <p>Access Token: {token}</p>
      <p>Username: {username}</p>
      <p>email: {userEmail}</p>
      <img src={userImage} alt="failed to load" />
    </div>
  );
};

export default App;
