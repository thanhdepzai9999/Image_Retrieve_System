import base64
from PIL import Image
from io import BytesIO

def decodeImg(stringBase64):
    str_base= stringBase64 
    a = str_base.find('base64')
    im = Image.open(BytesIO(base64.b64decode(str_base[a+len('base64')+1:])))
    return im





