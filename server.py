from BuildCollage import loadData
from DrawCanvas import getStartsAndImages
import time

# server.py
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json

with open('./react-app/src/config.json') as file:
    CONFIG = json.load(file)
    print(f'Loaded config: {json.dumps(CONFIG, indent=2)}')

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Load params
            query_string = urlparse(self.path).query
            query_params = parse_qs(query_string)
            url= query_params.get('url', [''])[0]
            email = query_params.get('email', [''])[0]
            username = query_params.get('username', [''])[0]

            print(json.dumps(query_params, indent=2))
            print(f'url: {url}')
            print(f'   email: {email}')
            print(f'username: {username}')

            start = time.time()

            # Process url
            data, playlistName = loadData(url)
            print(f'Loaded {len(data)} tracks')

            # Generate data
            pos, _ = getStartsAndImages(data)

            # Convert to web format
            finalData = []
            for item in data:
                p = pos[item['title']]
                item['startx'] = p[0]
                item['starty'] = p[1]
                item['id'] = item['title']

                finalData.append(item)

            payload = {'data': finalData, 'name': playlistName}

            print(f'Finished in {time.time()-start} seconds')

            # Return positions dict
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
            self.end_headers()
            # self.wfile.write(json.dumps(finalData).encode())
            self.wfile.write(json.dumps(payload).encode())
        except Exception as e:
            print(f'Encountered error: {str(e)}')
            print(e)
            self.send_error(500, f"Encountered error: {str(e)}")
            # self.send_header('Content-type', 'application/json')
            # self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
            # self.end_headers()

httpd = HTTPServer(('localhost', CONFIG['pyServerPort']), RequestHandler)
print(f'Server started...')
httpd.serve_forever()
