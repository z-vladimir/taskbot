import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  I18nManager,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import React, {useRef, useEffect, useState} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import Header from '../../components/Header';
import styles from '../../style/styles.js';
import RBSheet from 'react-native-raw-bottom-sheet';
import * as CONSTANT from '../../constants/globalConstants';
import constant from '../../constants/translation';
import {useSelector} from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import HTML from 'react-native-render-html';
import {decode} from 'html-entities';
import axios from 'axios';

const Earnings = ({navigation}) => {
  const token = useSelector(state => state.value.token);
  const userDetail = useSelector(state => state.value.userInfo);
  const settings = useSelector(state => state.setting.settings);
  const RBSheetPayout = useRef();
  const [loader, setLoader] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pendingBalance, setPendingBalance] = useState('');
  const [availableAmount, setAvailableAmount] = useState('');
  const [payoutList, setpayoutList] = useState([]);
  const [savedPayout, setSavedPayout] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [payoutData, setPayoutData] = useState({});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    getEarningInformation();
    getPayoutSettings();
  }, []);

  const getEarningInformation = () => {
    setLoader(true);
    fetch(CONSTANT.BaseUrl + 'get-balance?post_id=' + userDetail.profile_id, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        setLoader(false);
        setTotalAmount(responseJson.account_detail.total_amount);
        setWithdrawAmount(responseJson.account_detail.withdraw_amount);
        setPendingBalance(responseJson.account_detail.pending_blance);
        setAvailableAmount(responseJson.account_detail.available_in_amount);
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };

  const getPayoutSettings = () => {
    payoutList.length = 0
    savedPayout.length = 0
    setLoader(true);
    fetch(
      CONSTANT.BaseUrl + 'get_payout_setting?post_id=' + userDetail.profile_id,
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
        Object.entries(responseJson.payout_settings).map(([key, value]) =>
          payoutList.push({
            type: key,
            value: value,
            fields: Object.entries(value.fields).map(([key, value]) => ({
              name: key,
              val: value,
            })),
          }),
        );
        setRefresh(!refresh);
        Object.entries(responseJson.saved_settings).map(([key, value]) =>
          savedPayout.push({
            type: key,
            value: Object.entries(value).map(([key, value]) => ({
              name: key,
              val: value,
            })),
          }),
        );
        setRefresh(!refresh);
        for (var i = 0; i < payoutList.length; i++) {
          if (payoutList[i].type == savedPayout[0].type) {
            for (var j = 0; j < payoutList[i].fields.length; j++) {
              payoutList[i].fields[j].val['value'] =
                savedPayout[0].value[j].val;
            }
          }
        }
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };

  const tagsStyles = {
    body: {
      marginTop: 25,
      fontFamily: 'OpenSans-Regular',
      fontSize: 15,
      lineHeight: 24,
      letterSpacing: 0.5,
      color:'#1C1C1C'
    },
  };

  const changeInputValue = (val, item, index) => {
    payoutData.fields[index].val.value = val;
    setRefresh(!refresh);
  };

  const changePayoutData = () => {
    setLoading(true)
    var payout_settings = {};
    payout_settings['type'] = payoutData.type;
    Object.entries(payoutData.value.fields).map(
      ([key, value]) => (payout_settings[key] = value.value),
    );
    axios
      .post(
        CONSTANT.BaseUrl + 'update_payout_setting',
        {
          post_id: userDetail.profile_id,
          payout_settings: payout_settings,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        if (response.status === 200) {
          setLoading(false)
          RBSheetPayout.current.close()
          getPayoutSettings()
        } else if (response.status === 203) {
          setLoading(false)
          RBSheetPayout.current.close()
        }
      })
      .catch(error => {
        
        console.log(error);
      });
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <Header
        title={constant.earningTitle}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
      />
      {loader && <Spinner visible={true} color={'#000'} />}
      <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1}}>
        <View style={[styles.earningTabMainStyle, {marginTop: 20}]}>
          <View style={styles.earningTextParentStyle}>
            <View style={styles.earningIncomIconStyle}>
              <Feather name={'pie-chart'} size={18} color={'#18B99B'} />
            </View>

            <View style={{marginLeft: 10}}>
              <Text style={styles.earningTextBoldStyle}>
                {decode(settings.price_format.symbol)}
                {totalAmount != "" ? totalAmount : 0}
              </Text>
              <Text style={styles.earningTabTextStyle}>
                {constant.earningIncome}
              </Text>
            </View>
          </View>
          <Feather onPress={()=>getEarningInformation()} name={'rotate-cw'} size={18} color={'#1DA1F2'} />
          {/* <Feather name={'chevron-right'} size={18} color={'#999999'} /> */}
        </View>

        <View style={styles.earningTabMainStyle}>
          <View style={styles.earningTextParentStyle}>
            <View style={styles.earningWithdrawIconStyle}>
              <Feather name={'calendar'} size={18} color={'#7357FB'} />
            </View>

            <View style={{marginLeft: 10}}>
              <Text style={styles.earningTextBoldStyle}>
                {decode(settings.price_format.symbol)}
                {withdrawAmount != "" ? withdrawAmount : 0}
              </Text>
              <Text style={styles.earningTabTextStyle}>
                {constant.earningWithdrawn}
              </Text>
            </View>
          </View>
          <Feather name={I18nManager.isRTL ? 'chevron-left' : 'chevron-right'} size={18} color={'#999999'} />
        </View>

        <View style={styles.earningTabMainStyle}>
          <View style={styles.earningTextParentStyle}>
            <View style={styles.earningIncomPendingIconStyle}>
              <Feather name={'clock'} size={18} color={'#FF6167'} />
            </View>

            <View style={{marginLeft: 10}}>
              <Text style={styles.earningTextBoldStyle}>
                {decode(settings.price_format.symbol)}
                {pendingBalance  != "" ? pendingBalance : 0}
              </Text>
              <Text style={styles.earningTabTextStyle}>
                {constant.earningPending}
              </Text>
            </View>
          </View>
          {/* <Feather name={'rotate-cw'} size={18} color={'#999999'} /> */}
          <Feather name={I18nManager.isRTL ? 'chevron-left' : 'chevron-right'} size={18} color={'#999999'} />
        </View>

        <View style={styles.earningTabMainStyle}>
          <View style={styles.earningTextParentStyle}>
            <View style={styles.earningAvailableBalanceStyle}>
              <Feather name={'calendar'} size={18} color={'#309CFF'} />
            </View>

            <View style={{marginLeft: 10}}>
              <Text style={styles.earningTextBoldStyle}>
                {decode(settings.price_format.symbol)}
                {availableAmount  != "" ? availableAmount : 0}
              </Text>
              <Text style={styles.earningTabTextStyle}>
                {constant.earningAvailable}
              </Text>
            </View>
          </View>
          <Feather name={I18nManager.isRTL ? 'chevron-left' : 'chevron-right'} size={18} color={'#999999'} />
        </View>

        <View style={{backgroundColor: '#fff', margin: 15, borderRadius: 5}}>
          <Text style={styles.earningPaymentMethodStyle}>
            {constant.earningPayout}
          </Text>

          <FlatList
            data={payoutList}
            extraData={refresh}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => (
              <>
                {item.value.status == 'enable' && (
                  <TouchableOpacity
                    style={styles.earningPayoutSettingTabParentStyle}
                    activeOpacity={0.9}>
                    <View style={styles.earningTextParentStyle}>
                      {savedPayout.length >= 1 &&
                      savedPayout[0].type == item.type ? (
                        <View style={styles.earningPayoneerTextParentStyle} />
                      ) : (
                        <View style={styles.earningSeparatorStyle} />
                      )}

                      <Image
                        resizeMode="contain"
                        style={styles.earningPayoutImageStyle}
                        source={{uri: item.value.img_url}}
                      />
                      <Text style={styles.earningPayoutTextHeadingStyle}>
                        {item.value.label}
                      </Text>
                    </View>
                    {/* {savedPayout.length >= 1 &&
                    savedPayout[0].type == item.type ? (
                      <Feather
                        onPress={() => {
                          setPayoutData(item), RBSheetPayout.current.open();
                        }}
                        name={'trash'}
                        size={18}
                        color={'#EF4444'}
                      />
                    ) : ( */}
                    <Feather
                      onPress={() => {
                        setPayoutData(item), RBSheetPayout.current.open();
                      }}
                      name={'plus'}
                      size={18}
                      color={'#999999'}
                    />
                    {/* )} */}
                  </TouchableOpacity>
                )}
              </>
            )}
          />

          <View style={styles.earningPayoutSeparatorStyle} />
          <Text style={styles.earningPayoutParagraphText}>
            {constant.earningPayoutParagraphText}{' '}
            <Text style={styles.earningPolicyTextStyle}>
              {constant.earningTranfer}
            </Text>
          </Text>
        </View>

        <View style={styles.footerParentStyle}>
          <Text style={styles.footerMainTextStyle}>
            {constant.earningAllPayouts}
          </Text>
          <Text style={styles.footerTaglineTextStyle}>
            {constant.earningPayoutHistory}
          </Text>
          <View style={styles.footerButtonParentStyle}>
            <FormButton
              buttonTitle={constant.earningBtnTitle1}
              iconName={'arrow-right'}
              backgroundColor={'#1DA1F2'}
              textColor={'#fff'}
              // onPress={() => Alert.alert("payoutHistory")}
              onPress={() => navigation.navigate('payoutHistory')}
            />
          </View>
        </View>
      </ScrollView>

      <RBSheet
        ref={RBSheetPayout}
        height={Dimensions.get('window').height * 0.5}
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
            <Text style={styles.RBSheetHeaderTextStyle}>
              {payoutData.value != null && payoutData.value.title}
            </Text>
            <Feather
              onPress={() => RBSheetPayout.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'x'}
              size={20}
              color={'#1C1C1C'}
            />
          </View>

          <ScrollView
            style={{marginHorizontal: 20}}
            showsVerticalScrollIndicator={false}>
            {payoutData.fields != null && (
              <FlatList
                data={payoutData.fields}
                keyExtractor={(x, i) => i.toString()}
                extraData={refresh}
                renderItem={({item, index}) => (
                  <FormInput
                    labelValue={item.val.value}
                    placeholderText={item.val.placeholder}
                    onChangeText={val => changeInputValue(val, item, index)}
                  />
                )}
              />
            )}

            {/* <Text
              style={{
                marginTop: 25,
                fontFamily: 'OpenSans-Regular',
                fontSize: 15,
                lineHeight: 24,
                letterSpacing: 0.5,
              }}> */}
            {payoutData.value != null && (
              <HTML
                tagsStyles={tagsStyles}
                source={{html: payoutData.value.desc}}
              />
            )}

            <View style={{marginVertical: 10}}>
              <FormButton
                buttonTitle={constant.earningBtnTitle2}
                backgroundColor={CONSTANT.primaryColor}
                textColor={'#FFFFFF'}
                onPress={() => changePayoutData()}
                loader={loading}
              />
            </View>
          </ScrollView>
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

export default Earnings;
