import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import React, {useState, useRef} from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Carousel from 'react-native-snap-carousel';
import styles from '../../style/styles';
import FormButton from '../../components/FormButton';
import Header from '../../components/Header';
import * as CONSTANT from '../../constants/globalConstants';
import constant from '../../constants/translation';
import {decode} from 'html-entities';
import HTML from 'react-native-render-html';
import {useSelector, useDispatch} from 'react-redux';
import RBSheet from 'react-native-raw-bottom-sheet';
import FormInput from '../../components/FormInput';

const OrderDetail = ({navigation, route}) => {
  const userDetail = useSelector(state => state.value.userInfo);
  const token = useSelector(state => state.value.token);
  const settings = useSelector(state => state.setting.settings);
  const verify = useSelector(state => state.value.verified);
  const sliderWidth = Dimensions.get('window').width;
  const RBSheetAddCredit = useRef();
  const scrollRef = useRef();
  const itemWidth = 300;
  const data = route.params.data;
  const tagsStyles = {
    body: {
      fontFamily: 'OpenSans-Regular',
      fontSize: 15,
      letterSpacing: 0.5,
      lineHeight: 24,
      color: '#0A0F26',
    },
  };

  const [packageIndex, setPackageIndex] = useState(0);
  const [servicesIndex, setServicesIndex] = useState(null);
  const [amount, setAmount] = useState('');
  const [selectedServicesArray, setSelectedServicesArray] = useState([]);
  const [disable, setDisable] = useState(false);
  const [proceedLoader, setProceedLoader] = useState(false);
  const [addingData, setAddingData] = useState(false);
  const [show, setShow] = useState(false);
  const [totalPrice, setTotalPrice] = useState(
    data.attributes[packageIndex].reg_price,
  );
  const renderItem = ({item, index}) => {
    return (
      <View style={styles.imageCarouselView}>
        <Image
          // resizeMode='contain'
          style={styles.imageCarouselImage}
          source={item.url}
        />
      </View>
    );
  };

  const AddInBudget = (item, index) => {
    setServicesIndex(index);
    if (selectedServicesArray.includes(item)) {
      const index = selectedServicesArray.indexOf(item);
      if (index > -1) {
        calculateTotal('subtract', item.reg_price);
        selectedServicesArray.splice(index, 1);
      }
      setAddingData(false);
    } else {
      selectedServicesArray.push(item);
      calculateTotal('add', item.reg_price);
      setAddingData(true);
    }
  };

  const calculateTotal = (type, value) => {
    if (type == 'add') {
      setTotalPrice(parseInt(totalPrice) + parseInt(value));
    } else if (type == 'subtract') {
      setTotalPrice(parseInt(totalPrice) - parseInt(value));
    }
  };

  const proceedToCheckout = () => {
    setProceedLoader(true);
    var wallet = '';
    if (disable == true) {
      wallet = 'on';
    }
    var servicesArray = [];
    for (var i = 0; i < selectedServicesArray.length; i++) {
      servicesArray.push(selectedServicesArray[i].ID);
    }
    fetch(
      CONSTANT.BaseUrl +
        'order-tasks?type=single&post_id=' +
        userDetail.profile_id +
        '&product_task=' +
        data.attributes[packageIndex].key +
        '&wallet=' +
        wallet +
        '&id=' +
        data.task_id +
        '&subtasks=' +
        servicesArray,
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
          if (responseJson.hasOwnProperty("order_id")) {
            Alert.alert(constant.SuccessText, 'Order placed Successfully!');
            navigation.navigate("task",{orderType: "any"});
          } else {
            navigation.navigate('checkout', {link: responseJson.checkout_url});
          }
          setProceedLoader(false);
        }
        if (responseJson.type == 'error') {
          setProceedLoader(false);
          Alert.alert(constant.OopsText, responseJson.message_desc);
        }
      })
      .catch(error => {
        setProceedLoader(false);
        console.error(error);
      });
  };
  const addWallet = () => {
    if (amount != '') {
      setProceedLoader(true);
      fetch(
        CONSTANT.BaseUrl +
          'add-wallet?post_id=' +
          userDetail.profile_id +
          '&amount=' +
          amount,
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
            setProceedLoader(false);
            setAmount('');
            RBSheetAddCredit.current.close();
            navigation.navigate('checkout', {link: responseJson.checkout_url});
            // navigation.navigate('home');
          } else if (responseJson.type == 'error') {
            Alert.alert(constant.OopsText, responseJson.message_desc);
          }
        })
        .catch(error => {
          setProceedLoader(false);
          console.error(error);
        });
    } else {
      Alert.alert(constant.onPress, constant.orderDetailsAlertError);
    }
  };

  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={constant.orderDetailsTitle}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
        backIcon={true}
      />
      <ScrollView
      ref={scrollRef}
        style={{backgroundColor: '#f7f7f7'}}
        showsVerticalScrollIndicator={false}>
        {(verify != '1' && settings.identity_verification == 1)&& (
          <View style={styles.orderDetailVerificationView}>
            <Text style={styles.orderDetailVerificationHeading}>
              {constant.orderDetailsVerification}
            </Text>
            <Text style={styles.orderDetailVerificationWalletDesc}>
              {constant.orderDetailsVerifyText}
            </Text>
            <FormButton
              onPress={() => navigation.navigate('identityInformation')}
              buttonTitle={constant.orderDetailsVerifyBtn}
              backgroundColor={'#F97316'}
              textColor={'#fff'}
            />
          </View>
        )}
        {/* <View style={{marginTop: 10}}>
          <Carousel
            loop={true}
            layout={'default'}
            data={imagesArray}
            renderItem={renderItem}
            sliderWidth={sliderWidth}
            itemWidth={itemWidth}
            autoplay={false}
            // autoplayDelay={500}
            // autoplayInterval={1500}
          />
        </View> */}
        <View style={styles.orderDetailNameView}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(data.categories).map((key, index) => (
              <>
                <Text style={styles.taskDetailSkillList}>
                  {key[1]}{' '}
                  {Object.keys(data.categories).length - 1 == index ? '' : ','}{' '}
                </Text>
              </>
            ))}
          </ScrollView>
          <Text style={styles.orderDetailNameText}>{data.task_name}</Text>
          <View style={styles.orderDetailRatingView}>
            <FontAwesome name={'star'} size={18} color={'#FFD101'} />
            <Text style={styles.cardratingTextStyle}>
              {data.average_rating}
              <Text style={styles.cardRatingViewTextStyle}>
                {' '}
                ({data.review_users})
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.orderDetailFeaturesView}>
          <Text style={styles.orderDetailFeaturesHeading}>
            {constant.orderDetailsFeatures}
          </Text>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data.attributes[packageIndex].fields}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => (
              <View style={styles.taskDetailPlansPackageView}>
                <Feather
                  name="check"
                  type="check"
                  color={item.plan_value == 'yes' ? '#22C55E' : '#DDDDDD'}
                  size={24}
                />
                <Text style={styles.taskDetailPlansPackageText}>
                  {item.label}
                </Text>
              </View>
            )}
          />
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data.custom_fields}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => (
              <View style={styles.taskDetailPlansPackageView}>
                <Feather
                  name="check"
                  type="check"
                  color={'#22C55E'}
                  size={24}
                />
                <Text style={styles.taskDetailPlansPackageText}>
                  {item.title} (
                  {packageIndex == 0
                    ? item.basic
                    : packageIndex == 1
                    ? item.premium
                    : item.pro}
                  )
                </Text>
              </View>
            )}
          />
        </View>
        <View style={styles.orderDetailServicesView}>
          <Text style={styles.orderDetailServicesHeading}>
            {constant.orderDetailsServices}
          </Text>
          <FlatList
            data={data.sub_tasks}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => (
              <TouchableOpacity activeOpacity={0.9}>
                <View
                  style={
                    data.sub_tasks.length - 1 == index
                      ? styles.orderDetailServicesListViewLast
                      : styles.orderDetailServicesListView
                  }>
                  <View style={[styles.orderDetailServicesListHeader]}>
                    <TouchableOpacity
                      style={[styles.orderDetailRatingView, {width: '80%'}]}
                      onPress={() => AddInBudget(item, index)}>
                      {selectedServicesArray.includes(item) ? (
                        <View style={styles.checkBoxCheck}>
                          <FontAwesome
                            name="check"
                            type="check"
                            color={'#fff'}
                            size={14}
                          />
                        </View>
                      ) : (
                        <View style={styles.checkBoxUncheck} />
                      )}

                      <Text style={styles.orderDetailServicesListTitle}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                    <View
                      style={{
                        justifyContent: 'center',
                        width: '20%',
                        alignItems: 'center',
                      }}>
                      <Text style={styles.orderDetailServicesListPrice}>
                        {decode(item.price)}
                      </Text>
                    </View>
                  </View>
                  <View style={{width: '100%'}}>
                    <HTML
                      tagsStyles={tagsStyles}
                      source={{html: item.content}}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
        <View style={{height: 20}} />
        <View style={styles.orderDetailPlanView}>
          <Text style={styles.orderDetailHeadingOrder}>
            {constant.orderDetailsText}
          </Text>
          <View style={styles.orderDetailPlanSelectedPlan}>
            <View style={styles.orderDetailRatingView}>
              <View style={styles.orderDetailPlanSelectedPlanView}>
                <ImageBackground
                  // imageStyle={{borderRadius: 56 / 2}}
                  style={styles.orderDetailPlanSelectedPlanImage}
                  source={
                    packageIndex == 0
                      ? require('../../../assets/images/plan.png')
                      : packageIndex == 1
                      ? require('../../../assets/images/premium.png')
                      : require('../../../assets/images/popular.png')
                  }
                />
                <View style={styles.orderDetailPlanSelectedPlanTitleView}>
                  <Text style={styles.orderDetailPlanSelectedPlanTitle}>
                    {data.attributes[packageIndex].title}
                  </Text>
                  <Text style={styles.orderDetailPlanSelectedPlanPrice}>
                    {decode(data.attributes[packageIndex].price)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShow(!show)}
                style={{width: '10%'}}>
                <Feather
                  name={show ? 'chevron-down' : 'chevron-right'}
                  type={show ? 'chevron-down' : 'chevron-right'}
                  color={'#1C1C1C'}
                  size={24}
                />
              </TouchableOpacity>
            </View>
            {show && (
              <View style={{marginTop: 20}}>
                <TouchableOpacity
                  onPress={() => {
                    setPackageIndex(0), setShow(false);
                  }}
                  style={[
                    styles.orderDetailSelectPlanMainView,
                    {
                      backgroundColor: packageIndex == 0 ? '#fff' : '#f7f7f7',
                    },
                  ]}>
                  <View style={styles.orderDetailRatingView}>
                    <View
                      style={[
                        styles.orderDetailSelectPlanCheckCircle,
                        {
                          backgroundColor:
                            packageIndex == 0 ? '#22C55E' : '#fff',
                        },
                      ]}>
                      <View
                        style={styles.orderDetailSelectPlanCheckInnerCircle}
                      />
                    </View>
                    <ImageBackground
                      style={styles.taskDetailReviewItemImage}
                      source={require('../../../assets/images/plan.png')}
                    />
                    <Text style={styles.orderDetailSelectPlanName}>Basic</Text>
                  </View>
                  <Text style={styles.orderDetailSelectPlanPrice}>
                    {decode(data.attributes[0].price)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setPackageIndex(1), setShow(false);
                  }}
                  style={[
                    styles.orderDetailSelectPlanMainView,
                    {
                      backgroundColor: packageIndex == 1 ? '#fff' : '#f7f7f7',
                    },
                  ]}>
                  <View style={styles.orderDetailRatingView}>
                    <View
                      style={[
                        styles.orderDetailSelectPlanCheckCircle,
                        {
                          backgroundColor:
                            packageIndex == 1 ? '#22C55E' : '#fff',
                        },
                      ]}>
                      <View
                        style={styles.orderDetailSelectPlanCheckInnerCircle}
                      />
                    </View>
                    <ImageBackground
                      // imageStyle={{borderRadius: 56 / 2}}
                      style={styles.taskDetailReviewItemImage}
                      source={require('../../../assets/images/premium.png')}
                    />
                    <Text style={styles.orderDetailSelectPlanName}>
                      {constant.orderDetailsPopular}
                    </Text>
                  </View>
                  <Text style={styles.orderDetailSelectPlanPrice}>
                    {decode(data.attributes[1].price)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setPackageIndex(2), setShow(false);
                  }}
                  style={[
                    styles.orderDetailSelectPlanMainView,
                    {
                      backgroundColor: packageIndex == 2 ? '#fff' : '#f7f7f7',
                    },
                  ]}>
                  <View style={styles.orderDetailRatingView}>
                    <View
                      style={[
                        styles.orderDetailSelectPlanCheckCircle,
                        {
                          backgroundColor:
                            packageIndex == 2 ? '#22C55E' : '#fff',
                        },
                      ]}>
                      <View
                        style={styles.orderDetailSelectPlanCheckInnerCircle}
                      />
                    </View>
                    <ImageBackground
                      // imageStyle={{borderRadius: 56 / 2}}
                      style={styles.taskDetailReviewItemImage}
                      source={require('../../../assets/images/popular.png')}
                    />
                    <Text style={styles.orderDetailSelectPlanName}>
                      {constant.orderDetailsPremium}
                    </Text>
                  </View>
                  <Text style={styles.orderDetailSelectPlanPrice}>
                    {decode(data.attributes[2].price)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.orderDetailAdditionalfeatureView}>
            <Text style={styles.orderDetailAdditionalfeatureHeading}>
              {constant.orderDetailsAdditionalFeatures}
            </Text>
            <View style={styles.orderDetailServicesListHeader}>
              <Text style={styles.orderDetailAdditionalfeatureListText}>
                {data.attributes[packageIndex].title}
              </Text>
              <Text style={styles.orderDetailAdditionalfeatureListTextValue}>
                ({decode(data.attributes[packageIndex].price)})
              </Text>
            </View>
            <FlatList
              data={selectedServicesArray}
              keyExtractor={(x, i) => i.toString()}
              renderItem={({item, index}) => (
                <View style={styles.orderDetailServicesListHeader}>
                  <Text style={styles.orderDetailAdditionalfeatureListText}>
                    {item.title}
                  </Text>
                  <Text
                    style={styles.orderDetailAdditionalfeatureListTextValue}>
                    ({decode(item.price)})
                  </Text>
                </View>
              )}
            />

            <View style={styles.orderDetailAdditionalfeatureSeparator} />
            <View style={styles.orderDetailServicesListHeader}>
              <Text style={styles.orderDetailAdditionalfeatureListText}>
                {constant.orderDetailsSubTotal}
              </Text>
              <Text style={styles.orderDetailAdditionalfeatureListTextValue}>
                ({decode(settings.price_format.symbol)}
                {parseInt(totalPrice).toFixed(2)})
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.orderDetailWalletView}>
          <TouchableOpacity
            style={styles.orderDetailRatingView}
            onPress={() => setDisable(!disable)}>
            {disable ? (
              <View style={styles.checkBoxCheck}>
                <FontAwesome
                  name="check"
                  type="check"
                  color={'#fff'}
                  size={14}
                />
              </View>
            ) : (
              <View style={styles.checkBoxUncheck} />
            )}
            <Text style={styles.orderDetailWalletHeading}>
              {constant.orderDetailsUseWalletcredit}
            </Text>
          </TouchableOpacity>
          <Text style={styles.orderDetailVerificationWalletDesc}>
            {constant.orderDetailsWalletText}
          </Text>
          <FormButton
            buttonTitle={constant.orderDetailsAddFunds}
            backgroundColor={'#FCCF14'}
            textColor={'#1C1C1C'}
            onPress={() => verify == '1' ? RBSheetAddCredit.current.open() : scrollRef.current.scrollTo(0, 0)}
          />
        </View>
        <View style={{marginTop: -10}}>
          <FormButton
            onPress={() =>  verify == '1' ? proceedToCheckout(): scrollRef.current.scrollTo(0, 0)}
            buttonTitle={constant.orderDetailsSecureCheckout}
            iconName={'lock'}
            backgroundColor={CONSTANT.primaryColor}
            textColor={'#fff'}
            loader={proceedLoader}
          />
        </View>
      </ScrollView>
      <RBSheet
        ref={RBSheetAddCredit}
        height={Dimensions.get('window').height * 0.4}
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
              {constant.orderDetailsAddCredit}
            </Text>
            <Feather
              onPress={() => RBSheetAddCredit.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'x'}
              size={20}
              color={'#1C1C1C'}
            />
          </View>

          <ScrollView
            style={{paddingHorizontal: 20, paddingVertical: 10}}
            showsVerticalScrollIndicator={false}>
            <FormInput
              labelValue={amount}
              onChangeText={val => setAmount(val)}
              placeholderText={constant.orderDetailsEnterAmount}
            />
            <FormButton
              onPress={() => addWallet()}
              buttonTitle={constant.orderDetailsAddFund}
              backgroundColor={CONSTANT.primaryColor}
              iconName={'arrow-right'}
              textColor={'#fff'}
              loader={proceedLoader}
            />
            <View style={styles.RbSheetAddCreditDescConatainer}>
              <Text style={styles.RbSheetAddCreditAsterisk}>*</Text>
              <Text style={styles.RbSheetAddCreditDescription}>
                {constant.orderDetailsWoocommerce}
              </Text>
            </View>
          </ScrollView>
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

export default OrderDetail;
