import requests
from PIL import Image
import numpy as np
from io import BytesIO
import colorsys
import pickle
import os


if os.path.exists('imageCache.pickle'):
    with open('imageCache.pickle', 'rb') as f:
        IMAGE_CACHE = pickle.load(f)
else:
    IMAGE_CACHE = {}

def RGBtoHSV(vec):
    return colorsys.rgb_to_hsv(vec[0]/255, vec[1]/255, vec[2]/255)

def downloadImage(url):
    if url in IMAGE_CACHE:
        arr, img = IMAGE_CACHE[url]
        return arr, img
    else:
        res = requests.get(url, stream=True)
        img = Image.open(BytesIO(res.content))
        imgArr = np.array(img)

        IMAGE_CACHE[url] = (imgArr, img)
        with open('imageCache.pickle', 'wb') as f:
            pickle.dump(IMAGE_CACHE, f)
        print(f'SAVED img in cache: {url}')

        return imgArr, img

def imgToCoords(img):
    '''
    Builds a polar coordinate point from the average color of an image.
    NOTE: This could easily be changed to use the primary (rather than avg) color.
    '''
    avgColor = np.round(np.mean(img, axis=(1, 0)))
    newcolor = RGBtoHSV(avgColor)

    angle = newcolor[0]*360
    depth = newcolor[1]*newcolor[2]

    return angle, depth

def getImageAndCoords(url):
    imageArr, image = downloadImage(url)
    angle, depth = imgToCoords(imageArr)

    return image, (angle, depth)


if __name__ == '__main__':
    url = 'https://i.scdn.co/image/ab67616d0000b2736ca699e2722b51b1e4ae6091'
    downloadImage(url)
