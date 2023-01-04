import React, { useState } from 'react';
import { useEffect } from 'react';
import URLEntry from './Entry.js';
import PList from './PList';
import { ForceGraph2D } from 'react-force-graph';

const App = () => {
  const [token, setToken] = useState("");

  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState({nodes: [], links: []});

  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userImage, setUserImage] = useState("");

  // Func for making call to python server and updated tracks
  const getPlaylist = (url) => {
    console.log(` Sending: ${url}`);
    fetch(`http://localhost:8000?url=${encodeURIComponent(url)}&email=${encodeURIComponent(userEmail)}&username=${encodeURIComponent(username)}`)
      .then(response => response.json())
      .then(data => {
        // Build image objects ONCE
        data.forEach(node => {
          const image = document.createElement('img');
          image.src = node.image.url;
          node.imageObj = image;
        });

        console.log(`Response:`);
        console.log(data);

        var gdata = {
          nodes: data,
          links: []
        }

        setTracks(gdata);
      });
  }

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

  // Log when tracks get updated
  useEffect(() => {
    console.log('TRACKS WAS UPDATED:');
    console.log(tracks);
  }, [tracks])


  return (
    <div>
      <URLEntry submitFunc={getPlaylist}/>
      {tracks.nodes.length === 0 ? null
        :
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
