import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import Header from '../../components/Header';
import Feather from 'react-native-vector-icons/Feather';
import FreelancerCard from '../home/homeCards/freelancerCard';
import {useSelector, useDispatch} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
// import Spinner from 'react-native-loading-spinner-overlay';
import * as CONSTANT from '../../constants/globalConstants';
import {updateSavedSellers, updateSavedTasks} from '../../Redux/SavedSlice';
import styles from '../../style/styles';
import SkeletonFreelancerCard from '../home/homeCards/SkeletonFreelancerCard';
import {
  BarIndicator,
  UIActivityIndicator,
  SkypeIndicator,
} from 'react-native-indicators';
import constant from '../../constants/translation';
import axios from 'axios';

const SearchResult = ({navigation, route}) => {
  const userDetail = useSelector(state => state.value.userInfo);
  const token = useSelector(state => state.value.token);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const [refreshFlatlist, setRefreshFlatList] = useState(false);
  const [freelancers, setFreelancers] = useState([]);
  const [page, setpage] = useState(3);
  const [emptyFreelancerList, setEmptyFreelancerList] = useState(false);
  const [freelancerSpinner, setFreelancerSpinner] = useState(true);
  const onEndReachedCalledDuringMomentum = useRef(true);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (isFocused) {
      freelancers.length = 0;
      getFreelancers();
      getsavedItems();
    }
  }, [isFocused]);
  const getsavedItems = async () => {
    var savedSellers = [];

    savedSellers.length = 0;
    return fetch(
      CONSTANT.BaseUrl +
        'get-saved-items?post_id=' +
        userDetail.profile_id +
        '&type=sellers',
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
        Object.entries(responseJson.items).map(([key, value]) =>
          savedSellers.push({
            slug: key,
            id: value,
          }),
        );
        dispatch(updateSavedSellers(savedSellers));
      })
      .catch(error => {
        console.error(error);
      });
  };

  const getFreelancers = async () => {
    setFreelancerSpinner(true);
    axios
      .get(CONSTANT.BaseUrl + 'sellers/get_sellers', {
        params: {
          type: 'search',
          show_posts: '20',
          keyword: route.params.text,
          min_price: route.params.min,
          max_price: route.params.max,
          location: route.params.location,
          seller_type: route.params.sellerType,
          english_level: route.params.englishLevel,
        },
      })
      .then(response => {
        if (response.data.length == 0) {
          setEmptyFreelancerList(true);
          setFreelancerSpinner(false);
          setRefreshFlatList(!refreshFlatlist);
        } else {
          setFreelancers(response.data);
          setRefreshFlatList(!refreshFlatlist);
          setFreelancerSpinner(false);
          setRefreshFlatList(!refreshFlatlist);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };
  const loadMoreData = async () => {
    setLoader(true);
    return fetch(
      CONSTANT.BaseUrl +
        'sellers/get_sellers?type=search&keyword=' +
        route.params.text +
        '&min_price=' +
        route.params.min +
        '&max_price=' +
        route.params.max +
        '&location=' +
        route.params.location +
        '&seller_type=' +
        route.params.selectedSellerType +
        '&english_level=' +
        route.params.selectedSkills +
        '&page_number=' +
        page.toString(),
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
        setpage(page + 1);
        let users = responseJson;
        setFreelancers(freelancers.concat(users));
        setRefreshFlatList(!refreshFlatlist);
        setLoader(false);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const onEndReachedHandler = () => {
    if (!onEndReachedCalledDuringMomentum.current) {
      loadMoreData();
      onEndReachedCalledDuringMomentum.current = true;
    }
  };

  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={constant.searchResultTitle}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
        backIcon={true}
      />
      <View
        style={{backgroundColor: '#fff', flex: 1}}
        // showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchResultTitleParentStyle}>
          <Text
            style={styles.searchResultTextStyle}
            onPress={() => loadMoreData()}>
            {freelancers.length} {constant.searchResultResultFound}
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('narrowSearch', {type: 'freelancer'})
            }
            style={styles.searchResultIconParentStyle}>
            <Feather name={'sliders'} size={20} color={'#1C1C1C'} />
          </TouchableOpacity>
        </View>

        {freelancerSpinner ? (
          <>
            <SkeletonFreelancerCard />
            <SkeletonFreelancerCard />
            <SkeletonFreelancerCard />
            <SkeletonFreelancerCard />
            <SkeletonFreelancerCard />
            <SkeletonFreelancerCard />
            <SkeletonFreelancerCard />
            <SkeletonFreelancerCard />
            <SkeletonFreelancerCard />
            <SkeletonFreelancerCard />
          </>
        ) : (
          <>
            <FlatList
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <>
                  <View style={{height: 70}}></View>
                  <View style={styles.serachResultNoItemView}>
                    <Text style={styles.serachResultNoItemHeading}>
                      {constant.searchResultNoMatch}
                    </Text>
                    <Text style={styles.serachResultNoItemDescription}>
                      {constant.searchResultText}
                    </Text>
                  </View>
                </>
              }
              data={freelancers}
              keyExtractor={(x, i) => i.toString()}
              extraData={refreshFlatlist}
              onEndReached={() => onEndReachedHandler()}
              onEndReachedThreshold={0.1}
              onMomentumScrollBegin={() => {
                onEndReachedCalledDuringMomentum.current = false;
              }}
              renderItem={({item, index}) => (
                <TouchableOpacity activeOpacity={0.9}>
                  <FreelancerCard item={item} />
                </TouchableOpacity>
              )}
            />
            {loader == true && (
              <View style={{marginBottom: 20}}>
                <BarIndicator count={5} size={20} color={'#0A0F26'} />
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchResult;
