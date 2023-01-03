import React, { useState } from 'react';
import { useEffect } from 'react';
import URLEntry from './Entry.js';

const App = () => {
  const [token, setToken] = useState("");

  const [playlists, setPlaylists] = useState([]);

  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userImage, setUserImage] = useState("");

  // Run this effect when the component mounts to initiate the Spotify authentication flow
  useEffect(() => {
    var tokenAttempt = window.location.hash.split('&')[0].split('=')[1];
    var onlyOne = window.location.hash.split('&').length === 1;

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

  // Use the access token to fetch the user's playlists
  useEffect(() => {
    if (accessToken) {
      fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
        .then(response => response.json())
        .then(data => {
          // console.log(`Got ${data.items.length} total items:`);
          // console.log(data.items);
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
          console.log(data);
          setUsername(data.display_name);
          setUserEmail(data.email);
          setUserImage(data.images[0].url);
        })
    }
  }, [accessToken])

  return (
    <div>
      <URLEntry username={username} email={userEmail}/>
      <h1>My Playlists</h1>

      {playlists.map(playlist => (
        <div key={playlist.id}>{playlist.name}</div>
      ))}
      
      <p>Access Token: {token}</p>
      <p>Username: {username}</p>
      <p>email: {userEmail}</p>
      <img src={userImage} alt="failed to load" />
    </div>
  );
};

export default App;
