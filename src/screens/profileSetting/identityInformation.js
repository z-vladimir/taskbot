import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Header from '../../components/Header';
import {useSelector, useDispatch} from 'react-redux';
import FormInput from '../../components/FormInput';
import * as CONSTANT from '../../constants/globalConstants';
import FormButton from '../../components/FormButton';
import styles from '../../style/styles';
import Feather from 'react-native-vector-icons/Feather';
import {useIsFocused} from '@react-navigation/native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {updateVerified} from '../../Redux/AuthSlice';
import DocumentPicker from 'react-native-document-picker';
import constant from '../../constants/translation';

const IdentityInformation = () => {
  const userDetail = useSelector(state => state.value.userInfo);
  const token = useSelector(state => state.value.token);
  const verify = useSelector(state => state.value.verified);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [idCard, setIdCard] = useState('');
  const [address, setAddress] = useState('');
  const [refreshList, setRefreshList] = useState(false);
  const [docArray, setDocArray] = useState([]);

  useEffect(() => {
    if (isFocused) {
      getVerification();
    }
  }, [isFocused]);

  const getVerification = () => {
    // setLoader(true);
    fetch(
      CONSTANT.BaseUrl + 'get-verification?post_id=' + userDetail.profile_id,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      },
    )
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.type == 'success') {
          if (responseJson.verification_attachments.length != 0) {
            dispatch(updateVerified('2'));
          } else {
            dispatch(updateVerified(responseJson.identity_verified));
          }
        }
        // setLoader(false);
      })
      .catch(error => {
        // setLoader(false);
        console.error(error);
      });
  };

  const pickDocumentfromDevice = async () => {
    try {
      const res = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true,
      });
      if (res.length < 4) {
        setDocArray(res);
        setRefreshList(!refreshList);
      } else {
        Alert.alert(constant.OopsText, constant.identityInformationAlertUpload);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  };

  const UploadIdentityVerification = () => {
    const formData = new FormData();
    formData.append('post_id', userDetail.profile_id);
    formData.append('document_size', docArray.length);
    formData.append('name', name);
    formData.append('contact_number', contactNumber);
    formData.append('verification_number', idCard);
    formData.append('address', address);
    if (docArray.length != 0) {
      docArray.forEach((item, i) => {
        var path = item.uri;
        var filename = item.name;
        formData.append('documents_' + i, {
          uri: path,
          type: item.type,
          name: filename,
        });
      });
    }
    fetch(CONSTANT.BaseUrl + 'update-verification', {
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + token,
      },
      body: formData,
    })
      .then(response => response.json())
      .then(responseJson => {
        // setSpinner(false);
        if (responseJson.type == 'success') {
          Alert.alert(constant.SuccessText, responseJson.message);
        } else if (responseJson.type == 'error') {
          Alert.alert(constant.OopsText, responseJson.message);
        }
      })
      .catch(error => {
        // setSpinner(false);
        console.log(error);
      });
  };

  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={constant.identityInformationTitle}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
        backIcon={true}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {verify == '' && (
          <>
            <View
              style={styles.identityInformationConatiner}>
              <FormInput
                placeholderText={constant.identityInformationName}
                labelValue={name}
                onChangeText={userName => setName(userName)}
                autoCorrect={false}
              />
              <FormInput
                placeholderText={constant.identityInformationContact}
                labelValue={contactNumber}
                onChangeText={userContact => setContactNumber(userContact)}
                autoCorrect={false}
              />
              <FormInput
                placeholderText={constant.identityInformationIdentityInfo}
                labelValue={idCard}
                onChangeText={userIdCard => setIdCard(userIdCard)}
                autoCorrect={false}
              />
              <FormInput
                placeholderText={constant.identityInformationAddress}
                labelValue={address}
                onChangeText={userAddress => setAddress(userAddress)}
                autoCorrect={false}
              />
            </View>
            <View style={{padding: 10}}>
              <Text style={styles.identityDownloadsImageText}>
                {constant.identityInformationUpload}
              </Text>
              <View style={styles.ImagePickView}>
                <Image
                  resizeMode="contain"
                  style={styles.ImagePickPlacholder}
                  source={require('../../../assets/images/PlaceholderImage.png')}
                />
                <TouchableOpacity
                  onPress={() => pickDocumentfromDevice()}
                  style={styles.ImagePickTextView}>
                  <Text style={styles.ImagePickBlueText}>
                    {constant.identityInformationClick}
                  </Text>
                  <Text style={styles.ImagePickText}>
                    {constant.identityInformationUploadPhoto}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.ImagePickTextDescription}>
                  {constant.identityInformationPhotoDescription}
                </Text>
              </View>
            </View>

            <FlatList
              data={docArray}
              keyExtractor={(x, i) => i.toString()}
              extraData={refreshList}
              renderItem={({item, index}) => (
                <View style={styles.selectedDocCardParentStyle}>
                  <View style={styles.selectedDocTitleParentStyle}>
                    <View>
                      <Text style={styles.selectedDocTitleTextStyle}>
                        {item.name}
                      </Text>
                      <Text style={styles.selectedDocSizeTextStyle}>
                        {(item.size / 1024).toFixed(2)} KB
                      </Text>
                    </View>
                    <Feather name={'trash-2'} size={18} color={'#EF4444'} />
                  </View>
                </View>
              )}
            />
            <View style={{paddingHorizontal: 10, paddingBottom: 10}}>
              <FormButton
                buttonTitle={'Save & update'}
                backgroundColor={CONSTANT.primaryColor}
                textColor={'#FFFFFF'}
                onPress={() => {
                  UploadIdentityVerification();
                }}
              />
              <Text style={styles.eduRBDescStyle}>
                {constant.identityInformationLatestChanges}
              </Text>
            </View>
          </>
        )}

        {verify == '1' && (
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 15,
              backgroundColor: '#27ae6024',
              borderColor: '#27ae60',
              borderWidth: 1,
              margin: 15,
              alignItems: 'center',
            }}>
            <Text style={styles.orderDetailVerificationHeading}>
              {constant.identityInformationHurray}
            </Text>
            <Text style={styles.orderDetailVerificationWalletDesc}>
              {constant.identityInformationCompleted}
            </Text>
          </View>
        )}
        {verify == '2' && (
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 15,
              backgroundColor: '#FEF5D0',
              borderColor: '#655308',
              borderWidth: 1,
              margin: 15,
              alignItems: 'center',
            }}>
            <Text style={styles.orderDetailVerificationHeading}>
              {constant.identityInformationWoohoo}
            </Text>
            <Text style={styles.orderDetailVerificationWalletDesc}>
           {constant.identityInformationSubmitted}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default IdentityInformation;
