import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ImageBackground,
  TextInput,
  Platform,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FormButton from '../../components/FormButton';
import * as CONSTANT from '../../constants/globalConstants';
import ImagePicker from 'react-native-image-crop-picker';
import {decode} from 'html-entities';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MultiSelect from 'react-native-multiple-select';
import axios from 'axios';
import DocumentPicker from 'react-native-document-picker';
import constant from '../../constants/translation';
import styles from '../../style/styles.js';
import {useSelector, useDispatch} from 'react-redux';
import {updateStep, updatePostedTaskId} from '../../Redux/PostTaskSlice';
import FormInput from '../../components/FormInput';

const PostTaskStepThree = ({item}) => {
  const settings = useSelector(state => state.setting.settings);
  const userDetail = useSelector(state => state.value.userInfo);
  const taskId = useSelector(state => state.postedTask.taskId);
  const token = useSelector(state => state.value.token);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const dispatch = useDispatch();
  const [gallery, setGallery] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState({});
  const [refreshList, setRefreshList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [videoURL, setVideoURL] = useState({});
  const [downloadableTitle, setDownloadableTitle] = useState('');
  const [downloadableURL, setDownloadableURL] = useState('');
  const [downloadables, setDownloadables] = useState(false);
  const [fileIndex, setFileIndex] = useState(null);

  useEffect(() => {
    if (item != null) {
      setGallery(item.galleries)
      setVideoURL({
        url:item.videos
      })
      setDownloadables(item.download_allow == "yes" ? true : false)
      setFiles(item.downloads)
      setRefreshList(!refreshList);
    }
  }, []);

  const chooseMultiplePictures = async () => {
    ImagePicker.openPicker({
      width: 1200,
      height: 1200,
      multiple: true,
      maxFiles: 10,
      mediaType: 'photo',
    }).then(img => {
      if (img.length < 4) {
        for (var i = 0; i < img.length; i++) {
          gallery.unshift({
            filename: img[i].filename,
            mime: img[i].mime,
            path: img[i].path,
            size: img[i].size,
            sourceURL: img[i].sourceURL,
          });
          if (gallery.length == 3) {
            i = img.length;
          }
        }
      } else {
        Alert.alert('Oops', 'You can upload upto 3 images');
      }

      setRefreshList(!refreshList);
    });
  };
  const chooseVideoFromGallery = async () => {
    ImagePicker.openPicker({
      mediaType: 'video',
    }).then(async video => {
      //const videoUri = Platform.OS === "ios" ? video.sourceURL : video.path;
      setVideoURL({
        name: video.filename,
        uri: Platform.OS === 'ios' ? video.sourceURL : video.path,
        type: video.mime,
      });
    });
  };
  const deleteGalleryImage = index => {
    gallery.splice(index, 1);
    setRefreshList(!refreshList);
    setSelectedGalleryImage(null);
  };
  const pickDocumentfromDevice = async () => {
    // docArray.length =0
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      setSelectedFile({
        name: res.name,
        uri: res.uri,
        type: res.type,
      });
      setDownloadableTitle(res.name);
      setDownloadableURL(res.uri);
      setFileIndex(null);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  };
  const addToList = () => {
    if (downloadableTitle != '' && downloadableURL != '') {
      if (fileIndex != null) {
        files[fileIndex].name = downloadableTitle;
        files[fileIndex].uri = downloadableURL;
        // files[fileIndex].type = "url";
        setFileIndex(null);
      } else {
        selectedFile.type =
          Object.keys(selectedFile).length !== 0 ? selectedFile.type : 'url';
        selectedFile.name = downloadableTitle;
        selectedFile.uri = downloadableURL;
        files.push(selectedFile);
        setSelectedFile({});
        setDownloadableTitle('');
        setDownloadableURL('');
      }
    }
  };
  const editFileInArray = (item, index) => {
    // setEditFile(true);
    setFileIndex(index);
    setSelectedFile(JSON.parse(JSON.stringify(item)));
    setDownloadableTitle(item.name);
    setDownloadableURL(item.hasOwnProperty("download_id") ? item.file: item.uri);
    // setDisable(true);
    // setRefreshList(!refreshList);
  };
  const deleteFile = index => {
    files.splice(index, 1);
    setRefreshList(!refreshList);
  };
  const saveUpdateThirdStep = () => {
    setLoading(true);
    let finalGallery = [];
    let preGallery = [];
    let finalDownloadable = [];
    let preDownloadable = [];
    let urlArray = []
    for (let i = 0; i < gallery.length; i++) {
      if (gallery[i].hasOwnProperty('attachment_id')) {
        preGallery.push({
          url: gallery[i].url,
          attachment_id: gallery[i].attachment_id,
          name: gallery[i].name,
        });
      } else {
        finalGallery.push({
          uri: Platform.OS == 'ios' ? gallery[i].sourceURL : gallery[i].path,
          type: gallery[i].mime,
          name: Platform.OS == 'ios' ? gallery[i].filename : 'profileImage',
        });
      }
    }
    for (let i = 0; i < files.length; i++) {
      if (files[i].type == 'url') {
        urlArray.push({
          title: files[i].name,
          file: files[i].uri,
        });
      } else {
        if (files[i].hasOwnProperty('download_id')) {
          preDownloadable.push(files[i]);
        } else {
          finalDownloadable.push({
            uri: files[i].uri,
            type: files[i].type,
            name: files[i].name,
          });
        }
      }
    }
    const formData = new FormData();
    formData.append('post_id', userDetail.profile_id);
    formData.append('user_id', userDetail.user_id);
    formData.append('action', 3);
    formData.append('task_id', taskId);
    formData.append('old_gallery_images', JSON.stringify(preGallery));
    if (finalGallery.length != 0) {
      finalGallery.forEach((item, i) => {
        formData.append('gallery_image' + i, {
          uri: item.uri,
          type: item.type,
          name: item.name,
        });
      });
      formData.append('new_gallery_images', finalGallery.length);
    }
    if (videoURL.hasOwnProperty('uri')) {
      formData.append('custom_video_upload', videoURL);
    } else {
      formData.append(
        'video_url',
        Object.keys(videoURL).length !== 0 ? videoURL.url : '',
      );
    }
    formData.append('downloadable_option', downloadables ? 'yes' : 'no');
    if (downloadables) {
      formData.append('downloadable_urls', JSON.stringify(urlArray));
      formData.append('downloadable_old_attachments', JSON.stringify(preDownloadable));
      if (finalDownloadable.length != 0) {
        finalDownloadable.forEach((item, i) => {
          formData.append('downloadable_' + i, {
            uri: item.uri,
            type: item.type,
            name: item.name,
          });
        });
        formData.append(
          'downloadable_attachments_size',
          finalDownloadable.length,
        );
      }
    }

    fetch(CONSTANT.BaseUrl + 'create-task', {
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + token,
      },
      body: formData,
    })
      .then(response => response.json())
      .then(responseJson => {
        setLoading(false);
        dispatch(updateStep(3));
      })
      .catch(error => {
        setLoading(false);
        console.log(error);
      });
  };
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View
        style={{
          marginHorizontal: 15,
          marginVertical: 10,
        }}>
        <View style={{padding: 10}}>
          <Text style={styles.identityDownloadsImageText}>
            {constant.postTaskGallery}{' '}
            <Text style={{fontFamily: 'Urbanist-Regular', color: '#999999'}}>
              {constant.postTaskAddUpto}
            </Text>
          </Text>
          <View style={styles.ImagePickView}>
            <Image
              resizeMode="contain"
              style={[styles.ImagePickPlacholder, {width: 75, height: 75}]}
              source={require('../../../assets/images/PlaceholderImage.png')}
            />
            {gallery.length < 3 && (
              <TouchableOpacity
                onPress={() => chooseMultiplePictures()}
                style={styles.ImagePickTextView}>
                <Text style={styles.ImagePickBlueText}>
                  {constant.identityInformationClick}{' '}
                </Text>
                <Text style={styles.ImagePickText}>
                  {constant.identityInformationUploadPhoto}
                </Text>
              </TouchableOpacity>
            )}
            <Text style={styles.ImagePickTextDescription}>
              {constant.identityInformationPhotoDescription}
            </Text>
          </View>
        </View>
        {gallery.length != 0 && (
          <FlatList
            style={{
              borderRadius: 10,
              borderColor: CONSTANT.borderColor,
              borderWidth: gallery.length == 0 ? 0 : 1,
              paddingHorizontal: 10,
              paddingVertical: 15,
              marginBottom: 15,
            }}
            showsVerticalScrollIndicator={false}
            data={gallery}
            numColumns={3}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => (
              <TouchableOpacity
                onPress={() =>
                  setSelectedGalleryImage(
                    selectedGalleryImage == index ? null : index,
                  )
                }
                style={{
                  flex: 1,
                  marginHorizontal: 3,
                  backgroundColor: '#FCFCFC',
                  borderColor: CONSTANT.borderColor,
                  borderWidth: 1,
                  borderRadius: 10,
                  marginBottom: 10,
                  flexDirection: 'row',
                }}>
                <ImageBackground
                  resizeMode="cover"
                  style={{height: 120, width: '100%'}}
                  imageStyle={{
                    borderRadius: 10,
                  }}
                  source={
                    item.hasOwnProperty('attachment_id')
                      ? {uri: item.url}
                      : {
                          uri:
                            Platform.OS == 'ios' ? item.sourceURL : item.path,
                        }
                  }>
                  {selectedGalleryImage == index && (
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                        borderRadius: 10,

                        backgroundColor: '#00000090',
                      }}>
                      <TouchableOpacity
                        onPress={() => deleteGalleryImage(index)}
                        style={{
                          backgroundColor: '#ffffff90',
                          borderRadius: 50,
                          alignItems: 'center',
                          padding: 3,
                          justifyContent: 'center',
                        }}>
                        <View
                          style={{
                            backgroundColor: '#fff',
                            padding: 8,
                            borderRadius: 50,
                          }}>
                          <Feather
                            name={'trash-2'}
                            color={'#EF4444'}
                            size={22}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </ImageBackground>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
      <View style={{borderTopColor: '#DDDDDD', borderTopWidth: 0.7}} />
      <View
        style={{
          marginHorizontal: 15,
          marginVertical: 10,
        }}>
        <Text style={[styles.postProjectHeading, {fontSize: 16}]}>
          {constant.postTaskVideo}
        </Text>

        <View
          style={[
            styles.homeSearchParentInputStyle,
            {paddingHorizontal: 10, marginBottom: 15},
          ]}>
          <TextInput
            style={styles.empProjectSearchInputStyle}
            placeholderTextColor={'#999999'}
            onChangeText={text => {
              videoURL.url = text;
              setRefreshList(!refreshList);
            }}
            value={videoURL.hasOwnProperty('uri') ? videoURL.uri : videoURL.url}
            placeholder={constant.postTaskVideoLinkHere}
          />
          {videoURL.hasOwnProperty('uri') ? (
            <Feather
              onPress={() => setVideoURL({})}
              style={styles.homeSearchIconStyle}
              name={'x-circle'}
              size={20}
              color={'#999999'}
            />
          ) : (
            <Feather
              onPress={() => chooseVideoFromGallery()}
              style={styles.homeSearchIconStyle}
              name={'upload'}
              size={20}
              color={'#999999'}
            />
          )}
        </View>
        <TouchableOpacity
          onPress={() => setDownloadables(!downloadables)}
          style={[styles.checkBoxMainView, {width: '95%'}]}>
          {downloadables ? (
            <View style={styles.checkBoxCheckSkills}>
              <FontAwesome name="check" type="check" color={'#fff'} size={14} />
            </View>
          ) : (
            <View
              style={{
                width: 20,
                height: 20,
                backgroundColor: '#fff',
                borderRadius: 4,
                borderColor: CONSTANT.borderColor,
                borderWidth: 1,
              }}></View>
          )}
          <Text style={styles.checkBoxCheckSkillsText}>
            {constant.postTaskDownloadables}
          </Text>
        </TouchableOpacity>
        {downloadables && (
          <>
            <Text style={[styles.postProjectHeading, {fontSize: 16}]}>
              {constant.postTaskTitle}
            </Text>
            <FormInput
              labelValue={downloadableTitle}
              onChangeText={text => setDownloadableTitle(text)}
              placeholderText={constant.postTaskAddTitle}
              autoCorrect={false}
            />
            <Text style={[styles.postProjectHeading, {fontSize: 16}]}>
              {constant.postTaskURL}
            </Text>
            <FormInput
              labelValue={downloadableURL}
              onChangeText={text => setDownloadableURL(text)}
              placeholderText={constant.postTaskAddURL}
              autoCorrect={false}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <View style={{paddingVertical: 0, width: '48%'}}>
                <FormButton
                  onPress={() => pickDocumentfromDevice()}
                  buttonTitle={constant.postTaskUploadFile}
                  backgroundColor={'#22C55E'}
                  textColor={'#fff'}
                />
              </View>
              <View style={{paddingVertical: 0, width: '48%'}}>
                <FormButton
                  onPress={() => addToList()}
                  buttonTitle={constant.postTaskAddToList}
                  backgroundColor={CONSTANT.primaryColor}
                  textColor={'#fff'}
                />
              </View>
            </View>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={files}
              style={{marginBottom: 10}}
              keyExtractor={(x, i) => i.toString()}
              renderItem={({item, index}) => (
                <View
                  style={{
                    backgroundColor: '#F7F7F7',
                    padding: 15,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      fontSize: 15,
                      lineHeight: 22,
                      letterSpacing: 0.5,
                      width: '82%',
                      fontFamily: 'Urbanist-SemiBold',
                      color: CONSTANT.blueColor,
                    }}>
                    {item.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => editFileInArray(item, index)}>
                    <Feather
                      style={{marginRight: 20}}
                      name={'edit-3'}
                      color={'#888888'}
                      size={20}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => deleteFile(index)}>
                    <Feather name={'trash-2'} color={'#EF4444'} size={20} />
                  </TouchableOpacity>
                </View>
              )}
            />
          </>
        )}
      </View>
      <View style={{borderTopColor: '#DDDDDD', borderTopWidth: 0.7}} />
      <View
        style={{
          marginHorizontal: 15,
          marginVertical: 10,
        }}>
        <Text
          style={{
            fontFamily: 'Urbanist-Regular',
            fontSize: 15,
            lineHeight: 26,
            letterSpacing: 0.5,
            color: '#1C1C1C',
            textAlign: 'center',
          }}>
          {constant.postTaskClickSaveUpdate}
        </Text>
        <FormButton
          onPress={() => saveUpdateThirdStep()}
          buttonTitle={constant.Save}
          backgroundColor={CONSTANT.primaryColor}
          textColor={'#fff'}
          loader={loading}
        />
      </View>
    </ScrollView>
  );
};

export default PostTaskStepThree;
