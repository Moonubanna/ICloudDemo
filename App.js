/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
//Created by PRVN SINGH RATHORE

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  CameraRoll,
  NativeModules,
  ActivityIndicator,
  Platform
} from 'react-native';

import RNFS from "react-native-fs";
import ImagePicker from "react-native-image-picker";

export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      scope: 'visible',
      uploadingDownloading: false,
      videoURL: undefined,
    }
  }

  componentDidMount() {
    console.warn('nativemodules', NativeModules.RNCloudFs)
  }

  async videoPicker() {
    try {
      if (Platform.OS === "android") {
        await this.isPermissionGrantedOnAndroid(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Media Library Permission",
            message: "App needs the permission to access your camera storage"
          }
        );

        await this.isPermissionGrantedOnAndroid(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: "Media Library Permission",
            message: "App needs the permission to access your camera storage"
          }
        );
      }
      const options = {
        title: "Choose Video",
        mediaType: "video"
      };

      ImagePicker.launchImageLibrary(options, response => {
        if (response.didCancel) {
          console.log("User cancelled video picker");
        } else if (response.error) {
          console.log("Video picker Error: ", response.error);
        } else {
          let url = "";

          if (Platform.OS === "android") {
            url = response.path;
          } else {
            url = response.uri;
          }
          console.warn('video_select_path'+JSON.stringify(response))
          this.setState({ videoURL: url });
          this._uploadVideo(url);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  _uploadVideo = (url) => {
     //const sourceUri = { uri: 'https://www.radiantmediaplayer.com/media/bbb-360p.mp4' };
    // const destinationPath = "/docs/my_video_"+random+".mp4";

    const min = 1;
    const max = 1000;
    const random = min + (Math.random() * (max - min));
    const sourceUri = { uri: url };
    const destinationPath = "/docs/my_video_"+random+".mp4";
    const mimeType = null;
    const scope = 'visible';
    console.log('uploading_video_path'+destinationPath);
    this.setState({
      uploadingVideoURL:destinationPath,
      uploadingDownloading:true
    })

    NativeModules.RNCloudFs.copyToCloud({
      sourcePath: sourceUri,
      targetPath: destinationPath,
      mimeType: mimeType,
      scope: scope
    })
      .then((path) => {
        console.log("it worked video uploading", path);
        this.setState({
          uploadingDownloading:false
        })
      })
      .catch((err) => {
        console.warn("it failed video uploading", err);
        this.setState({
          uploadingDownloading:false
        })
      })
  }

  //Check video file exist or not
  _fileExist = () => {
    NativeModules.RNCloudFs.fileExists({
      targetPath: '/docs/my_video_.mp4',
      scope: this.state.scope
    })
      .then((exists) => {
        console.log(exists ? "this file exists" : "this file does not exist");
        this._listTheFile(this.state.uploadingVideoURL)
      })
      .catch((err) => {
        console.warn("it failed", err);
      })
  }

  //Before call this method please check file exist or not (call this method _fileExist())
  //For download video
  async _listTheFile(uploadingVideoURL) {

    const path = 'uploadingVideoURL';
    const scope = this.state.scope;
    this.setState({
      uploadingDownloading:true
    })

    NativeModules.RNCloudFs.listFiles({ targetPath: path, scope: scope })
      .then((res) => {
        console.log("it worked get video", res);
        this.setState({
          uploadingDownloading:false
        })
      })
      .catch((err) => {
        console.warn("it failed get video", err);
        this.setState({
          uploadingDownloading:false
        })
      })
  }

  //Testing purpose (create file)
  async _createFile() {
    const path = "/foo/bar/some_file_" + Math.random() + "_.txt";
    try {
      await NativeModules.RNCloudFs.createFile({
        targetPath: path,
        content: "some file content",
        scope: this.state.scope
      });
    } catch (err) {
      console.warn("failed to create", path, err);
    }
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          width: '100%',
          backgroundColor: 'green',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <TouchableOpacity
        activeOpacity={.8}
        onPress={()=>{
          this.videoPicker()
        }}
          style={{
            width: '100%',
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor:'red'
          }}>
          <Text style={{color:'white'}}>Pick Video For Uploading</Text>
        </TouchableOpacity>
        {this.state.uploadingVideoURL &&
        <TouchableOpacity
        activeOpacity={.8}
        onPress={()=>{
          this._fileExist(this.state.uploadingVideoURL)
        }}
          style={{
            width: '100%',
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor:'orange'
          }}>
          <Text style={{color:'white'}}>Get Video URL For Downloading</Text>
        </TouchableOpacity>
  }

        {this.state.uploadingDownloading &&
          <ActivityIndicator size="large" color="#0000ff" />
        }
      </View>
    )
  }
}
