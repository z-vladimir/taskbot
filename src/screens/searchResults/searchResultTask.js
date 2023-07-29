import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import Header from '../../components/Header';
import Feather from 'react-native-vector-icons/Feather';
import {useSelector, useDispatch} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
// import Spinner from 'react-native-loading-spinner-overlay';
import * as CONSTANT from '../../constants/globalConstants';
import {updateSavedSellers, updateSavedTasks} from '../../Redux/SavedSlice';
import TaskCard from '../home/homeCards/taskCard';
import SkeletonTaskCard from '../home/homeCards/SkeletonTaskCard';
import styles from '../../style/styles';
import constant from '../../constants/translation';
import {
  BarIndicator,
  UIActivityIndicator,
  SkypeIndicator,
} from 'react-native-indicators';

const SearchResultTask = ({route, navigation}) => {
  const userDetail = useSelector(state => state.value.userInfo);
  const token = useSelector(state => state.value.token);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const onEndReachedCalledDuringMomentum = useRef(true);
  const [page, setpage] = useState(2);
  const [loader, setLoader] = useState(false);
  const [refreshFlatlist, setRefreshFlatList] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [count, setCount] = useState('');
  const [taskCardSpinner, setTaskCardSpinner] = useState(true);

  useEffect(() => {
    setCount('');
    if (isFocused) {
      setTaskCardSpinner(true);
      getTasks();
      getsavedItems();
    }
  }, [isFocused]);

  const getsavedItems = async type => {
    var savedTasks = [];

    savedTasks.length = 0;
    return fetch(
      CONSTANT.BaseUrl +
        'get-saved-items?post_id=' +
        userDetail.profile_id +
        '&type=tasks',
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
          savedTasks.push({
            slug: key,
            id: value,
          }),
        );
        dispatch(updateSavedTasks(savedTasks));
      })
      .catch(error => {
        console.error(error);
      });
  };

  const getTasks = async () => {
    return fetch(
      CONSTANT.BaseUrl +
        'get_tasks?type=search&show_posts=20&keyword=' +
        route.params.text +
        '&min_price=' +
        route.params.min +
        '&max_price=' +
        route.params.max +
        '&location=' +
        route.params.location +
        '&category=' +
        route.params.category +
        '&sub_category=' +
        route.params.sub_category +
        '&service=' +
        route.params.services,
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
          setHideTaskCard(true);
        } else {
          setCount(responseJson.count_totals);
          setTasks(responseJson.tasks);
          setTaskCardSpinner(false);
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
        'get_tasks?type=search&show_posts=20&keyword=' +
        route.params.text +
        '&min_price=' +
        route.params.min +
        '&max_price=' +
        route.params.max +
        '&location=' +
        route.params.location +
        '&category=' +
        route.params.category +
        '&sub_category=' +
        route.params.sub_category +
        '&service=' +
        route.params.services +
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
        setTasks(tasks.concat(responseJson.tasks));
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
        title={constant.searchResultTaskTitle}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
        backIcon={true}
      />
      <View style={styles.searchResultTitleParentStyle}>
        <Text style={styles.searchResultTextStyle}>
          {count} {constant.searchResultTaskResultFound}
        </Text>
        <View style={styles.searchResultIconParentStyle}>
          <Feather
            onPress={() =>
              navigation.navigate('narrowSearch', {type: 'seller'})
            }
            name={'sliders'}
            size={20}
            color={'#1C1C1C'}
          />
        </View>
      </View>
      {taskCardSpinner ? (
        <>
          <View style={{flexDirection: 'row'}}>
            <SkeletonTaskCard widthval={'100%'} mainWidth={'45%'} />
            <SkeletonTaskCard widthval={'100%'} mainWidth={'45%'} />
          </View>
          <View style={{flexDirection: 'row'}}>
            <SkeletonTaskCard widthval={'100%'} mainWidth={'45%'} />
            <SkeletonTaskCard widthval={'100%'} mainWidth={'45%'} />
          </View>
          <View style={{flexDirection: 'row'}}>
            <SkeletonTaskCard widthval={'100%'} mainWidth={'45%'} />
            <SkeletonTaskCard widthval={'100%'} mainWidth={'45%'} />
          </View>
          <View style={{flexDirection: 'row'}}>
            <SkeletonTaskCard widthval={'100%'} mainWidth={'45%'} />
            <SkeletonTaskCard widthval={'100%'} mainWidth={'45%'} />
          </View>
        </>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={tasks}
          keyExtractor={(x, i) => i.toString()}
          extraData={refreshFlatlist}
          numColumns={2}
          onEndReached={() => onEndReachedHandler()}
          onEndReachedThreshold={0.1}
          onMomentumScrollBegin={() => {
            onEndReachedCalledDuringMomentum.current = false;
          }}
          renderItem={({item, index}) => (
            <TaskCard widthValue={'45%'} imageWidth={'100%'} item={item} />
          )}
        />
      )}
      {loader == true && (
        <View style={{marginBottom: 20}}>
          <BarIndicator count={5} size={20} color={'#0A0F26'} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default SearchResultTask;
