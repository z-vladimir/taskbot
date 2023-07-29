import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  TextInput,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Header from '../../components/Header';
import styles from '../../style/styles.js';
import * as CONSTANT from '../../constants/globalConstants';
import constant from '../../constants/translation';
import BuyerProjectCard from './BuyerProjectCard';
import SellerProjectCard from './SellerProjectCard';
import {useSelector, useDispatch} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import {BarIndicator} from 'react-native-indicators';
import RBSheet from 'react-native-raw-bottom-sheet';

const MyProjectListing = () => {
  const userDetail = useSelector(state => state.value.userInfo);
  const token = useSelector(state => state.value.token);
  const onEndReachedCalledDuringMomentum = useRef(true);
  const [emptyTask, setEmptyTask] = useState(false);
  const [buyerProjectsList, setBuyerProjectsList] = useState();
  const [sellerProjects, setSellerProjects] = useState();
  const [loader, setLoader] = useState(true);
  const [searchLoader, setSearchLoader] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [spinner, setSpinner] = useState(false);
  const [refreshFlatlist, setRefreshFlatlist] = useState(false);
  const isFocused = useIsFocused();
  const [text, setText] = useState('');
  const RBSheetSortProject = useRef();
  const [sortedValue, setSortedValue] = useState('any');
  const [sortedName, setSortedName] = useState(constant.myProjectListingAllProjects);
  const [sortType, setSortType] = useState([
    {name: constant.myProjectListingAllProjects , value: 'any'},
    {name: constant.myProjectListingDrafted , value: 'draft'},
    {name: constant.myProjectListingPublished , value: 'published'},
    {name: constant.myProjectListingOngoing , value: 'hired'},
    {name: constant.myProjectListingCompleted , value: 'completed'},
    {name: constant.myProjectListingDisputed , value: 'disputed'},
    {name: constant.myProjectListingRefunded , value: 'refunded'},
    {name: constant.myProjectListingCancelled , value: 'cancelled'},
  ]);

  useEffect(() => {
    if (isFocused) {
      userDetail.user_type == 'sellers'
        ? getSellerProjects()
        : getBuyerProjects();
    }
  }, [isFocused, sortedValue]);
  const getBuyerProjects = () => {
    setLoader(true);
  
    fetch(
      CONSTANT.BaseUrl +
        'get-projects?post_id=' +
        userDetail.profile_id +
        '&user_id=' +
        userDetail.user_id +
        '&sortby=' +
        sortedValue +
        '&page_number=1',

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
          setEmptyTask(true);
          setPageNumber(2);
          setBuyerProjectsList(responseJson.project_data);
          setRefreshFlatlist(!refreshFlatlist);
        }
        setSearchLoader(false);
        setLoader(false);
      })
      .catch(error => {
        setSearchLoader(false);
        setLoader(false);
        console.error(error);
      });
  };
  const loadMoreBuyerProjects = () => {
    setSpinner(true);
    fetch(
      CONSTANT.BaseUrl +
        'get-projects?post_id=' +
        userDetail.profile_id +
        '&user_id=' +
        userDetail.user_id +
        '&sortby=' +
        sortedValue +
        '&page_number=' +
        pageNumber,

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
          setPageNumber(pageNumber + 1);
          setBuyerProjectsList(
            buyerProjectsList.concat(responseJson.project_data),
          );
          setRefreshFlatlist(!refreshFlatlist);
        }
        setSpinner(false);
      })
      .catch(error => {
        setSpinner(false);
        console.error(error);
      });
  };
  const onEndReachedHandler = () => {
    if (!onEndReachedCalledDuringMomentum.current) {
      if (buyerProjectsList.length >= 10) {
        loadMoreBuyerProjects();
      }
      onEndReachedCalledDuringMomentum.current = true;
    }
  };
  const getSellerProjects = () => {
    setLoader(true);
    fetch(
      CONSTANT.BaseUrl +
        'get-proposals?&type=sellers&post_id=' +
        userDetail.profile_id +
        '&user_id=' +
        userDetail.user_id +
        '&sortby=' +
        sortedValue.toString() +
        '&page_number=1',
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
          setSellerProjects(responseJson.proposal_data);
          // setSellerProjects([]);
          setPageNumber(2);
        }
        setLoader(false);
        setSearchLoader(false);
      })
      .catch(error => {
        setLoader(false);
        setSearchLoader(false);
        console.error(error);
      });
  };
  const onEndReachedHandlerSeller = () => {
    if (!onEndReachedCalledDuringMomentum.current) {
      if (sellerProjects.length >= 10) {
        loadMoreSellerProjects();
      }
      onEndReachedCalledDuringMomentum.current = true;
    }
  };

  const loadMoreSellerProjects = () => {
    setSpinner(true);
    fetch(
      CONSTANT.BaseUrl +
        'get-proposals?&type=sellers&post_id=' +
        userDetail.profile_id +
        '&user_id=' +
        userDetail.user_id +
        '&sortby=' +
        sortedValue.toString() +
        '&page_number=' +
        pageNumber,
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
        console.log('responseJson SellerProjects', responseJson);
        if (responseJson.type == 'success') {
          setSellerProjects(sellerProjects.concat(responseJson.proposal_data));
          setPageNumber(pageNumber + 1);
        }
        setSpinner(false);
        setSearchLoader(false);
      })
      .catch(error => {
        setSpinner(false);
        setSearchLoader(false);
        console.error(error);
      });
  };

  const handelSortBy = (value, name) => {
    setSortedName(name);
    setSortedValue(value);
    RBSheetSortProject.current.close();
    setSearchLoader(true);
  };
  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={constant.myProject}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
      />
      {loader && <Spinner visible={true} color={'#000'} />}
      <View
        style={[
          styles.empAllProjectsView,
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 15,
            marginBottom: 5,
            // backgroundColor:"red"
          },
        ]}>
        <Text style={styles.empAllProjectsHeading}>{sortedName}</Text>
        <View>
          {searchLoader ? (
            <ActivityIndicator size="small" color={'#1C1C1C'} />
          ) : (
            <Feather
              name={'chevron-down'}
              size={18}
              color={'#999999'}
              style={styles.ProjectDetailsPropertyListIcon}
              onPress={() => RBSheetSortProject.current.open()}
            />
          )}
        </View>
      </View>
      <View
        style={{borderTopWidth: 1, borderColor: '#DDDDDD', marginVertical: 10}}
      />
      {userDetail.user_type == 'sellers' ? (
        <FlatList
          style={{marginBottom: 10}}
          showsVerticalScrollIndicator={false}
          data={sellerProjects}
          extraData={refreshFlatlist}
          ListEmptyComponent={
            !loader && (
              <View style={styles.NodataFoundContainer}>
                <Image
                  resizeMode="contain"
                  style={styles.NodataFoundImg}
                  source={require('../../../assets/images/empty.png')}
                />
                <Text style={styles.NodataFoundText}>{constant.NoRecord}</Text>
              </View>
            )
          }
          keyExtractor={(x, i) => i.toString()}
          listKey={(item, index) => `_keys${index.toString()}`}
          onEndReached={() => onEndReachedHandlerSeller()}
          onEndReachedThreshold={0.1}
          onMomentumScrollBegin={() => {
            onEndReachedCalledDuringMomentum.current = false;
          }}
          renderItem={({item, index}) => (
            <>
            {item.project_detail.length != 0 &&
              <SellerProjectCard item={item} selectedIndex={index} />}
              </>
          )}
        />
      ) : (
        <FlatList
          style={{marginBottom: 10}}
          showsVerticalScrollIndicator={false}
          data={buyerProjectsList}
          extraData={refreshFlatlist}
          ListEmptyComponent={
            !loader && (
              <View style={styles.NodataFoundContainer}>
                <Image
                  resizeMode="contain"
                  style={styles.NodataFoundImg}
                  source={require('../../../assets/images/empty.png')}
                />
                <Text style={styles.NodataFoundText}>{constant.NoRecord}</Text>
              </View>
            )
          }
          keyExtractor={(x, i) => i.toString()}
          listKey={(item, index) => `_key${index.toString()}`}
          onEndReached={() => onEndReachedHandler()}
          onEndReachedThreshold={0.1}
          onMomentumScrollBegin={() => {
            onEndReachedCalledDuringMomentum.current = false;
          }}
          renderItem={({item, index}) => <BuyerProjectCard item={item} />}
        />
      )}
      {spinner == true && (
        <View style={{marginBottom: 20, marginTop: 20}}>
          <BarIndicator count={5} size={20} color={'#0A0F26'} />
        </View>
      )}
      <RBSheet
        ref={RBSheetSortProject}
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
            <Text style={styles.RBSheetHeaderTextStyle}>{constant.myProjectListingSortby}</Text>
            <Feather
              onPress={() => RBSheetSortProject.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'x'}
              size={20}
              color={'#1C1C1C'}
            />
          </View>
          <FlatList
            style={{marginBottom: 10, marginTop: 5}}
            showsVerticalScrollIndicator={false}
            data={sortType}
            extraData={refreshFlatlist}
            keyExtractor={(x, i) => i.toString()}
            listKey={(item, index) => `_key${index.toString()}`}
            renderItem={({item, index}) => (
              <TouchableOpacity
                style={[
                  styles.RBSheetSortView,
                  {
                    backgroundColor:
                      sortedValue == item.value ? '#F7F7F7' : '#FFFFFF',
                  },
                ]}
                onPress={() => handelSortBy(item.value, item.name)}>
                <View style={styles.RBSheetSortValue}>
                  <Text style={styles.RBSheetSortText}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

export default MyProjectListing;
