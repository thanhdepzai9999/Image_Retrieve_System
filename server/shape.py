from __future__ import print_function

from skimage.feature import daisy
from skimage import color

from six.moves import cPickle
import numpy as np
import scipy.misc
import math
import imageio

import os


n_slice    = 2
n_orient   = 8
step       = 10
radius     = 30
rings      = 2
histograms = 6
h_type     = 'region'
d_type     = 'd1'

depth      = 3

R = (rings * histograms + 1) * n_orient


# cache dir
cache_dir = 'cache'
if not os.path.exists(cache_dir):
  os.makedirs(cache_dir)


class Daisy(object):

  def histogram(self, input, type=h_type, n_slice=n_slice, normalize=True):
    ''' count img histogram
  
      arguments
        input    : a path to a image or a numpy.ndarray
        type     : 'global' means count the histogram for whole image
                   'region' means count the histogram for regions in images, then concatanate all of them
        n_slice  : work when type equals to 'region', height & width will equally sliced into N slices
        normalize: normalize output histogram
  
      return
        type == 'global'
          a numpy array with size R
        type == 'region'
          a numpy array with size n_slice * n_slice * R
  
        #R = (rings * histograms + 1) * n_orient#
    '''
    if isinstance(input, np.ndarray):  # examinate input type
      img = input.copy()
    else:
      img = imageio.imread(input,pilmode='RGB')
    height, width, channel = img.shape
  
    P = math.ceil((height - radius*2) / step) 
    Q = math.ceil((width - radius*2) / step)
    assert P > 0 and Q > 0, "input image size need to pass this check"
  
    if type == 'global':
      hist = self._daisy(img)
  
    elif type == 'region':
      hist = np.zeros((n_slice, n_slice, R))
      h_silce = np.around(np.linspace(0, height, n_slice+1, endpoint=True)).astype(int)
      w_slice = np.around(np.linspace(0, width, n_slice+1, endpoint=True)).astype(int)
  
      for hs in range(len(h_silce)-1):
        for ws in range(len(w_slice)-1):
          img_r = img[h_silce[hs]:h_silce[hs+1], w_slice[ws]:w_slice[ws+1]]  # slice img to regions
          hist[hs][ws] = self._daisy(img_r)
  
    if normalize:
      hist /= np.sum(hist)
  
    return hist.flatten()
  
  
  def _daisy(self, img, normalize=True):
    image = color.rgb2gray(img)
    descs = daisy(image, step=step, radius=radius, rings=rings, histograms=histograms, orientations=n_orient)
    descs = descs.reshape(-1, R)  # shape=(N, R)
    hist  = np.mean(descs, axis=0)  # shape=(R,)
  
    if normalize:
      hist = np.array(hist) / np.sum(hist)
  
    return hist