from spotipy.oauth2 import SpotifyClientCredentials
import spotipy
import pickle
import json
import os
from ImageDownloader import getImageAndCoords
from utils import getid

def loadData(url, limit=None):
    '''
    Builds all init data from the spotify playlist url.
    '''
    client_credentials_manager = SpotifyClientCredentials()
    sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

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

    # print(json.dumps(apiResult, indent=2))
    # quit()

    totalTracks = apiResult['tracks']['total']
    found = len(apiResult['tracks']['items'])
    print(f'Found {found} tracks out of {totalTracks} total tracks')

    trackObjs = []
    trackedAlbums = set()
    for i, item in enumerate(apiResult['tracks']['items']):
        track = item['track']
        title = track['name']
        artists = [art['name'] for art in track['artists']]
        images = track['album']['images']
        bestImage = max(images, key=lambda im: im['height']*im['width'])
        trackURL = track['external_urls']['spotify']
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
    

    return trackObjs


class ImageObj():
    def __init__(self, image, imageURL, position, title):
        self.image = image
        self.imageURL = imageURL
        self.position = position
        self.title = title


if __name__ == "__main__":
    # Slow playlist
    # url = 'https://open.spotify.com/playlist/7BfbPGFO908gMjvqqUqLBm?si=7e696427e49d44d7'
    # Ok music senior year playlist
    url = 'https://open.spotify.com/playlist/5QzeLb74u9IyKdVCn9qVeI?si=3ac97348f87f4a17'

    data = loadData(url)
    print(json.dumps(data, indent=2))
