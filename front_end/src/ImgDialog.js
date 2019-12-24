import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'
import Slide from '@material-ui/core/Slide'
import { css } from '@emotion/core';
// First way to import
import { HashLoader } from 'react-spinners';
import axios from 'axios';
import { Button } from 'antd';


const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
`;

const styles = {
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
  imgContainer: {
    position: 'relative',
    flex: 1,
  },
  img: {
    position: 'absolute',
    top: 20,
    bottom: 20,
    left: 20,
    right: 20,
    margin: 'auto',
    maxWidth: '100%',
    maxHeight: '100%',
  },
}

function Transition(props) {
  return <Slide direction="up" {...props} />
}

class ImgDialog extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      open : false,
      loading: false,
      show1: []
    }
  }
  

  handleClickOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
  }



  componentDidUpdate(){
    console.log(this.props)

  }
 
 
      
      
      
  onClick = () => {
    // console.log(this.state)
    // console.log(this.props.img)
    this.setState({
      loading: true
    })
    var showsearch = []
    this.setState({
      show: showsearch,

    })
    // console.log(this.state)
    console.log(this.props.img)
    var apiBaseUrl = "http://0.0.0.0:9000/queryimage";
    var self = this;
    var payload = {
      "image": this.props.img,

    }
    axios.post(apiBaseUrl, payload, {'headers': {'Content-Type':'application/json'}})
      .then(function (response) {
        console.log(response);
        if (response.status === 200) {
          console.log("Retrieve successfull");
          showsearch.push(
            <div>
              Truy van anh thanh cong
             </div>
          )
          self.setState({
            show: showsearch,
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
    const { classes } = this.props
    return (
      <Dialog
        fullScreen
        open={!!this.props.img}
        onClose={this.props.onClose}
        TransitionComponent={Transition}
      >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton
              color="inherit"
              onClick={this.props.onClose}
              aria-label="Close"
            >
              <CloseIcon />
            </IconButton>
            <Typography
              variant="title"
              color="inherit"
              className={classes.flex}
            >
              Cropped image
            </Typography>
          </Toolbar>
        </AppBar>
        <div className={classes.imgContainer}>
          <img
            src={this.props.img}
            alt="Cropped"
            className={classes.img}
          />
        </div>
        <br />
        <div className="container" style={{ padding: 10 }}>
          <h1>Tim kiem ket qua tuong tu</h1>
          {/* <button onClick = {this.onClick}> Tim kiem</button> */}
          <Button type="primary" icon="search" onClick={this.onClick}>
            Search
        </Button>
          <div className='sweet-loading'>
            <HashLoader
              css={override}
              sizeUnit={"px"}
              size={120}
              color={'#123abc'}
              loading={this.state.loading}
            />
          </div>
          <div>
            {this.state.show}
          </div>
        </div>
      </Dialog>
    )
  }
}

export default withStyles(styles)(ImgDialog)
