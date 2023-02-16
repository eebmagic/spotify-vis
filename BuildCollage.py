from utils import getid

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import pickle
import json
import os
import logging

with open('./react-app/src/config.json') as file:
    CONFIG = json.load(file)

def loadData(url, limit=None):
    '''
    Builds all init data from the spotify playlist url.
    '''
    client_credentials_manager = SpotifyClientCredentials()
    sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

    if CONFIG['useDataCache']:
        # WITH Cache
        if os.path.exists('dataCache.pickle'):
            with open('dataCache.pickle', 'rb') as f:
                dataCache = pickle.load(f)
        else:
            dataCache = {}

        plistID = getid(url)
        if plistID in dataCache:
            print(f'Found in cache: {url}')
            apiResult = dataCache[plistID]
        else:
            print(f'Loading from spotify...')
            apiResult = sp.playlist(plistID)
            print(f'Finished API call')

            dataCache[plistID] = apiResult
            with open('dataCache.pickle', 'wb') as f:
                pickle.dump(dataCache, f)
    else:
        # WITHOUT Cache
        plistID = getid(url)
        apiResult = sp.playlist(plistID)
        totalNumTracks = apiResult['tracks']['total']

    ########################

    # TODO: Update this later to iterate until no more 'next' attribute
    def processResult(result, trackObjs=[], trackedAlbums=set()):
        if 'tracks' in result:
            items = result['tracks']['items']
        else:
            items = result['items']

        for i, item in enumerate(items):
            track = item['track']

            title = track['name']
            artists = [art['name'] for art in track['artists']]
            trackURL = track['external_urls']['spotify']

            images = track['album']['images']
            if not images:
                logging.warning(f'Skipping track: "{title}" because no images found')
                continue
            bestImage = max(images, key=lambda im: im['height']*im['width'])

            albumID = track['album']['id']
            if albumID not in trackedAlbums:
                obj = {
                    'title': title,
                    'artists': artists,
                    'image': bestImage,
                    'trackURL': trackURL
                }

                trackObjs.append(obj)
                trackedAlbums.add(albumID)

                if limit and i >= limit:
                    break

        nextResult = None
        if ('tracks' in result) and (result['tracks']['next']):
            nextResult = sp.next(result['tracks'])
        elif ('items' in result) and (result['next']):
            nextResult = sp.next(result)

        if nextResult != None:
            trackObjs, _ = processResult(nextResult, trackObjs=trackObjs, trackedAlbums=trackedAlbums)

        playlistName = result['name'] if 'name' in result else None
        return trackObjs, playlistName

    trackObjs, playlistName = processResult(apiResult)

    return trackObjs, playlistName, totalNumTracks


if __name__ == "__main__":
    # Slow playlist
    # url = 'https://open.spotify.com/playlist/7BfbPGFO908gMjvqqUqLBm?si=7e696427e49d44d7'
    # Ok music senior year playlist
    # url = 'https://open.spotify.com/playlist/5QzeLb74u9IyKdVCn9qVeI?si=3ac97348f87f4a17'
    # Ok music junior year 
    url = 'https://open.spotify.com/playlist/4BnmmXEw9RQk0lsYBdNqMa'

    data, name, totalNumTracks = loadData(url)
    print(type(data), type(name), type(totalNumTracks))
    print(f'Num tracks: {totalNumTracks}')
    print(f'Num albums: {len(data)}')
    print(name)
