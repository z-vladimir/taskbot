import {View, Text, SafeAreaView, ScrollView, Alert} from 'react-native';
import React, {useState, useEffect} from 'react';
import Header from '../../components/Header';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import MultiSelect from 'react-native-multiple-select';
import {useSelector} from 'react-redux';
import * as CONSTANT from '../../constants/globalConstants';
import axios from 'axios';
import styles from '../../style/styles';
import Spinner from 'react-native-loading-spinner-overlay';
import constant from '../../constants/translation';

const BillingInformation = () => {
  const token = useSelector(state => state.value.token);
  const userDetail = useSelector(state => state.value.userInfo);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyTitle, setCompanyTitle] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loader, setLoader] = useState(false);

  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [billing, setBilling] = useState({});
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    getCountryTaxonomy();
    getBillingInformation();
  }, []);

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

  const getBillingInformation = () => {
    setLoader(true);
    fetch(
      CONSTANT.BaseUrl + 'get-billing?post_id=' + userDetail.profile_id,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      },
    )
      .then(response => response.json())
      .then(responseJson => {
        setLoader(false);
        setFirstName(responseJson.billing_first_name);
        setLastName(responseJson.billing_last_name);
        setCompanyTitle(responseJson.billing_company);
        setSelectedCountry([responseJson.billing_country]);
        setAddress(responseJson.billing_address_1);
        setCity(responseJson.billing_city);
        setPostalCode(responseJson.billing_postcode);
        setPhone(responseJson.billing_phone);
        setEmail(responseJson.billing_email);
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };

  const updateBillingInformation = () => {
    setRefresh(true);
    var billingArray = {
      billing_first_name: firstName,
      billing_last_name: lastName,
      billing_company: companyTitle,
      billing_address_1: address,
      billing_country: selectedCountry.toString(),
      billing_city: city,
      billing_postcode: postalCode,
      billing_phone: phone,
      billing_email: email,
    };
    console.log('ARRAy', billing);
    setLoader(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'update-billing-details',
        {
          post_id: userDetail.profile_id,
          billing: billingArray,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        if (response.data.type == 'success') {
          Alert.alert(constant.SuccessText, response.data.message_desc);
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

  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={constant.billingInformationTitle}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
        backIcon={true}
      />
      {loader && <Spinner visible={true} color={'#000'} />}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={styles.billingInformationConatiner}>
          <FormInput
            labelValue={firstName}
            onChangeText={text => setFirstName(text)}
            placeholderText={constant.billingInformationFirstName}
          />
          <FormInput
            labelValue={lastName}
            onChangeText={text => setLastName(text)}
            placeholderText={constant.billingInformationLastName}
          />
          <FormInput
            labelValue={companyTitle}
            onChangeText={text => setCompanyTitle(text)}
            placeholderText={constant.billingInformationCompanyTitle}
          />
          <Text
            
            style={styles.profileSettingDropDownHeadingStyle}>
         {constant.billingInformationCountry}
          </Text>
          <View
            style={styles.billingInformationCountry}>
            <MultiSelect
              fontSize={16}
              onSelectedItemsChange={value => setSelectedCountry(value)}
              uniqueKey="slug"
              items={countries}
              selectedItems={selectedCountry}
              borderBottomWidth={0}
              single={true}
              searchInputPlaceholderText={constant.billingInformationSelectCountry}
              selectText={constant.billingInformationSelectCountry}
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
          <FormInput
            labelValue={address}
            onChangeText={text => setAddress(text)}
            placeholderText={constant.billingInformationAddress}
          />
          <FormInput
            labelValue={city}
            onChangeText={text => setCity(text)}
            placeholderText={constant.billingInformationCity}
          />
          <FormInput
            labelValue={postalCode}
            onChangeText={text => setPostalCode(text)}
            placeholderText={constant.billingInformationPostalCode}
          />
          <FormInput
            labelValue={phone}
            onChangeText={text => setPhone(text)}
            placeholderText={constant.billingInformationPhone}
          />
          <FormInput
            labelValue={email}
            onChangeText={text => setEmail(text)}
            placeholderText={constant.billingInformationEmail}
          />
        </View>
        <View style={styles.billingInformationBtn}>
          <FormButton
            buttonTitle={constant.billingInformationUpdate}
            backgroundColor={CONSTANT.primaryColor}
            textColor={'#FFFFFF'}
            onPress={() => updateBillingInformation()}
          />
          <Text style={styles.eduRBDescStyle}>
            {constant.billingInformationLatestChanges}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BillingInformation;
