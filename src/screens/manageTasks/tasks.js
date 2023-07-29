import {View, Text, SafeAreaView, FlatList, Image} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Header from '../../components/Header';
import styles from '../../style/styles.js';
import MultiSelect from 'react-native-multiple-select';
import AvaliableTaskCard from './avaliableTaskCard';
import {BarIndicator} from 'react-native-indicators';
import {useIsFocused} from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import * as CONSTANT from '../../constants/globalConstants';
import {useSelector, useDispatch} from 'react-redux';
import constant from '../../constants/translation';

const Task = ({route}) => {
  const token = useSelector(state => state.value.token);
  const userDetail = useSelector(state => state.value.userInfo);
  const onEndReachedCalledDuringMomentum = useRef(true);
  const isFocused = useIsFocused();
  const [loader, setLoader] = useState(false);
  const [availableTaskList, setAvailableTaskList] = useState([]);
  const [selectedOrderType, setSelectedOrderType] = useState('');
  const [emptyTask, setEmptyTask] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [pageNumber, setPageNumber] = useState(2);
  const [showOrderType, setShowOrderType] = useState([
    {key: 'any', val: constant.taskAll},
    {key: 'hired', val: constant.taskOngoing},
    {key: 'completed', val: constant.taskCompleted},
    {key: 'cancelled', val: constant.taskCancelled},
  ]);

  useEffect(() => {
    if (isFocused) {
      if (route.params != undefined) {
        setSelectedOrderType(route.params.orderType);
      }
      getAvailableTask();
    }
  }, [isFocused, selectedOrderType]);
  const getAvailableTask = () => {
    setLoader(true);
    fetch(
      CONSTANT.BaseUrl +
        'get-orders?post_id=' +
        userDetail.profile_id +
        '&order_type=' +
        selectedOrderType.toString() +
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
        if (responseJson.length == 0) {
          setEmptyTask(true);
          setAvailableTaskList(responseJson);
          setLoader(false);
        } else {
          setLoader(false);
          setPageNumber(2);
          setAvailableTaskList(responseJson);
        }
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };
  const onEndReachedHandler = () => {
    if (!onEndReachedCalledDuringMomentum.current) {
      if (availableTaskList.length >= 10) {
        loadMoreAvailableTask();
      }
      onEndReachedCalledDuringMomentum.current = true;
    }
  };
  const loadMoreAvailableTask = () => {
    setSpinner(true);
    fetch(
      CONSTANT.BaseUrl +
        'get-orders?post_id=' +
        userDetail.profile_id +
        '&order_type=' +
        selectedOrderType.toString() +
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
        if (responseJson.length == 0) {
          setAvailableTaskList(availableTaskList.concat(responseJson));
          setSpinner(false);
        } else {
          setPageNumber(pageNumber + 1);
          setSpinner(false);
          setAvailableTaskList(availableTaskList.concat(responseJson));
        }
      })
      .catch(error => {
        setSpinner(false);
        console.error(error);
      });
  };
  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={
          userDetail.user_type == 'sellers'
            ? constant.taskFilterAllOrders
            : constant.taskTitle
        }
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
      />
      {loader && <Spinner visible={true} color={'#000'} />}
      <View style={{backgroundColor: '#FFFFFF'}}>
        {/* <View style={styles.taskSearchConatiner}>
          <View style={styles.taskSearchInput}>
            <TextInput placeholder="Search order here" />
          </View>
          <Feather
            onPress={() => getAvailableTask()}
            name={'search'}
            size={18}
            color={'#888888'}
          />
        </View> */}
        <View
          style={{
            paddingHorizontal: 10,
          }}>
          <View style={styles.taskSelectView}>
            <MultiSelect
              fontSize={16}
              onSelectedItemsChange={value => {
                route.params.orderType = value;
                setSelectedOrderType(value);
              }}
              uniqueKey="key"
              items={showOrderType}
              selectedItems={selectedOrderType}
              borderBottomWidth={0}
              single={true}
              searchInputPlaceholderText={constant.taskFilter}
              selectText={constant.taskFilter}
              styleMainWrapper={styles.multiSlectstyleMainWrapper}
              styleDropdownMenuSubsection={
                styles.multiSlectstyleDropdownMenuSubsection
              }
              styleListContainer={{
                maxHeight: 150,
              }}
              onChangeInput={text => console.log(text)}
              displayKey="val"
              submitButtonText={constant.Submit}
            />
          </View>
        </View>
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={availableTaskList}
        onEndReached={() => onEndReachedHandler()}
        onEndReachedThreshold={0.1}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        ListEmptyComponent={
          emptyTask && (
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
        renderItem={({item, index}) => <AvaliableTaskCard item={item} />}
      />
      {spinner == true && (
        <View style={{marginBottom: 20, marginTop: 20}}>
          <BarIndicator count={5} size={20} color={'#0A0F26'} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default Task;
