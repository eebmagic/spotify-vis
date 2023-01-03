import numpy as np

def getid(url):
    comps = url.split('/')
    for comp in comps[::-1]:
        if comp:
            return comp.split('?')[0]


def polarToCartesian(angle, depth, scale=1):
    # Convert angle from degrees to radians
    angle = angle * np.pi / 180
    x = depth * scale * np.cos(angle)
    y = depth * scale * np.sin(angle)

    return x, y
