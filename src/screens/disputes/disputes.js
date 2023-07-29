import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Header from '../../components/Header';
import * as CONSTANT from '../../constants/globalConstants';
import {useSelector, useDispatch} from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import styles from '../../style/styles.js';
import {decode} from 'html-entities';
import constant from '../../constants/translation';

const Disputes = ({navigation}) => {
  const token = useSelector(state => state.value.token);
  const userDetail = useSelector(state => state.value.userInfo);
  const [disputesList, setDisputesList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [emptyDisputeList, setEmptyDisputeList] = useState(false);

  useEffect(() => {
    getDisputes();
  }, []);
  const getDisputes = () => {
    setLoader(true);
    fetch(CONSTANT.BaseUrl + 'get-disputes?post_id=' + userDetail.profile_id+"&user_id="+userDetail.user_id, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.length == 0) {
          setEmptyDisputeList(true);
          setLoader(false);
        } else {
          setDisputesList(responseJson);
          setLoader(false);
        }
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };

  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={constant.disputeTitle}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
      />
      {loader && <Spinner visible={true} color={'#000'} />}

      <FlatList
        showsVerticalScrollIndicator={false}
        data={disputesList}
        keyExtractor={(x, i) => i.toString()}
        ListEmptyComponent={
          emptyDisputeList && (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                alignContent: 'center',
                marginTop: -40,
              }}>
              <Image
                resizeMode="contain"
                style={{width: 250, height: 250, marginTop: '50%'}}
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
          )
        }
        renderItem={({item, index}) => (
          <View style={styles.disputesParentStyle}>
            <View style={[styles.disputesStatus,{borderColor:item.status == "publish" ? "#999999" : "#F97316"}]}>
              {item.status == "publish" ?
               <Text style={styles.disputesStatusText}>
              {constant.disputesDetailsRefundRequested}
             </Text>:
                <Text style={styles.disputesStatusText}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>}
            </View>
            <View style={styles.invoiceRowParentStyle}>
              <Text style={styles.invoiceLableTextStyle}>{constant.disputeReference}</Text>
              <Text style={styles.invoiceValueTextStyle}>
                {item.dispute_id}
              </Text>
            </View>
            <View style={styles.invoicePayoutSeparatorStyle} />
            <View style={styles.invoiceRowParentStyle}>
              <Text style={styles.invoiceLableTextStyle}>{constant.disputeBuyer}</Text>
              <Text style={styles.invoiceClientNameValueTextStyle}>
                {item.buyer_name}
              </Text>
            </View>
            <View style={styles.invoicePayoutSeparatorStyle} />
            <View style={styles.invoiceRowParentStyle}>
              <Text style={styles.invoiceLableTextStyle}>{constant.disputeInvoice}</Text>
              <Text style={styles.invoiceValueTextStyle}>{item.date}</Text>
            </View>
            <View style={styles.invoicePayoutSeparatorStyle} />
            <View style={styles.invoiceRowParentStyle}>
              <Text style={styles.invoiceLableTextStyle}>{constant.disputeAmount}</Text>
              <Text style={styles.invoiceValueTextStyle}>
                {decode(item.price)}
              </Text>
            </View>
            <View style={styles.invoicePayoutSeparatorStyle} />
            <TouchableOpacity
              style={styles.invoiceDownloadParentStyle}
              onPress={() =>
                {item.dispute_type == "project" ?
                navigation.navigate('disputesDetail', {item: item,ProjectType:true }):
                  navigation.navigate('disputesDetail', {item: item})}
              }>
              <Text style={styles.incoiceDownloadTextStyle}>{constant.disputeDetails}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Disputes;
