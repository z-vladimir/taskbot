import {View, Text, SafeAreaView, FlatList, Image,I18nManager} from 'react-native';
import React, {useState, useEffect} from 'react';
import * as CONSTANT from '../../constants/globalConstants';
import Spinner from 'react-native-loading-spinner-overlay';
import Header from '../../components/Header';
import {useSelector, useDispatch} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import MultiSelect from 'react-native-multiple-select';
import styles from '../../style/styles.js';
import HistoryCard from './historyCard';
import constant from '../../constants/translation';

const PayoutHistory = () => {
  const token = useSelector(state => state.value.token);
  const userDetail = useSelector(state => state.value.userInfo);
  const [loader, setLoader] = useState(false);
  const [noRecord, setNoRecord] = useState(false);
  const [selectedSortType, setSelectedSortType] = useState('');
  const [showOrderType, setShowOrderType] = useState([
    {
      key: '',
      val: constant.payoutHistoryFilterAll,
    },
    {
      key: 'pending',
      val: constant.payoutHistoryFilterPending,
    },
    {
      key: 'publish',
      val: constant.payoutHistoryFilterApproved,
    },
  ]);
  const [payoutHistory, setPayoutHistory] = useState([]);

  useEffect(() => {
    getPayoutHistory();
  }, [selectedSortType]);

  const getPayoutHistory = async () => {
    setLoader(true);
   
    return fetch(
      CONSTANT.BaseUrl +
        'get-payout?post_id=' +
        userDetail.profile_id +
        '&sort_by=' +
        selectedSortType.toString(),
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
        setLoader(false);
        if (responseJson.payout.length < 1) {
          setNoRecord(true);
          setPayoutHistory(responseJson.payout);
        } else {
          setPayoutHistory(responseJson.payout);
        }
      })
      .catch(error => {
        setLoader(false);

        console.error(error);
      });
  };

  const getPayoutFilter = value => {
    setNoRecord(false);
    setSelectedSortType(value);
  };
  return (
    <SafeAreaView style={{flex: 1}}>
      <Header
        title={constant.payoutHistoryTitle}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
        backIcon={true}
      />
      {loader && <Spinner visible={true} color={'#000'} />}
      <View style={{backgroundColor: '#FFFFFF'}}>
        <View
          style={{
            paddingHorizontal: 10,
          }}>
          <View
            style={{
              borderBottomColor: '#DDDDDD',
              borderBottomWidth: 1,
              width: '100%',
            }}>
            <MultiSelect
              fontSize={16}
              onSelectedItemsChange={value => getPayoutFilter(value)}
              uniqueKey="key"
              
              items={showOrderType}
              selectedItems={selectedSortType}
              borderBottomWidth={0}
              single={true}
              searchInputStyle={{ textAlign:I18nManager.isRTL ? "right" : "left"}}
              searchInputPlaceholderText={constant.payoutHistoryFilterInvoices}
              selectText={constant.payoutHistoryFilterInvoices}
              styleMainWrapper={styles.multiSlectstyleMainWrapper}
              styleDropdownMenuSubsection={
                styles.multiSlectstyleDropdownMenuSubsection
              }
              styleListContainer={{
                maxHeight: 150,
              }}
              onChangeInput={text => console.log(text)}
              displayKey="val"
              submitButtonText={'submit'}
            />
          </View>
        </View>
      </View>
      {!noRecord ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={payoutHistory}
          keyExtractor={(x, i) => i.toString()}
          renderItem={({item, index}) => <HistoryCard item={item} />}
        />
      ) : (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Image
            resizeMode="contain"
            style={{width: 250, height: 250, marginTop: -30}}
            source={require('../../../assets/images/empty.png')}
          />
          <Text
            style={{
              color: '#1C1C1C',
              fontSize: 18,
              marginVertical: 10,
              fontFamily: 'Urbanist-SemiBold',
            }}>
            {constant.NoRecord}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default PayoutHistory;
