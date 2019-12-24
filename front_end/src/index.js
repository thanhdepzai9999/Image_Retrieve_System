import React, { useState, useCallback } from 'react'
import ReactDOM from 'react-dom'
import Cropper from 'react-easy-crop'
import Slider from '@material-ui/lab/Slider'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import ImgDialog from './ImgDialog'
import getCroppedImg from './cropImage'
import { styles } from './styles'
import { HashLoader,BarLoader } from 'react-spinners';
// import { Upload, message, Icon, Modal , Input } from 'antd'
import 'antd/dist/antd.css'
import './style.css'
import { css } from '@emotion/core';
import axios from 'axios';
import ModalImage from './ModalImage'


const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
`;



// const clothesImg =
//   'https://img.huffingtonpost.com/asset/5ab4d4ac2000007d06eb2c56.jpeg?cache=sih0jwle4e&ops=1910_1000'

function TopBar() {
  return (
    <div>
      <nav class="navbar navbar-expand-lg navbar-dark bg-warning sticky-top justify-content-xl-between">
        <a class="navbar-brand text-warning" href="#">
          <img src="logo4.png" width="120" height="60" class="d-inline-block align-top" alt="" />
        </a>
        <a class="h6"></a>
      </nav>
    </div>
  )
}

function Footer() {
  return (
    <section id="footer" class="bg-info" style={{ padding: "30px" }}>
      <div class="container">
        <div class="row text-center text-xs-center text-sm-left text-md-left">
          <div class="col-xs-12 col-sm-4 col-md-4">
            <h5>Quick links</h5>
            <ul class="list-unstyled quick-links">
              <li><a><i class="fa fa-angle-double-right"></i>Home</a></li>
              <li><a><i class="fa fa-angle-double-right"></i>About</a></li>
              <li><a><i class="fa fa-angle-double-right"></i>FAQ</a></li>
              <li><a><i class="fa fa-angle-double-right"></i>Get Started</a></li>
              <li><a><i class="fa fa-angle-double-right"></i>Videos</a></li>
            </ul>
          </div>
          <div class="col-xs-12 col-sm-4 col-md-4">
            <h5>Quick links</h5>
            <ul class="list-unstyled quick-links">
              <li><a><i class="fa fa-angle-double-right"></i>Home</a></li>
              <li><a><i class="fa fa-angle-double-right"></i>About</a></li>
              <li><a><i class="fa fa-angle-double-right"></i>FAQ</a></li>
              <li><a><i class="fa fa-angle-double-right"></i>Get Started</a></li>
              <li><a><i class="fa fa-angle-double-right"></i>Videos</a></li>
            </ul>
          </div>
          <div class="col-xs-12 col-sm-4 col-md-4">
            <h5>Quick links</h5>
            <ul class="list-unstyled quick-links">
              <li><a><i class="fa fa-angle-double-right"></i>Home</a></li>
              <li><a><i class="fa fa-angle-double-right"></i>About</a></li>
              <li><a><i class="fa fa-angle-double-right"></i>FAQ</a></li>
              <li><a><i class="fa fa-angle-double-right"></i>Get Started</a></li>
              <li><a title="Design and developed by"><i class="fa fa-angle-double-right"></i>Imprint</a></li>
            </ul>
          </div>
        </div>
      </div >
    </section >
  )
}

class ButtonSearch extends React.Component {
  state = {
    loading: false
  }

  onClick = () => {
    // console.log(this.state)
    // console.log(this.props.img)
    this.setState({
      loading: true
    })
    // console.log(this.state)
    console.log(this.props)
    var apiBaseUrl = "http://0.0.0.0:9000/queryimage";
    var self = this;
    var payload = {
      "image": this.props.img,

    }
    axios.post(apiBaseUrl, payload, { 'headers': { 'Content-Type': 'application/json' } })
      .then(function (response) {
        console.log(response);
        if (response.status === 200) {
          console.log("Retrieve successfull");
          self.setState({
            loading: false
          })
        }
        else if (response.status === 204) {

          alert("Loi 204")
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  render() {
    const { loading } = this.state
    return (
      <div class="text-center">
        <Button class="btn btn-info w-50" type="primary" icon="search" onClick={this.onClick}>
          Search
        </Button>
        <br/><br/>
        {loading &&
          <div class='sweet-loading'>
            <BarLoader
              css={override}
              sizeUnit={"px"}
              size={80}
              height={4}
              width={1000}
              color={'#123abc'}
              loading={this.state.loading} />
          </div>}
      </div>
    )
  }
}


const Demo = ({ classes }) => {

  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [croppedImage, setCroppedImage] = useState(null)
  const [requestImage, setRequestImage] = useState(null)



  const [clothesImg, setImg] = useState('https://img.huffingtonpost.com/asset/5ab4d4ac2000007d06eb2c56.jpeg?cache=sih0jwle4e&ops=1910_1000')



  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])


  const onImageChange = event => {
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      setImg(URL.createObjectURL(img))

    }
  };





  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(
        clothesImg,
        croppedAreaPixels,
        rotation
      )
      console.log('ahihi', { croppedImage })
      setCroppedImage(croppedImage)
    } catch (e) {
      console.error(e)
    }
  }, [croppedAreaPixels, rotation])

  const onClose = useCallback(async () => {
    setCroppedImage(null)
    const requestImage = await getCroppedImg(
      clothesImg,
      croppedAreaPixels,
      rotation
    )
    console.log(requestImage);
    setRequestImage(requestImage)

  }, [croppedAreaPixels, rotation])

  // const buttonStyle = {
  //   minWidth: '56px',
  //   width: '56px',
  //   minHeight: '56px',
  //   height: '56px',
  //   borderRadius: '28px',
  // };


  return (
    <div>
      <TopBar />
      <div className="container" style={{ padding: 15 }}>
        <div class="border" style={{ padding: "15px" }}>
          <div class="row justify-content-around text-center">
            <div class="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <p class="h1 align-self-center" style={{ margin: "0px" }}>Select Image</p>
            </div>
            <div class="col-xl-4 col-lg-4 col-md-12 col-sm-12 align-self-center">
              <input class="btn btn-info" type="file" onChange={onImageChange} />
            </div>
          </div>
        </div>
      </div>
      <div className={classes.cropContainer}>
        <Cropper
          image={clothesImg}
          crop={crop}
          rotation={rotation}
          zoom={zoom}
          aspect={4 / 3}
          // width = {50}
          onCropChange={setCrop}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </div>
      <div className={classes.controls}>
        <div className={classes.sliderContainer}>
          <Typography
            variant="overline"
            classes={{ root: classes.sliderLabel }}
          >
            Zoom
          </Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            classes={{ container: classes.slider }}
            onChange={(e, zoom) => setZoom(zoom)}
          />
        </div>
        <div className={classes.sliderContainer}>
          <Typography
            variant="overline"
            classes={{ root: classes.sliderLabel }}
          >
            Rotation
          </Typography>
          <Slider
            value={rotation}
            min={0}
            max={360}
            step={1}
            aria-labelledby="Rotation"
            classes={{ container: classes.slider }}
            onChange={(e, rotation) => setRotation(rotation)}
          />
        </div>
        <Button
          onClick={showCroppedImage}
          variant="contained"
          color="primary"
          classes={{ root: classes.cropButton }}
        >
          Crop
        </Button>
      </div>
      <ImgDialog img={croppedImage} onClose={onClose} />
      <div className="container" style={{ padding: 10 }}>
        <ButtonSearch img={requestImage} />
      </div>
      <section style={{ padding: "50px" }}>
        <div class="text-center">
          <h1 class="text-dark display-4 bg-warning">Result</h1>
        </div>
        <div class="row text-center text-lg-left" style={{ padding: "15px" }}>
          <ModalImage
            src={'./logo4.png'}
            alt={`Metadata Image`}
            ratio={`3:2`}
          />
          <ModalImage
            src={'./logo4.png'}
            alt={`Metadata Image`}
            ratio={`3:2`}
          />
          <ModalImage
            src={'./logo4.png'}
            alt={`Metadata Image`}
            ratio={`3:2`}
          />
          <ModalImage
            src={'./logo4.png'}
            alt={`Metadata Image`}
            ratio={`3:2`}
          />
          <ModalImage
            src={'./logo4.png'}
            alt={`Metadata Image`}
            ratio={`3:2`}
          />
          <ModalImage
            src={'./logo4.png'}
            alt={`Metadata Image`}
            ratio={`3:2`}
          />
          <ModalImage
            src={'./logo4.png'}
            alt={`Metadata Image`}
            ratio={`3:2`}
          />
        </div>
      </section>
      <Footer />
    </div>
  )
}

const StyledDemo = withStyles(styles)(Demo)

const rootElement = document.getElementById('root')
ReactDOM.render(<StyledDemo />, rootElement)
