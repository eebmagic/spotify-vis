import networkx as nx
import pickle
from BuildCollage import ImageObj
from ImageDownloader import getImageAndCoords
from utils import polarToCartesian
from tqdm import tqdm
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image


def getStartsAndImages(trackobjs):
    realImages = {}
    pos = {}
    for track in trackobjs:
        title = track['title']
        img, polar = getImageAndCoords(track['image']['url'])
        cart = polarToCartesian(*polar)
        pos[title] = cart
        realImages[title] = img

    return pos, realImages

def drawCanvas(trackobjs, SIZE=(640*30)//4, POS_SCALE_FACTOR=1, verbose=False):
    # Define Constants
    DRAW_DIAGRAM = False
    WHITE = (255, 255, 255)

    print(f'Pulling images...')
    ogpos, realImages = getStartsAndImages(trackobjs)
    print(f'Finished getting images')

    # Add nodes from titles
    G = nx.Graph()
    for title in ogpos.keys():
        G.add_node(title)

    # Add full weighted edges
    weights = []
    dists = []
    for n in G:
        for m in G:
            if n != m:
                a = np.array(ogpos[n])
                b = np.array(ogpos[m])
                d = np.linalg.norm(a - b)

                # WSCALE = 1/10_000
                # w = (np.sqrt(2)-d) * WSCALE
                w = ((1/max(d*SIZE, 1)) * 10)

                G.add_edge(n, m, weight=w)
                dists.append(d)
                weights.append(w)

    if verbose:
        print(f" weights range: {min(weights)}, {max(weights)}")
        print(f"average weight: {sum(weights) / len(weights)}")
        print(f"   dists range: {min(dists)}, {max(dists)}")
        print(f"  average dist: {sum(dists) / len(dists)}\n")

    # Infer some params for fruchterman_reingold_layout 
    arr = np.array(list(ogpos.values()))
    Xrange = arr[:, 0].max() - arr[:, 0].min()
    Yrange = arr[:, 1].max() - arr[:, 1].min()
    Scale = max(Xrange, Yrange)
    K = (1 / np.sqrt(len(arr))) * SIZE

    if verbose:
        print(f"Mean point: {arr.mean(axis=0)}")
        print(f"Stddev: {arr.std()}")
        print(f"X range: {arr[:, 0].min()} to {arr[:, 0].max()} ({Xrange})")
        print(f"Y range: {arr[:, 1].min()} to {arr[:, 1].max()} ({Yrange})")
        print(f"Scale: {Scale}")
        # print(f"K: {K}")
        print()

    # Tweak points location
    pos = nx.fruchterman_reingold_layout(
        G,
        pos=ogpos,
        k=K,
        iterations=40,
        weight='weight',
        scale=(SIZE//2) * 0.8,
        center=(SIZE//2, SIZE//2)
    )

    if verbose:
        print(f"Scale: {(SIZE//2) * 0.8}")
        print(f"K: {K*2}")
        print(f"Canvas Size: {(SIZE, SIZE)}\n")

    fruchtArr = np.array(list(pos.values()))
    if verbose:
        print(f"Mean Fruchterman point: {fruchtArr.mean(axis=0)}")
        print(f"    Fruchterman stddev: {fruchtArr.std()}")
        print(f"               X range: {fruchtArr[:, 0].min()} to {fruchtArr[:, 0].max()} ({Xrange})")
        print(f"               Y range: {fruchtArr[:, 1].min()} to {fruchtArr[:, 1].max()} ({Yrange})")

    # Draw with weights
    if DRAW_DIAGRAM:
        import matplotlib.pyplot as plt
        plt.hist([d for d in dists])
        plt.title('dists')
        plt.show()
        plt.hist([w for w in weights])
        plt.title('weights')
        plt.show()

        nx.draw_networkx_labels(G, pos=ogpos)
        nx.draw(G, pos=ogpos)
        plt.show()
        nx.draw_networkx_labels(G, pos=pos)
        nx.draw(G, pos=pos)
        plt.show()
        quit()


    # Build and display canvas image
    masterImg = Image.new("RGB", (SIZE, SIZE), WHITE)
    for track in trackobjs:
        title = track['title']
        w, h = track['image']['width'], track['image']['height']
        img = realImages[title]
        img = img.resize((w//4, h//4))

        # x, y = pos[title]
        x, y = ogpos[title]
        x = (x * SIZE) + (SIZE//2)
        y = (y * SIZE) + (SIZE//2)
        scaledP = (int(x//POS_SCALE_FACTOR), int(y//POS_SCALE_FACTOR))
        masterImg.paste(img, scaledP)

    return masterImg

if __name__ == '__main__':
    from BuildCollage import loadData

    url = 'https://open.spotify.com/playlist/5QzeLb74u9IyKdVCn9qVeI?si=3ac97348f87f4a17'
    data = loadData(url, limit=100)

    canvas = drawCanvas(data, verbose=True)
    print(canvas)
    canvas.show()