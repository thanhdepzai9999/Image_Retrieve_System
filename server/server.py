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



app = Flask(__name__,template_folder= ".")
app.config["CORS_HEADER"] = 'Content-Type'
CORS(app,support_credentials=True)

@app.route('/queryimage', methods = ['POST'])
@cross_origin(support_credentials=True)
def example():
    try:
        string = request.json
        image = string['image']["requestImage"]
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
        
        queryimage=rerank(picture_feature,queryimage)

        return jsonify(queryimage),200
    except Exception as e:
        print(e)
        return 404
    
def rerank(picture_feature,queryimage):
    dist = []
    for img in queryimage:
        dist.append(np.sum(np.absolute(picture_feature - np.array(img['hist']))))
    for i in range(len(queryimage)):
        queryimage[i]["dist"]=dist[i]

    for i in range(len(queryimage)):
        min_id = i
        for j in range(i+1,len(queryimage)):
            if queryimage[j]["dist"] < queryimage[min_id]["dist"]:
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