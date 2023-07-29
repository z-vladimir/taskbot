import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  Dimensions,
  Alert,
  FlatList,
  I18nManager,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Header from '../../components/Header';
import FormInput from '../../components/FormInput';
import MultiSelect from 'react-native-multiple-select';
import FormButton from '../../components/FormButton';
import axios from 'axios';
import {useSelector, useDispatch} from 'react-redux';
import styles from '../../style/styles';
import {useIsFocused} from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import Feather from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as CONSTANT from '../../constants/globalConstants';
import {decode} from 'html-entities';
import RBSheet from 'react-native-raw-bottom-sheet';
import constant from '../../constants/translation';

const ProfileSetting = ({navigation}) => {
  const token = useSelector(state => state.value.token);  
  const settings = useSelector(state => state.setting.settings);
  const userDetail = useSelector(state => state.value.userInfo);
  const isFocused = useIsFocused();
  const RBSheetAddBankAccount = useRef();

  const [degreeTitle, setDegreeTitle] = useState('');
  const [institute, setInstitute] = useState('');
  const [date, setDate] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [description, setDescription] = useState('');
  const [edit, setEdit] = useState(false);

  const [loader, setLoader] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [tagline, setTagline] = useState('');
  const [rate, setRate] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [education, setEducation] = useState([]);
  const [educationIndex, setEducationIndex] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [englishLevel, setEnglishLevel] = useState([]);
  const [level, setLevel] = useState('');
  const [sellerType, setSellerType] = useState([]);
  const [seller, setSeller] = useState('');

  useEffect(() => {
    getEnglishLevelTaxonomy();
    getSellerTypeTaxonomy();
    getCountryTaxonomy();
  }, []);
  useEffect(() => {
    if (isFocused) {
      getProfileSetting();
    }
  }, [isFocused]);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const onChangeto = (event, selectedDate) => {
    const currentDate = selectedDate || dateTo;
    setShowEnd(Platform.OS === 'ios');
    setDateTo(currentDate);
  };

  const getEnglishLevelTaxonomy = () => {
    fetch(
      CONSTANT.BaseUrl +
        'settings/get_options?type=taxonomy&taxonomy_name=tb_english_level',
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    )
      .then(response => response.json())
      .then(responseJson => {
        setEnglishLevel(responseJson);
      })
      .catch(error => {
        console.error(error);
      });
  };
  const getSellerTypeTaxonomy = () => {
    fetch(
      CONSTANT.BaseUrl +
        'settings/get_options?type=taxonomy&taxonomy_name=tb_seller_type',
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    )
      .then(response => response.json())
      .then(responseJson => {
        setSellerType(responseJson);
      })
      .catch(error => {
        console.error(error);
      });
  };
  const getCountryTaxonomy = () => {
    fetch(CONSTANT.BaseUrl + 'settings/get_options?type=country', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        {
          Object.entries(responseJson).map(([key, value]) =>
            countries.push({
              slug: key,
              name: value,
            }),
          );
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const getProfileSetting = () => {
    education.length = 0;
    setLoader(true);
    fetch(CONSTANT.BaseUrl + 'get-profile?post_id=' + userDetail.profile_id, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        if (userDetail.user_type == 'sellers') {
          setFirstName(responseJson.profile_data.first_name);
          setLastName(responseJson.profile_data.last_name);
          setTagline(responseJson.profile_data.tagline);
          setRate(responseJson.profile_data.hourlyprice);
          setLevel([responseJson.profile_data.english_level]);
          setSeller([responseJson.profile_data.seller_type]);
          setZipCode(responseJson.profile_data.zipcode);
          setSelectedCountry([responseJson.profile_data.country]);
          for (var i = 0; i < responseJson.profile_data.education.length; i++) {
            education.push({
              title: responseJson.profile_data.education[i].degree_title,
              institute: responseJson.profile_data.education[i].institute,
              start_date: responseJson.profile_data.education[i].start_date,
              end_date: responseJson.profile_data.education[i].end_date,
              description: responseJson.profile_data.education[i].description,
            });
          }
        } else {
          setFirstName(responseJson.profile_data.first_name);
          setLastName(responseJson.profile_data.last_name);
          setTagline(responseJson.profile_data.tagline);
          setSelectedCountry([responseJson.profile_data.country]);
          setZipCode(responseJson.profile_data.zipcode);
        }

        setLoader(false);
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };

  const updateProfileData = () => {
    setLoader(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'update-profile',
        {
          post_id: userDetail.profile_id,
          first_name: firstName,
          last_name: lastName,
          tagline: tagline,
          country: selectedCountry.toString(),
          hourly_rate: rate,
          english_level: level.toString(),
          seller_type: seller.toString(),
          zipcode: zipCode,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        if (response.data.type == 'success') {
          setLoader(false);
          Alert.alert(constant.SuccessText, response.data.message_desc);
        } else if (response.data.type == 'error') {
          setLoader(false);
          Alert.alert(constant.OopsText, response.data.message_desc);
        }
      })
      .catch(error => {
        setLoader(false);
        console.log(error);
      });
  };

  const addNewEducation = () => {
    RBSheetAddBankAccount.current.open()
    setEdit(false)
    setInstitute("")
    setDegreeTitle("")
    setDescription("")
    setDateTo(new Date())
    setDate(new Date());
  }

  const updateEducationData = () => {
   
    if (degreeTitle != '' && institute != '' && description != '') {
      setLoader(true)
      
      const startDate =
        date.getFullYear() +
        '-' +
        ('0' + (date.getMonth() + 1)).slice(-2) +
        '-' +
        ('0' + date.getDate()).slice(-2);
      const endDate =
        dateTo.getFullYear() +
        '-' +
        ('0' + (dateTo.getMonth() + 1)).slice(-2) +
        '-' +
        ('0' + dateTo.getDate()).slice(-2);

      if (edit === true) {
        (education[educationIndex].title = degreeTitle),
          (education[educationIndex].institute = institute),
          (education[educationIndex].start_date = startDate),
          (education[educationIndex].end_date = endDate),
          (education[educationIndex].description = description);
      } else {
        education.push({
          title: degreeTitle,
          institute: institute,
          start_date: startDate,
          end_date: endDate,
          description: description,
        });
      }
      setRefresh(!refresh);
      axios
        .post(
          CONSTANT.BaseUrl + 'update-education',
          {
            post_id: userDetail.profile_id,
            education: education,
          },
          {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          },
        )
        .then(async response => {
          if (response.data.type == 'success') {
            RBSheetAddBankAccount.current.close();
            Alert.alert(constant.SuccessText, response.data.message_desc);
            setLoader(false);
            setDegreeTitle('');
            setInstitute('');
            setDescription('');
            setDate(new Date());
            setDateTo(new Date());
          } else if (response.data.type == 'error') {
            setLoader(false);
            Alert.alert(constant.OopsText, response.data.message_desc);
          }
        })
        .catch(error => {
          setLoader(false);
          console.log(error);
        });
    } else {
      Alert.alert(constant.OopsText, constant.profileSettingAlertText);
    }
  };

  const deleteEducation = index => {
    education.splice(index, 1);
    setRefresh(!refresh);
    axios
      .post(
        CONSTANT.BaseUrl + 'update-education',
        {
          post_id: userDetail.profile_id,
          education: education,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        if (response.data.type == 'success') {
          Alert.alert(constant.SuccessText, 'Successfuly Deleted');
          setLoader(false);
        } else if (response.data.type == 'error') {
          setLoader(false);
          Alert.alert(constant.OopsText, response.data.message_desc);
        }
      })
      .catch(error => {
        setLoader(false);
        console.log(error);
      });
  };

  const editEducation = (item, index) => {
    RBSheetAddBankAccount.current.open();
    setEdit(true);
    setEducationIndex(index);
    setDegreeTitle(item.title);
    setInstitute(item.institute);
    setDescription(item.description);
    setDate(new Date(Date.parse(item.start_date)));
    setDateTo(new Date(Date.parse(item.end_date)));
  };

  return (
    <SafeAreaView style={styles.profileSettingParentStyle}>
      <Header
        title={constant.profileSettingTitle}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
        backIcon={true}
      />
      {loader && <Spinner visible={true} color={'#000'} />}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSettingMainViewParentStyle}>
          <FormInput
            labelValue={firstName}
            onChangeText={value => setFirstName(value)}
            placeholderText={constant.profileSettingFirstName}
          />
          <FormInput
            labelValue={lastName}
            onChangeText={value => setLastName(value)}
            placeholderText={constant.profileSettingLastName}
          />
          <FormInput
            labelValue={tagline}
            onChangeText={value => setTagline(value)}
            placeholderText={constant.profileSettingTagline}
          />

          <Text style={styles.profileSettingDropDownHeadingStyle}>
            {constant.profileSettingCountry}
          </Text>
          <View
            style={{
              marginVertical: 10,
              borderBottomColor: '#DDDDDD',
              borderBottomWidth: 1,
              width: '100%',
            }}>
            <MultiSelect
              fontSize={16}
              onSelectedItemsChange={value => setSelectedCountry(value)}
              uniqueKey="slug"
              items={countries}
              selectedItems={selectedCountry}
              borderBottomWidth={0}
              single={true}
              searchInputStyle={{ textAlign:I18nManager.isRTL ? "right" : "left"}}
              searchInputPlaceholderText={constant.profileSettingSelectCountry}
              selectText={constant.profileSettingSelectCountry}
              styleMainWrapper={styles.multiSlectstyleMainWrapper}
              styleDropdownMenuSubsection={
                styles.multiSlectstyleDropdownMenuSubsection
              }
              styleListContainer={{
                maxHeight: 150,
              }}
              onChangeInput={text => console.log(text)}
              displayKey="name"
              submitButtonText={constant.Submit}
            />
          </View>
          {userDetail.user_type == 'sellers' && (
            <View
              style={styles.profileSettingSellerTypeConatiner}>
              <MultiSelect
                fontSize={16}
                onSelectedItemsChange={value => setSeller(value)}
                uniqueKey="term_id"
                items={sellerType}
                selectedItems={seller}
                borderBottomWidth={0}
                single={true}
              searchInputStyle={{ textAlign:I18nManager.isRTL ? "right" : "left"}}
                searchInputPlaceholderText={constant.profileSettingSellerType}
                selectText={constant.profileSettingSellerType}
                styleMainWrapper={styles.multiSlectstyleMainWrapper}
                styleDropdownMenuSubsection={
                  styles.multiSlectstyleDropdownMenuSubsection
                }
                styleListContainer={{
                  maxHeight: 150,
                }}
                onChangeInput={text => console.log(text)}
                displayKey="name"
                submitButtonText={constant.Submit}
              />
            </View>
          )}
          {userDetail.user_type == 'sellers' && (
            <View
              style={styles.profileSettingenglishLevel}>
              <MultiSelect
                fontSize={16}
                onSelectedItemsChange={value => setLevel(value)}
                uniqueKey="term_id"
                items={englishLevel}
                selectedItems={level}
                borderBottomWidth={0}
                single={true}
              searchInputStyle={{ textAlign:I18nManager.isRTL ? "right" : "left"}}
                searchInputPlaceholderText={constant.profileSettingEnglishLevel}
                selectText={constant.profileSettingEnglishLevel}
                styleMainWrapper={styles.multiSlectstyleMainWrapper}
                styleDropdownMenuSubsection={
                  styles.multiSlectstyleDropdownMenuSubsection
                }
                styleListContainer={{
                  maxHeight: 150,
                }}
                onChangeInput={text => console.log(text)}
                displayKey="name"
                submitButtonText={constant.Submit}
              />
            </View>
          )}
          {/* <View style={styles.profileSettingDropDownTextParent}>
            <Text style={styles.profileSettingDropDownTextStyle}>
              Select country
            </Text>
            <Feather name={'chevron-down'} size={18} color={'#888888'} />
          </View> */}
         {settings.enable_zipcode == "1" &&
            <FormInput
              labelValue={zipCode}
              onChangeText={zip => setZipCode(zip)}
              placeholderText={constant.profileSettingZipCode}
            />}
          {userDetail.user_type == 'sellers' && (
            <FormInput
              labelValue={rate}
              onChangeText={rate => setRate(rate)}
              placeholderText={constant.profileSettingHourly}
            />
          )}
          <View style={{marginVertical: 10}}>
            <FormButton
              onPress={() => updateProfileData()}
              buttonTitle={constant.Save}
              backgroundColor={CONSTANT.primaryColor}
              textColor={'#fff'}
            />
          </View>
          <Text style={styles.profileDescriptionTextStyle}>
            {constant.profileSettingLatestChange}
          </Text>
        </View>

        {userDetail.user_type == 'sellers' && (
          <View
            style={styles.profileSettingEducation}>
            <View style={styles.educationListParentStyle}>
              <Text style={styles.educationTextStyle}>
                {constant.profileSettingEducation}
              </Text>
              <Text
                onPress={() => addNewEducation()}
                style={styles.addNewTextStyle}>
                {constant.profileSettingAddNew}
              </Text>
            </View>
            <FlatList
              data={education}
              extraData={refresh}
              ListEmptyComponent={
                <Text style={styles.educationTitleStyle}>
                  {constant.profileSettingNoData}
                </Text>
              }
              keyExtractor={(x, i) => i.toString()}
              renderItem={({item, index}) => (
                <View
                  style={
                    index == education.length - 1
                      ? styles.educationCardParentStyleLast
                      : styles.educationCardParentStyle
                  }>
                  <Text style={styles.educationDescStyle}>
                    {item.institute} - {item.start_date} - {item.end_date}
                  </Text>
                  <Text style={styles.educationTitleStyle}>{item.title}</Text>
                  <FormButton
                    onPress={() => editEducation(item, index)}
                    buttonTitle={constant.profileSettingEdit}
                    backgroundColor={CONSTANT.primaryColor}
                    textColor={'#fff'}
                  />
                  <Text
                    onPress={() => deleteEducation(index)}
                    style={styles.eduRemoveTextStyle}>
                    {constant.profileSettingRemove}
                  </Text>
                </View>
              )}
            />
          </View>
        )}
      </ScrollView>
      <RBSheet
        ref={RBSheetAddBankAccount}
        height={Dimensions.get('window').height * 0.7}
        duration={250}
        customStyles={{
          container: {
            paddingVertical: 15,
            paddingHorizontal: 10,
            backgroundColor: 'transparent',
          },
        }}>
        <View style={styles.RBSheetParentStyleTwo}>
          <View style={styles.RBSheetheaderStyleTwo}>
            <Text style={styles.RBSheetHeaderTextStyle}>
              {constant.profileSettingEducationalDetails}
            </Text>
            <Feather
              onPress={() => RBSheetAddBankAccount.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'x'}
              size={20}
              color={'#1C1C1C'}
            />
          </View>

          <ScrollView
            style={{marginHorizontal: 15}}
            showsVerticalScrollIndicator={false}>
            <View>
              <FormInput
                value={degreeTitle}
                onChangeText={body => setDegreeTitle(body)}
                placeholderText={constant.profileSettingDegreeTitle}
              />
            </View>

            <View>
              <FormInput
                value={institute}
                onChangeText={body => setInstitute(body)}
                placeholderText={constant.profileSettingInstituteName}
              />
            </View>

            <Text style={styles.eduRBChooseDateStyle}>
              {constant.profileSettingChooseDate}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShow(!show);
                setShowEnd(false);
              }}
              style={styles.eduRBStartDateStyle}>
              <Text style={styles.eduRBDateFromStyle}>
                {date.getFullYear()}
                {'-'}
                {('0' + (date.getMonth() + 1)).slice(-2)}
                {'-'}
                {date.getDate()}
              </Text>

              <Feather name={'chevron-down'} size={18} color={'#888888'} />
            </TouchableOpacity>
            {show && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={mode}
                display="spinner"
                maximumDate={new Date()}
                // is24Hour={true}
                onChange={onChange}
              />
            )}
            <TouchableOpacity
              onPress={() => {
                setShowEnd(!showEnd);
                setShow(false);
              }}
              style={styles.eduRBDateToParentStyle}>
              <Text style={styles.eduRBDateToTextStyle}>
                {dateTo.getFullYear()}
                {'-'}
                {('0' + (dateTo.getMonth() + 1)).slice(-2)}
                {'-'}
                {dateTo.getDate()}
              </Text>
              <Feather name={'chevron-down'} size={18} color={'#888888'} />
            </TouchableOpacity>
            {showEnd && (
              <DateTimePicker
                testID="dateTimePicker"
                value={dateTo}
                mode={mode}
                display="spinner"
                maximumDate={new Date()}
                // is24Hour={true}
                onChange={onChangeto}
              />
            )}
            <View style={{height: 170, marginVertical: 10, width: '100%'}}>
              <View style={styles.MultiLineTextFieldView}>
                <TextInput
                  style={styles.MultiLineTextField}
                  value={description}
                  onChangeText={body => setDescription(body)}
                  placeholder={constant.profileSettingDescription}
                  placeholderTextColor="#888888"
                  multiline={true}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>
            <View style={{marginVertical: 10}}>
              <FormButton
                buttonTitle={constant.profileSettingUpdateChanges}
                backgroundColor={CONSTANT.primaryColor}
                textColor={'#FFFFFF'}
                loader={loader}
                onPress={() => updateEducationData()}
              />
              <Text style={styles.eduRBDescStyle}>
                 {constant.profileSettingLatestChange}
              </Text>
            </View>
          </ScrollView>
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

export default ProfileSetting;
