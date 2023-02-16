from BuildCollage import loadData
from DrawCanvas import getStartsAndImages

import asyncio

from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import time
import json
import logging
import ssl


with open('./react-app/src/config.json') as file:
    CONFIG = json.load(file)
    print(f'Loaded config: {json.dumps(CONFIG, indent=2)}')

logLevel = {
    'DEBUG': logging.DEBUG,
    'INFO': logging.INFO,
    'WARNING': logging.WARNING,
    'ERROR': logging.ERROR
}[CONFIG['logLevel'].upper()]

logging.basicConfig(format='%(asctime)s | %(levelname)s | %(message)s', filename='logfiles/server.log', encoding='utf-8', level=logLevel)

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Load params
            query_string = urlparse(self.path).query
            query_params = parse_qs(query_string)
            url= query_params.get('url', [''])[0]
            email = query_params.get('email', [''])[0]
            username = query_params.get('username', [''])[0]

            logging.info(f'     username: {username}')
            logging.info(f'        email: {email}')
            logging.info(f'          url: {url}')

            start = time.time()

            # Process url
            data, playlistName, totalNumTracks = loadData(url)
            logging.info(f' playlistName: {playlistName}')
            logging.info(f'num of tracks: {totalNumTracks}')
            logging.info(f'num of albums: {len(data)}')

            # Check number of albums
            # If too many albums then throw some error (lookup best response number)
            if len(data) > CONFIG['maxAlbums']:
                print(f'STOPPING: because playlist exceeded max albums {len(data)} (Max of {CONFIG["maxAlbums"]})')
                logging.warning(f'STOPPING CALL: because playlist exceeded max albums {len(data)} (Max of {CONFIG["maxAlbums"]})')
                self.send_response(400, f"Too many albums in playlist. Max is {CONFIG['maxAlbums']}, your playlist has {len(data)}")
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                return

            # Generate data
            logging.debug(f'Getting image positions...')
            pos, _ = asyncio.run(getStartsAndImages(data))

            # Convert to web format
            finalData = []
            for item in data:
                p = pos[item['title']]
                item['startx'] = p[0]
                item['starty'] = p[1]
                item['id'] = item['title']

                finalData.append(item)

            payload = {'data': finalData, 'name': playlistName}

            logging.info(f'Finished in {time.time()-start} seconds\n')

            # Return positions dict
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            self.wfile.write(json.dumps(payload).encode())
        except Exception as e:
            logging.error(f'Encountered error: {str(e)}')
            print(f'Encountered error: {str(e)}')
            self.send_error(500, f"Encountered error: {str(e)}")
            raise e
            # self.send_header('Content-type', 'application/json')
            # self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
            # self.end_headers()



httpd = HTTPServer((CONFIG['pyServerAddress'], CONFIG['pyServerPort']), RequestHandler)
if CONFIG['serverOnHTTPS']:
    KEY_PATH =  "/etc/letsencrypt/live/spotifyvisapi.click/privkey.pem"
    CERT_PATH = "/etc/letsencrypt/live/spotifyvisapi.click/fullchain.pem"
    httpd.socket = ssl.wrap_socket(
        httpd.socket,
        keyfile=KEY_PATH,
        certfile=CERT_PATH,
        server_side=True
    )

print(f'Server started at \"{"https" if CONFIG["serverOnHTTPS"] else "http"}://{CONFIG["pyServerAddress"]}:{CONFIG["pyServerPort"]}\" ...')
logging.info(f'Server started at \"{"https" if CONFIG["serverOnHTTPS"] else "http"}://{CONFIG["pyServerAddress"]}:{CONFIG["pyServerPort"]}\" ...\n')
httpd.serve_forever()
