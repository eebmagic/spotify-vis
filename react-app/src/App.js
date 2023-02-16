import { useEffect, useState, useRef } from 'react';
import URLEntry from './Entry';
import PList from './PList';
import LoadingOverlay from './LoadingOverlay';
import PopupWindow from './PopupWindow';
import { ForceGraph2D } from 'react-force-graph';
import CONFIG from './config.json';
import './styles.css';

const App = () => {
  const [token, setToken] = useState("");

  const [playlists, setPlaylists] = useState([]);
  const [currlist, setCurrlist] = useState("");
  const [tracks, setTracks] = useState({nodes: [], links: []});
  const [waiting, setWaiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");

  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userImage, setUserImage] = useState("");

  // Func for making call to python server and updated tracks
  const getPlaylist = (url) => {
    setIsLoading(true);
    setShowPopup(false);
    if (!waiting) {
      console.log(` Sending: ${url}`);
      // setWaiting(true);
      const requestURL = `${CONFIG.serverOnHTTPS ? "https" : "http"}://${CONFIG.pyServerAddress}:${CONFIG.pyServerPort}?url=${encodeURIComponent(url)}&email=${encodeURIComponent(userEmail)}&username=${encodeURIComponent(username)}`;
      console.log(`Making request at URL: ${requestURL}}`);
      fetch(requestURL)
        .then(response => {
          console.log(`Got response:`);
          console.log(response);
          setWaiting(false);
          if (response.ok) {
            return response.json();
          } else {
            console.log(`Bad response from server: ${response.status} ${response.statusText}`)
            setWaiting(false);
            setIsLoading(false);
            setShowPopup(true);
            setPopupText(response.statusText);
          }
        })
        .then(result => {
          var {data, name} = result;
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

          setCurrlist({name: name, url: url});
          setTracks(gdata);
          setWaiting(false);
          setIsLoading(false);
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
      const redirectUri = CONFIG.redirectURI;
      // console.log(CONFIG);
      // console.log(CONFIG.redirectURI);
      console.log(`Redirect URI: ${redirectUri}`);
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
      var items = [];
      var offset = 0;
      const pagesize = 50;


      var url = `https://api.spotify.com/v1/me/playlists?limit=${pagesize}&offset=${offset}`;
      console.log(`Working with url: ${url}`);
      fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
        .then(response => response.json())
        .then(data => {
          items = items.concat(data.items);
          const LIMIT = data.total;

          offset += pagesize;
          while (offset < LIMIT) {
            var url = `https://api.spotify.com/v1/me/playlists?limit=${pagesize}&offset=${offset}`;
            offset += pagesize;
            fetch(url, {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            })
              .then(response => response.json())
              // eslint-disable-next-line
              .then(data => {
                items = items.concat(data.items)
                if (items.length === LIMIT) {
                  setPlaylists(items);
                }
              });
          }
        })
        .catch(error => {
          console.log(error);
        });

      console.log(`After loop got ${items.length} items`);
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

  // useEffect(() => {
  //   console.log(`isLoading changed to ${isLoading}`);
  //   console.log(`showPopup changed to ${showPopup}`);
  // }, [isLoading, showPopup])

  const hanldeClick = () => {
    getPlaylist('https://open.spotify.com/playlist/5QzeLb74u9IyKdVCn9qVeI?si=06b42bd054724d14');
  }

  return (
    <div>
      <LoadingOverlay isLoading={isLoading}>
        {showPopup && (
          <PopupWindow
            title="Playlist Too Long"
            subtext={popupText}
            onClose={() => setShowPopup(false)}
          />
        )}
        <URLEntry submitFunc={getPlaylist}/>
        <button onClick={hanldeClick}>OK MUSIC SENIOR</button>
        {(false) ? null
          :
          <ForceGraph2D
            graphData={tracks}
            ref={fgRef}
            backgroundColor="#1a1a1a"
            linkColor={() => "#ffffff"}
            // d3AlphaDecay={0.16}
            d3VelocityDecay={0.20}
            width={1400}
            height={1000}
            nodeLabel="id"
            nodeVal={4*100*0.6}
            enableNodeDrag={false}
            onNodeRightClick={(node, event) => {
              console.log(`fgRef.current:`);
              console.log(fgRef.current);
              console.log(`Clicked on node: ${node.trackURL}`);
              window.open(node.trackURL, '_blank');
            }}
            cooldownTime={800}
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

        <div class="current-playlist">
          <p>Current Playlist: <a href={currlist.url} target="_blank" rel="noopener noreferrer">{currlist.name}</a></p>
        </div>

        <h1 class="plalist-list-header">My Playlists</h1>
        {/* <h1 style="align: center">My Playlists</h1> */}
        <div class="playlist-container">
          {playlists.map(playlist => {
            // console.log(`${playlist.id}`);
            // console.log(playlist);
            if (playlist.images.length > 0) {
              return <PList plist={playlist} key={playlist.id} submitFunc={getPlaylist}/>
            } else {
              return null;
            }
          })}
        </div>

        <div className="userinfo">
          <p>Access Token: {token}</p>
          <p>Username: {username}</p>
          <p>email: {userEmail}</p>
          <img src={userImage} alt="failed to load" />
        </div>
      </LoadingOverlay>
    </div>
  );
};

export default App;
