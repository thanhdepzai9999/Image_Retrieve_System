from flask import Flask, redirect
from flask import request, Response
from flask import render_template
from flask_cors import CORS, cross_origin
from flask import jsonify



app = Flask(__name__,template_folder= ".")
app.config["CORS_HEADER"] = 'Content-Type'
CORS(app,support_credentials=True)

@app.route('/queryimage', methods = ['POST'])
@cross_origin(support_credentials=True)
def example():
    print("hihi")
    try:
        string = request.json
        image = string['image']

        return "hihi",200
    except:
        return 404

@app.route('/')
def index():
    return "<div> hello <div>"

if __name__ == '__main__':
    # app.secret_key = 'super secret key'
    app.run(host='0.0.0.0',port=9000,debug=True)