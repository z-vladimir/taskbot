import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FormButton from '../../components/FormButton';
import * as CONSTANT from '../../constants/globalConstants';
import {useNavigation} from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';
import {useSelector, useDispatch} from 'react-redux';
import {BarIndicator} from 'react-native-indicators';
import constant from '../../constants/translation';
import styles from '../../style/styles.js';
import {updateStep, updatePostedItemOne} from '../../Redux/PostProjectSlice';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const PostProjectStepFour = ({stepHandel}) => {
  const navigationforword = useNavigation();
  const onEndReachedCalledDuringMomentum = useRef(true);
  const userDetail = useSelector(state => state.value.userInfo);
  const postedItemOne = useSelector(state => state.postedProject.postedItemOne);
  const settings = useSelector(state => state.setting.settings);
  const token = useSelector(state => state.value.token);
  const [pageNumber, setPageNumber] = useState(1);
  const dispatch = useDispatch();
  const [refreshFlatlist, setRefreshFlatlist] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [show, setShow] = useState(true);
  const [spinner, setSpinner] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [loader, setLoader] = useState(false);
  const [comment, setComment] = useState('');
  const [recommendedFreelacers, setRecommendedFreelacers] = useState([]);

  useEffect(() => {
    getRecommendedFreelancer();
  }, []);

  const getRecommendedFreelancer = () => {
    setLoader(true);

    fetch(
      CONSTANT.BaseUrl +
        'recommended-freelancers?post_id=' +
        userDetail.profile_id +
        '&project_id=' +
        postedItemOne.ID +
        '&paged=1',
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
          setPageNumber(2);
          setRecommendedFreelacers(responseJson.recommended);
        }
        setLoader(false);
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };
  const loadMoreRecommendedFreelancer = () => {
    setSpinner(true);
    fetch(
      CONSTANT.BaseUrl +
        'recommended-freelancers?post_id=' +
        userDetail.profile_id +
        '&project_id=' +
        postedItemOne.ID +
        '&paged=' +
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
          setRecommendedFreelacers(
            recommendedFreelacers.concat(responseJson.recommended),
          );
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
      if (recommendedFreelacers.length >= 10) {
        loadMoreRecommendedFreelancer();
      }
      onEndReachedCalledDuringMomentum.current = true;
    }
  };
  const getFreelancerProfile = async id => {
    setSelectedId(id);
    setLoading(true);
    return fetch(
      CONSTANT.BaseUrl + 'sellers/get_sellers?type=single&profile_id=' + id,
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
        setLoading(false);
        navigationforword.navigate('profileDetail', {
          data: responseJson[0],
        });
      })
      .catch(error => {
        setLoading(false);
        console.error(error);
      });
  };
  const sendInvite = id => {
    setLoadingInvite(true);
    setSelectedId(id);
    axios
      .post(
        CONSTANT.BaseUrl + 'invite-to-bid-project',
        {
          post_id: userDetail.profile_id,
          user_id: id,
          project_id:
            Object.keys(postedItemOne).length != 0 ? postedItemOne.ID : null,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        setLoadingInvite(false);
        if (response.data.type == 'success') {
          Alert.alert('Success', response.data.message_desc);
        } else if (response.data.type == 'error') {
          Alert.alert('Oops', response.data.message_desc);
        }
      })
      .catch(error => {
        setLoadingInvite(false);
        console.log(error);
      });
  };
  return (
    // <ScrollView>
    <View style={[styles.postProjectView, {flex: 1}]}>
      {loader && <Spinner visible={true} color={'#000'} />}

      <FlatList
        style={{marginBottom: 10}}
        showsVerticalScrollIndicator={false}
        data={recommendedFreelacers}
        extraData={refreshFlatlist}
        ListHeaderComponent={
          <Text style={[styles.postProjectMainHeading, {paddingTop: 10}]}>
           {constant.postProjectRecomendedFreelancers}
          </Text>
        }
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
        renderItem={({item, index}) => (
          <View>
            <View
              style={{
                paddingTop: 15,
                alignItems: 'flex-start',
                width: '100%',
              }}>
              <View style={{flexDirection: 'row', paddingVertical: 10}}>
                <Image
                  style={styles.empProjectCardFreelancerImg}
                  source={
                    item.image != ''
                      ? {uri: item.image}
                      : require('../../../assets/images/PlaceholderImage.png')
                  }
                />
                <View
                  style={{
                    justifyContent: 'space-between',
                    paddingHorizontal: 15,
                    flexDirection: 'row',
                    //   backgroundColor: 'red',
                    width: '90%',
                  }}>
                  <View style={{justifyContent: 'space-between'}}>
                    <Text style={styles.postProjectFreelancerName}>
                      {item.seller_name}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        //   paddingVertical: 5,
                        alignItems: 'center',
                      }}>
                      <FontAwesome name={'star'} size={13} color={'#FCCF14'} />
                      <Text style={styles.empProjectFreelancerRating}>
                        {item.rating_data.rating}
                      </Text>
                      <Text style={styles.empAllProjectsNo}>
                        {' '}
                        ({item.rating_data.reviews}) {''}
                      </Text>
                      <Feather name={'eye'} size={13} color={'#999999'} />
                      <Text style={styles.empAllProjectsNo}> {item.views}</Text>
                    </View>
                  </View>
                  {/* <View style={{justifyContent: 'space-between'}}>
                  <Text style={styles.empAllProjectsNo}>Starting from</Text>
                  <Text style={styles.postProjectFreelancerName}>
                    $901.86 /hr
                  </Text>
                </View> */}
                </View>
              </View>
              <View>
                <Text style={styles.postProjectFreelancerTitle}>
                  {item.tagline}
                </Text>
              </View>
            </View>
            <View>
              <FormButton
                buttonTitle={constant.postProjectViewProfile}
                backgroundColor={'#F7F7F7'}
                textColor={'#1C1C1C'}
                loader={selectedId == item.seller_id ? loading : null}
                onPress={() => getFreelancerProfile(item.seller_id)}
              />
              <FormButton
                buttonTitle={constant.postProjectInviteBid}
                backgroundColor={CONSTANT.primaryColor}
                textColor={'#FFFFFF'}
                loader={selectedId == item.seller_id ? loadingInvite : null}
                onPress={() => sendInvite(item.seller_id)}
                // loader={loader}
              />
            </View>
          </View>
        )}
      />
      {spinner == true && (
        <View style={{marginBottom: 20, marginTop: 20}}>
          <BarIndicator count={5} size={20} color={'#0A0F26'} />
        </View>
      )}
    </View>
    // </ScrollView>
  );
};

export default PostProjectStepFour;
