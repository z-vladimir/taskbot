import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FormButton from '../../components/FormButton';
import * as CONSTANT from '../../constants/globalConstants';
import {decode} from 'html-entities';
import MultiSelect from 'react-native-multiple-select';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import RBSheet from 'react-native-raw-bottom-sheet';
import constant from '../../constants/translation';
import styles from '../../style/styles.js';
import {useSelector, useDispatch} from 'react-redux';
import {
  updateStep,
  updatePostedTaskId,
} from '../../Redux/PostTaskSlice';
import FormInput from '../../components/FormInput';

const PostTaskStepFour = ({item}) => {
  const deliveryTaxonomy = useSelector(state => state.setting.deliveryTaxonomy);
  const settings = useSelector(state => state.setting.settings);
  const userDetail = useSelector(state => state.value.userInfo);
  const taskId = useSelector(state => state.postedTask.taskId);
  const token = useSelector(state => state.value.token);
  const [loading, setLoading] = useState(false);
  const navigationforword = useNavigation();
  const RBSheetAddFaq = useRef();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [titleOne, setTitleOne] = useState('');
  const [priceOne, setPriceOne] = useState('');
  const [descriptionOne, setDescriptionOne] = useState('');
  const [selectedDeliveryOne, setSelectedDeliveryOne] = useState('');

  const [featured, setFeatured] = useState('');
  const [faqTitle, setFaqTitle] = useState('');
  const [faqDesc, setFaqDesc] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    if (item != null) {
      setFaqs(item.faqs)
    }
  }, []);
  const addFaqs = () => {
    if (faqTitle != '' && faqDesc != '') {
      faqs.push({
        question: faqTitle,
        answer: faqDesc,
      });
      setRefresh(!refresh);
      RBSheetAddFaq.current.close();
      setFaqTitle('');
      setFaqDesc('');
    }
    setSelectedIndex(null)
  };
  const deleteFaq = index => {
    faqs.splice(index, 1);
    setRefresh(!refresh);
  };
  const saveUpdateFourthStep = () => {
    setLoading(true)
    axios
  .post(
    CONSTANT.BaseUrl + 'create-task',
    {
      post_id: userDetail.profile_id,
      user_id: userDetail.user_id,
      action: 4,
      task_id:taskId,
      faq_arr: faqs,
    },
    {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    },
  )
  .then(async response => {
    setLoading(false)
    if (response.data.type == 'success') {  
      navigationforword.navigate('taskListing')
    } else if (response.data.type == 'error') {
      Alert.alert('Oops', response.data.message_desc);
    }
  })
  .catch(error => {
   setLoading(false)
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
        <View
          style={{
            paddingVertical: 10,
            borderRadius: 6,
            paddingVertical: 15,
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Text style={styles.postProjectHeading}>{constant.postTaskCommonFAQs}</Text>
          <TouchableOpacity onPress={() => RBSheetAddFaq.current.open()}>
            <Text
              style={[
                styles.sendProposalEmpolyerCheckText,
                {color: CONSTANT.blueColor},
              ]}>
            {constant.postTaskAddMore}
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          // style={{marginTop: 10}}
          data={faqs}
          keyExtractor={(x, i) => i.toString()}
          extraData={refresh}
          renderItem={({item, index}) => (
            <View
              style={{
                borderRadius: 6,
                borderColor: CONSTANT.borderColor,
                borderWidth: 1,
                marginBottom: 10,
              }}>
              <TouchableOpacity
                onPress={() =>
                  setSelectedIndex(selectedIndex == index ? null : index)
                }
                style={{
                  paddingVertical: 10,
                  borderRadius: 6,
                  paddingHorizontal: 15,
                  paddingVertical: 20,
                  backgroundColor: '#f7f7f7',
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text style={[styles.postProjectHeading, {fontSize: 18}]}>
                  {item.question}
                </Text>

                <Feather
                  // style={styles.homeSearchIconStyle}
                  name={
                    selectedIndex == index ? 'chevron-down' : 'chevron-right'
                  }
                  size={20}
                  color={'#999999'}
                />
              </TouchableOpacity>
              {selectedIndex == index && (
                <View
                  style={{
                    paddingVertical: 10,
                    borderRadius: 6,
                    paddingHorizontal: 15,
                    paddingVertical: 20,
                  }}>
                  <Text style={[styles.postProjectHeading, {fontSize: 16}]}>
                    {constant.postTaskPackageTitle}
                  </Text>
                  <FormInput
                    labelValue={item.question}
                    onChangeText={text => {
                      item.question = text;
                      setRefresh(!refresh);
                    }}
                    placeholderText={'Add question'}
                    autoCorrect={false}
                  />
                  <View style={styles.disputeDetailsAddReply}>
                    <Text
                      style={[
                        [styles.postProjectHeading, {fontSize: 16}],
                        {paddingTop: 10},
                      ]}>
                      {constant.postTaskDescription}
                    </Text>
                    <View style={styles.MultiLineTextFieldView}>
                      <TextInput
                        style={styles.sendProjectMultiLineTextField}
                        value={item.answer}
                        onChangeText={body => {
                          item.answer = body;
                          setRefresh(!refresh);
                        }}
                        placeholder={constant.postTaskDescription}
                        placeholderTextColor="#888888"
                        multiline={true}
                        underlineColorAndroid="transparent"
                      />
                    </View>
                  </View>
                  <View style={{marginTop: 30, marginBottom: -10}}>
                    <FormButton
                      onPress={() => deleteFaq(index)}
                      buttonTitle={constant.postTaskDelete}
                      backgroundColor={'#EF4444'}
                      textColor={'#fff'}
                      iconName={'trash-2'}
                    />
                  </View>
                </View>
              )}
            </View>
          )}
        />
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
          onPress={() => saveUpdateFourthStep()}
          buttonTitle={constant.Save}
          backgroundColor={CONSTANT.primaryColor}
          textColor={'#fff'}
          loader={loading}
        />
      </View>
      <RBSheet
        ref={RBSheetAddFaq}
        height={Dimensions.get('window').height * 0.55}
        duration={250}
        customStyles={{
          container: {
            paddingVertical: 15,
            paddingHorizontal: 15,
            backgroundColor: 'transparent',
          },
        }}>
        <View style={styles.RBSheetParentStyleTwo}>
          <View style={styles.RBSheetheaderStyleTwo}>
            <Text style={styles.RBSheetHeaderTextStyle}>{constant.postTaskAddNewFAQ}</Text>
            <Feather
              onPress={() => RBSheetAddFaq.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'x'}
              size={20}
              color={'#1C1C1C'}
            />
          </View>

          <ScrollView
            style={{paddingHorizontal: 20, paddingVertical: 10}}
            showsVerticalScrollIndicator={false}>
            <Text style={[styles.postProjectHeading, {fontSize: 16}]}>
              {constant.postTaskAddFaqTitle}
            </Text>
            <FormInput
              labelValue={faqTitle}
              onChangeText={text => setFaqTitle(text)}
              placeholderText={constant.postTaskAddTitle}
              autoCorrect={false}
            />
            <Text style={[styles.postProjectHeading, {fontSize: 16}]}>
              {constant.postTaskAddFaqDescription}
            </Text>
            <View style={{height: 100, marginVertical: 10, width: '100%'}}>
              <View style={[styles.MultiLineTextFieldView, {padding: 0}]}>
                <TextInput
                  style={[
                    styles.MultiLineTextField,
                    {
                      color: CONSTANT.fontColor,
                      fontFamily: 'Urbanist-SemiBold',
                    },
                  ]}
                  value={faqDesc}
                  onChangeText={body => setFaqDesc(body)}
                  placeholder={constant.postTaskDescription}
                  placeholderTextColor="#888888"
                  multiline={true}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>
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
            <View style={{marginBottom:15}}>
            <FormButton
              onPress={() => addFaqs()}
              buttonTitle={constant.Save}
              backgroundColor={CONSTANT.primaryColor}
              textColor={'#fff'}
              iconName={'chevron-right'}
            />
            </View>
          </ScrollView>
        </View>
      </RBSheet>
    </ScrollView>
  );
};

export default PostTaskStepFour;
