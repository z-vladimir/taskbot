import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import Header from '../../components/Header';
import * as CONSTANT from '../../constants/globalConstants';
import axios from 'axios';
import Feather from 'react-native-vector-icons/Feather';
import Spinner from 'react-native-loading-spinner-overlay';
import styles from '../../style/styles.js';
import {useIsFocused} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import TaskCard from '../home/homeCards/taskCard';
import {SwipeListView} from 'react-native-swipe-list-view';
import FreelancerCard from '../home/homeCards/freelancerCard';
import {ScrollView} from 'react-native-gesture-handler';
import {BarIndicator} from 'react-native-indicators';
import constant from '../../constants/translation';
import ProjectListingCard from '../exploreProjects/projectListingCard';
import {
  updateSavedSellers,
  updateSavedTasks,
  updateSavedProjects,
} from '../../Redux/SavedSlice';

const SavedItem = () => {
  const token = useSelector(state => state.value.token);
  const userDetail = useSelector(state => state.value.userInfo);
  const [selectedPlan, setSelectedPlan] = useState('sellers');
  const [pageNumberTask, setPageNumberTask] = useState(2);
  const [loader, setLoader] = useState(false);
  const [pageLoader, setPageLoader] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [savedSeller, setSavedSeller] = useState([]);
  const [savedTask, setSavedTask] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [emptyFreelancerList, setEmptyFreelancerList] = useState(false);
  const isFocused = useIsFocused();
  const [page, setpage] = useState(2);
  const onEndReachedCalledDuringMomentum = useRef(true);
  const savedList = useSelector(state => state.saved.savedProjects);

  const dispatch = useDispatch();
  useEffect(() => {
    if (isFocused) {
      getSavedSeller();
      getSavedTask();
      getSavedProjects();
    }
  }, [isFocused]);

  const getSavedSeller = () => {
    setLoader(true);
    fetch(
      CONSTANT.BaseUrl +
        'sellers/get_sellers?profile_id=' +
        userDetail.profile_id +
        '&type=saved',

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
        if (responseJson.length == 0) {
          setEmptyFreelancerList(true);
          setLoader(false);
        } else {
          setEmptyFreelancerList(false);
          setSavedSeller(responseJson);
          setLoader(false);
        }
      })

      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };
  const getSavedTask = () => {
    fetch(
      CONSTANT.BaseUrl +
        'get_tasks?profile_id=' +
        userDetail.profile_id +
        '&type=saved&page_number=1',
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
        if (responseJson.length == 0) {
          setLoader(false);
        } else {
          setSavedTask(responseJson.tasks);
          setPageNumberTask(2)
          setLoader(false);
        }
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };
  const onEndReachedHandlerTask = () => {
    if (!onEndReachedCalledDuringMomentum.current) {
      if (savedTask.length >= 10) {
        // loadMoreSavedTask();
      }
      onEndReachedCalledDuringMomentum.current = true;
    }
  };
  // const loadMoreSavedTask = () => {
  //   setSpinner(true);
  //   fetch(
  //     CONSTANT.BaseUrl +
  //       'tasks/get_tasks?profile_id=' +
  //       userDetail.profile_id +
  //       '&type=savedpage_number='+pageNumberTask,
  //     {
  //       method: 'GET',
  //       headers: {
  //         Accept: 'application/json',
  //         'Content-Type': 'application/json',
  //       },
  //     },
  //   )
  //     .then(response => response.json())
  //     .then(responseJson => {
  //       if (responseJson.length == 0) {
  //         setSpinner(false);
  //       } else {
  //         setSavedTask(savedTask.concat(responseJson.tasks));
  //         setPageNumberTask(pageNumberTask+1)
  //         setSpinner(false);
  //       }
  //     })
  //     .catch(error => {
  //       setSpinner(false);
  //       console.error(error);
  //     });
  // };
  const getSavedProjects = () => {
    setLoader(true);
    fetch(
      CONSTANT.BaseUrl +
        'projects/get_projects?profile_id=' +
        userDetail.profile_id +
        '&type=saved',

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
        if (responseJson.length == 0) {
          setLoader(false);
        } else {
          setSavedProjects(responseJson.projects);
          setLoader(false);
        }
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };

  const RemoveToSaveList = (type, id) => {
    setLoader(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'update-saveditem',
        {
          post_id: userDetail.profile_id,
          action: 'taskbot_saved_items',
          item_id: id,
          type: type,
          option: '',
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
          if (type == 'sellers') {
            getSavedSeller();
          } else if (type == 'tasks') {
            getSavedTask();
          } else if (type == 'projects') {
            var lists = savedList.filter(x => {
              return x.id != id;
            });
            dispatch(updateSavedProjects(lists));
            getSavedProjects();
          }
          // Alert.alert('Success', response.data.message_desc);
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

  const loadMoreData = async () => {
    setPageLoader(true);
    fetch(
      CONSTANT.BaseUrl +
        'sellers/get_sellers?profile_id=' +
        userDetail.profile_id +
        '&type=saved' +
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
        setSavedSeller(savedSeller.concat(users));
        setRefreshFlatList(!refreshFlatlist);
        setPageLoader(false);
      })

      .catch(error => {
        setPageLoader(false);
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
        title={constant.savedItemTitle}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
      />
      {loader && <Spinner visible={true} color={'#000'} />}

      <View style={styles.savedItemMainView}>
        <TouchableOpacity
          onPress={() => setSelectedPlan('sellers')}
          style={[
            styles.savedItemSingleView,
            {
              backgroundColor: selectedPlan == 'sellers' ? '#fff' : '#F7F7F7',
              borderBottomWidth: selectedPlan == 'sellers' ? 0 : 1,
            },
          ]}>
          <Text
            style={[
              styles.savedItemSingleViewText,
              {
                color: selectedPlan == 'sellers' ? '#1C1C1C' : '#999999',
              },
            ]}>
            {constant.savedItemSellers}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedPlan('tasks')}
          style={[
            styles.savedItemSingleView,
            {
              backgroundColor: selectedPlan == 'tasks' ? '#fff' : '#F7F7F7',
              borderBottomWidth: selectedPlan == 'tasks' ? 0 : 1,
            },
          ]}>
          <Text
            style={[
              styles.savedItemSingleViewText,
              {
                color: selectedPlan == 'tasks' ? '#1C1C1C' : '#999999',
              },
            ]}>
            {constant.savedItemTasks}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedPlan('projects')}
          style={[
            styles.savedItemSingleView,
            {
              backgroundColor: selectedPlan == 'projects' ? '#fff' : '#F7F7F7',
              borderBottomWidth: selectedPlan == 'projects' ? 0 : 1,
            },
          ]}>
          <Text
            style={[
              styles.savedItemSingleViewText,
              {
                color: selectedPlan == 'projects' ? '#1C1C1C' : '#999999',
              },
            ]}>
            {constant.savedItemProjects}
          </Text>
        </TouchableOpacity>
      </View>
      {/* <ScrollView style={{flexDirection: 'column'}}> */}
      {selectedPlan == 'sellers' ? (
        <>
          {/* <FlatList
              showsVerticalScrollIndicator={false}
              data={savedSeller}
              keyExtractor={(x, i) => i.toString()}
              renderItem={({item, index}) => <FreelancerCard item={item} />}
            /> */}
          {!emptyFreelancerList ? (
            <>
              <SwipeListView
                data={savedSeller}
                renderItem={({item, index}) => <FreelancerCard item={item} />}
                onEndReached={() => onEndReachedHandler()}
                onEndReachedThreshold={0.1}
                onMomentumScrollBegin={() => {
                  onEndReachedCalledDuringMomentum.current = false;
                }}
                renderHiddenItem={({item, index}) => (
                  <View style={styles.savedItemHiddenConatiner}>
                    <TouchableOpacity
                      onPress={() =>
                        RemoveToSaveList('sellers', item.profile_id)
                      }>
                      <Feather
                        style={{
                          margin: 5,
                          padding: 15,
                          backgroundColor: '#EF4444',
                        }}
                        name={'trash-2'}
                        size={28}
                        color={'#fff'}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                leftOpenValue={0}
                rightOpenValue={-75}
              />
              {pageLoader == true && (
                <View style={{marginBottom: 20}}>
                  <BarIndicator count={5} size={20} color={'#0A0F26'} />
                </View>
              )}
            </>
          ) : (
            <View style={styles.NodataFoundContainer}>
              <Image
                resizeMode="contain"
                style={styles.NodataFoundImg}
                source={require('../../../assets/images/empty.png')}
              />
              <Text style={styles.NodataFoundText}>{constant.NoRecord}</Text>
            </View>
          )}
        </>
      ) : selectedPlan == 'tasks' ? (
        <>
          <FlatList
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.NodataFoundContainer}>
                <Image
                  resizeMode="contain"
                  style={styles.NodataFoundImg}
                  source={require('../../../assets/images/empty.png')}
                />
                <Text style={styles.NodataFoundText}>{constant.NoRecord}</Text>
              </View>
            }
            data={savedTask}
            keyExtractor={(x, i) => i.toString()}
            onEndReached={() => onEndReachedHandlerTask()}
            onEndReachedThreshold={0.1}
            onMomentumScrollBegin={() => {
              onEndReachedCalledDuringMomentum.current = false;
            }}
            renderItem={({item, index}) => (
              <TaskCard
                imageWidth={'100%'}
                showRemoveBtn={true}
                item={item}
                RemoveItem={RemoveToSaveList}
              />
            )}
          />
          {spinner == true && (
            <View style={{marginBottom: 20}}>
              <BarIndicator count={5} size={20} color={'#0A0F26'} />
            </View>
          )}
        </>
      ) : (
        <>
          <FlatList
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.NodataFoundContainer}>
                <Image
                  resizeMode="contain"
                  style={styles.NodataFoundImg}
                  source={require('../../../assets/images/empty.png')}
                />
                <Text style={styles.NodataFoundText}>{constant.NoRecord}</Text>
              </View>
            }
            data={savedProjects}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => (
              <ProjectListingCard
                item={item}
                showRemoveBtn={true}
                showMoreDetails={true}
                showSkills={true}
                RemoveItem={RemoveToSaveList}
              />
            )}
          />
          {spinner == true && (
            <View style={{marginBottom: 20}}>
              <BarIndicator count={5} size={20} color={'#0A0F26'} />
            </View>
          )}
        </>
      )}
      {/* </ScrollView> */}
    </SafeAreaView>
  );
};

export default SavedItem;
