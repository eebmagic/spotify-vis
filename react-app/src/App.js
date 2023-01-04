import React, { useState } from 'react';
import { useEffect } from 'react';
import URLEntry from './Entry.js';
import PList from './PList';
import { ForceGraph2D } from 'react-force-graph';
// import * as THREE from 'three';
// import { CSS2DRenderer, CSS2DObject } from 'https://unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js';

const App = () => {
  const [token, setToken] = useState("");

  const [playlists, setPlaylists] = useState([]);
  // const [tracks, setTracks] = useState({nodes: [], links: []}])
  // const [tracks, setTracks] = useState({ nodes: [{ id: 0 }], links: [] });
  const starter = {
    nodes: [
      // {
      //   id: 0,
      //   image: {
      //     url: 'https://i.scdn.co/image/ab67616d0000b2732dfd5afd0e8ccb5da62401aa'
      //   }
      // }
    ],
    links: []
  }
  const [tracks, setTracks] = useState(starter);

  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userImage, setUserImage] = useState("");

  // Run this effect when the component mounts to initiate the Spotify authentication flow
  useEffect(() => {
    var tokenAttempt = window.location.hash.split('&')[0].split('=')[1];
    var onlyOne = window.location.hash.split('&').length === 1;

    // if (token === "" || (onlyOne && window.location.hash.split('&')[0] === "")) {
    if (onlyOne && window.location.hash.split('&')[0] === "") {
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
          // console.log(`Got ${data.items.length} total playlists`);
          // console.log(data);
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
          // console.log(data);
          setUsername(data.display_name);
          setUserEmail(data.email);
          setUserImage(data.images[0].url);
        })
    }
  }, [accessToken])

  useEffect(() => {
    console.log('TRACKS WAS UPDATED:');
    console.log(tracks);
  }, [tracks])

  const data = {
    "nodes": [
      { "id": "Harry", 'img': 'https://i.scdn.co/image/ab67616d0000b2732dfd5afd0e8ccb5da62401aa' },
      { "id": "Robert", 'img': 'https://i.scdn.co/image/ab67616d0000b2732bd52aa20a76c033e5958d9d'},
      // { "id": "Amy", 'x':0, 'y':0, 'img': 'https://i.scdn.co/image/ab67616d0000b2737b588de239b795902cd5039e'},
      { "id": "Amy", 'img': 'https://i.scdn.co/image/ab67616d0000b2737b588de239b795902cd5039e'},
      { "id": "Adam", 'img': 'https://i.scdn.co/image/ab67616d0000b2736b858105608314d9f585efc9'},
      { "id": "Mark", 'img': 'https://i.scdn.co/image/ab67616d0000b273206af87754f336dd8ad92259'},
      // { "id": "Joe" },
      // { "id": "Alice" },
      // { "id": "Ethan" },
    ],
    "links": [
      { "source": "Harry", "target": "Robert" },
    ]
  };

  const getColor = n => '#' + ((n * 1234567) % Math.pow(2, 24)).toString(16).padStart(6, '0');
  // const getColor = (n) => '#'+(Math.random(n) * 0xFFFFFF << 0).toString(16).padStart(6, '0');
  const genRandomTree = (N = 300) => {
    return {
      nodes: [...Array(N).keys()].map(i => ({ id: i })),
        links: [...Array(N).keys()]
      .filter(id => id)
      .map(id => ({
        source: id,
        target: Math.round(Math.random() * (id-1))
      }))
    };
  }

  return (
    <div>
      <URLEntry username={username} email={userEmail} setTracks={setTracks}/>
      <h1>My Playlists</h1>

      {playlists.map(playlist => (
        <PList plist={playlist} key={playlist.id}/>
      ))}
      
      <p>Access Token: {token}</p>
      <p>Username: {username}</p>
      <p>email: {userEmail}</p>
      <img src={userImage} alt="failed to load" />
      <ForceGraph2D
        graphData={tracks}
        backgroundColor="#000000"
        linkColor={() => "#ffffff"}
        d3AlphaDecay={0.06}
        d3VelocityDecay={0.8}
        width={800}
        height={600}
        nodeLabel="id"
        nodeCanvasObject={(node, ctx) => {

          const SIZE = 100;
          ctx.drawImage(node.imageObj, node.x, node.y, SIZE, SIZE);

          // ALT drawing method
          // https://github.com/vukk/visweb-react/blob/ea0b1a5a03b23eaa77c7999545e993c1dcb1efbb/src/modules/visualize/network/Visualize.js
          // const {id, x, y} = node;
          // ctx.fillStyle = getColor(id.length);
          // [
          //   () => { ctx.fillRect(x - 6, y - 4, 12, 8); }, // rectangle
          //   () => { ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x - 5, y + 5); ctx.lineTo(x + 5, y + 5); ctx.fill(); }, // triangle
          //   () => { ctx.beginPath(); ctx.arc(x, y, 5, 0, 2 * Math.PI, false); ctx.fill(); }, // circle
          //   () => { ctx.font = '10px Sans-Serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(id, x, y); } // text
          // ][id.length%4]();

        }}
        // nodeCanvasObjectMode={() => "replace"}
      />
    </div>
  );
};

export default App;
