from resnet_feature.residualnet import ResidualNet
import pandas as pd
import torch
import numpy as np

# configs for histogram
RES_model  = 'resnet152'  # model type
pick_layer = 'avg'        # extract feature of this layer
d_type     = 'd1'         # distance type

use_gpu = torch.cuda.is_available()
means = np.array([103.939, 116.779, 123.68]) / 255.


class Resnet_feature:
    def __init__(self):
        self.res_model = ResidualNet(model=RES_model)
        self.cluster_centers = pd.read_csv("./resnet_feature/cluster_centers.csv",header=None).T


    def extract_feature(self,d_img):
        self.res_model.eval()
        with torch.no_grad():
            if use_gpu:
                self.res_model = self.res_model.cuda()
            img = d_img
            img = img[:, :, ::-1]  # switch to BGR
            img = np.transpose(img, (2, 0, 1)) / 255.
            img[0] -= means[0]  # reduce B's mean
            img[1] -= means[1]  # reduce G's mean
            img[2] -= means[2]  # reduce R's mean
            img = np.expand_dims(img, axis=0)
            if use_gpu:
                inputs = torch.autograd.Variable(torch.from_numpy(img).cuda().float())
            else:
                inputs = torch.autograd.Variable(torch.from_numpy(img).float())
            d_hist = self.res_model(inputs)[pick_layer]
            d_hist = d_hist.data.cpu().numpy().flatten()
            d_hist /= np.sum(d_hist)  # normalize
            return d_hist
    
    def distance(self,v1, v2, d_type='d1'):
        assert v1.shape == v2.shape, "shape of two vectors need to be same!"

        if d_type == 'd1':
            return np.sum(np.absolute(v1 - v2))
        elif d_type == 'd2':
            return np.sum((v1 - v2) ** 2)
        elif d_type == 'd2-norm':
            return 2 - 2 * np.dot(v1, v2)
        elif d_type == 'd3':
            pass
        elif d_type == 'd4':
            pass
        elif d_type == 'd5':
            pass
        elif d_type == 'd6':
            pass
        elif d_type == 'd7':
            return 2 - 2 * np.dot(v1, v2)
        elif d_type == 'd8':
            return 2 - 2 * np.dot(v1, v2)
        elif d_type == 'cosine':
            return spatial.distance.cosine(v1, v2)
        elif d_type == 'square':
            return np.sum((v1 - v2) ** 2)

    def encode_feature(self,d_hist):
        encode = ""
        for i in range(128):
            feature_segment = d_hist[i*16:(i+1)*16]
            d = 100000
            clust = 0
            for j in range(len(self.cluster_centers[i])):
                v = np.fromstring(self.cluster_centers[i][j].replace("\n","")[1:-2], dtype=np.float32, sep=' ')
                dist = self.distance(feature_segment,v,"d1")
                if d>dist:
                    clust = j
                    d = dist
            encode = encode + str(j) + " "
        return encode[:-2]
    def extract(self,d_img):
        d_hist = self.extract_feature(d_img)
        encode = self.encode_feature(d_hist)
        return d_hist,encode
