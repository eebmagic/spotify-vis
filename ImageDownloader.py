import requests
from PIL import Image
import numpy as np
from io import BytesIO
import colorsys
import pickle
import json
import os
import aiohttp
import asyncio
import time

with open('./react-app/src/config.json') as file:
    CONFIG = json.load(file)

semaphore = asyncio.Semaphore(2_000)

if CONFIG['useImageCache']:
    if os.path.exists('imageCache.pickle'):
        with open('imageCache.pickle', 'rb') as f:
            IMAGE_CACHE = pickle.load(f)
    else:
        IMAGE_CACHE = {}

def RGBtoHSV(vec):
    return colorsys.rgb_to_hsv(vec[0]/255, vec[1]/255, vec[2]/255)

async def downloadImage(url):
    if CONFIG['useImageCache'] and url in IMAGE_CACHE:
        print(f'Found in cache: {url}')
        arr, img = IMAGE_CACHE[url]
        return arr, img
    else:
        async with semaphore:
            async with aiohttp.ClientSession() as session:
            # async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(limit=2_000, verify_ssl=False), trust_env=True) as session:
                async with session.get(url) as response:
                    img_data = await response.read()
                    img = Image.open(BytesIO(img_data))
                    imgArr = np.array(img)

                    if CONFIG['useImageCache']:
                        IMAGE_CACHE[url] = (imgArr, img)
                        with open('imageCache.pickle', 'wb') as f:
                            pickle.dump(IMAGE_CACHE, f)
                        print(f'SAVED img in cache: {url}')

                    time.sleep(0.5)

                    return imgArr, img


def imgToCoords(img):
    '''
    Builds a polar coordinate point from the average color of an image.
    NOTE: This could easily be changed to use the primary (rather than avg) color.
    '''
    avgColor = np.round(np.mean(img, axis=(1, 0)))
    if len(img.shape) < 3:
        avgColor = np.array([avgColor, avgColor, avgColor])

    newcolor = RGBtoHSV(avgColor)

    angle = newcolor[0]*360
    depth = newcolor[1]*newcolor[2]

    return angle, depth

async def getImageAndCoords(url):
    imageArr, image = await downloadImage(url)
    angle, depth = imgToCoords(imageArr)

    return image, (angle, depth)


if __name__ == '__main__':
    url = 'https://i.scdn.co/image/ab67616d0000b2736ca699e2722b51b1e4ae6091'
    downloadImage(url)
