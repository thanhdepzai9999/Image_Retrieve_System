from resnet_feature.main import Resnet_feature
from flask import Flask, redirect
from flask import request, Response
from flask import render_template
from flask_cors import CORS, cross_origin
from flask import jsonify
import base64
from PIL import Image
from io import BytesIO
import numpy as np
import io
import imageio
from shape import Daisy
from color import Color

import pandas as pd
category_cloth = pd.read_csv("list_category_cloth.txt", sep="\s{2,}", header=None, names=["category_name", "category_type"],skiprows=2)
attribute_cloth = pd.read_csv("list_attr_cloth.txt", sep="\s{2,}", header=None, names=["attribute_name", "attribute_type"],skiprows=2)

# Import Elasticsearch package 
from elasticsearch import Elasticsearch 
# Connect to the elastic cluster
es=Elasticsearch(
    [{'host':'localhost','port':9200}],
    # sniff before doing anything
    sniff_on_start=True,
    # refresh nodes after a node fails to respond
    sniff_on_connection_fail=True,
    # and also every 60 seconds
    sniffer_timeout=90
)

res_feature = Resnet_feature()
daisy = Daisy()
color = Color()


app = Flask(__name__,template_folder= ".")
app.config["CORS_HEADER"] = 'Content-Type'
CORS(app,support_credentials=True)

@app.route('/queryimage', methods = ['POST'])
@cross_origin(support_credentials=True)
def example():
    try:
        string = request.json
        image = string['image']["requestImage"]
        use_color = string['color']
        use_shape = string['shape']
        im = decodeImg(image)
        print("trich xuat dac trung")
        picture_feature, encode = res_feature.extract(im)
        print("query")
        res= es.search(index='test-index',body={
        'query':{
            'match':{
                "encode":encode
                }
            }
        }, size = 25,request_timeout=60)
        print("ranking")
        queryimage = []
        for hit in res['hits']['hits']:
            queryimage.append(hit['_source'])
        
        queryimage=rerank(picture_feature,queryimage,use_color,use_shape)

        for img in queryimage:
            img["type"]=category_cloth[img["cls"]]
            attrib_cloth = ""
            for i in img["attrib"]:
                attrib_cloth+=attribute_cloth[i]
                attrib += " "
            img["attribute"]=attrib_cloth[:-2]

        return jsonify(queryimage),200
    except Exception as e:
        print(e)
        return 404
    
def rerank(im,picture_feature,queryimage,use_color,use_shape):
    dist = []
    for img in queryimage:
        dist.append(np.sum(np.absolute(picture_feature - np.array(img['hist']))))
    for i in range(len(queryimage)):
        queryimage[i]["dist"]=dist[i]
# extract shape
    if use_shape:
        query_shape_feat = daisy.histogram(im)
        for i in range(len(queryimage)):
            shape_feat = daisy.histogram("../front_end/public/"+queryimage[i]["img"])
            queryimage[i]["dist_shape"]=np.sum(np.absolute(query_shape_feat-shape_feat))
    else:
        for i in range(len(queryimage)):
            queryimage[i]["dist_shape"]=0
# extract color
    if use_color:
        query_color_feat = color.histogram(im)
        for i in range(len(queryimage)):
            color_feat = color.histogram("../front_end/public/"+queryimage[i]["img"])
            queryimage[i]["dist_color"]=np.sum(np.absolute(query_color_feat-color_feat))
    else:
        for i in range(len(queryimage)):
            queryimage[i]["dist_color"]=0

    for i in range(len(queryimage)):
        min_id = i
        for j in range(i+1,len(queryimage)):
            if (queryimage[j]["dist"]+queryimage[j]["dist_shape"]+queryimage[j]["dist_color"]) < (queryimage[min_id]["dist"] + queryimage[min_id]["dist_color"]):
                min_id = j
        if min_id != i:
            queryimage[i],queryimage[min_id]=queryimage[min_id],queryimage[i]
    return  queryimage

def decodeImg(stringBase64):
    str_base= stringBase64 
    a = str_base.find('base64')
    im = imageio.imread(BytesIO(base64.b64decode(str_base[a+len('base64')+1:])),pilmode='RGB')
    return im
@app.route('/')
def index():
    return "<div> hello <div>"

if __name__ == '__main__':

    # app.secret_key = 'super secret key'
    app.run(host='127.0.0.1',debug=True,port=8086)