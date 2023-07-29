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
import TaskListCard from './TaskListCard';

const TaskListing = ({route}) => {
  const token = useSelector(state => state.value.token);
  const userDetail = useSelector(state => state.value.userInfo);
  const onEndReachedCalledDuringMomentum = useRef(true);
  const isFocused = useIsFocused();
  const [loader, setLoader] = useState(false);
  const [availableTaskList, setAvailableTaskList] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedOrderType, setSelectedOrderType] = useState(['any']);
  const [emptyTask, setEmptyTask] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [refreshList, setRefreshList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taskCardSpinner, setTaskCardSpinner] = useState(false);
  const [pageNumber, setPageNumber] = useState(2);
  const [showOrderType, setShowOrderType] = useState([
    {key: 'any', val: constant.taskAll},
    {key: 'publish', val: constant.myProjectListingPublished},
    {key: 'draft', val: constant.myProjectListingDrafted},
    {key: 'pending', val: constant.payoutHistoryFilterPending},
    {key: 'rejected', val: constant.taskDetailsRejected},
  ]);

  useEffect(() => {
    if (isFocused) {
      getTasks();
    }
  }, [isFocused, selectedOrderType]);
  const getTasks = async () => {
    setLoader(true);
    return fetch(
      CONSTANT.BaseUrl +
        'get_tasks?type=manage_tasks&show_posts=20&page_number=1&post_status=' +
        selectedOrderType +
        '&user_id=' +
        userDetail.user_id,
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
        setLoader(false);
        if (responseJson.tasks.length == 0) {
          setEmptyTask(true);
          setTasks([]);
        } else {
          setPageNumber(2);
          setTasks(responseJson.tasks);
          setTaskCardSpinner(false);
        }
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };
  const onEndReachedHandler = () => {
    if (!onEndReachedCalledDuringMomentum.current) {
      if (tasks.length >= 10) {
        loadMoreTaskListing();
      }
      onEndReachedCalledDuringMomentum.current = true;
    }
  };
  const loadMoreTaskListing = async () => {
    setSpinner(true);
    return fetch(
      CONSTANT.BaseUrl +
        'get_tasks?type=manage_tasks&show_posts=20&page_number=' +
        pageNumber +
        '&post_status=' +
        selectedOrderType +
        '&user_id=' +
        userDetail.user_id,
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
          setTasks(tasks.concat(responseJson.tasks));
          setSpinner(false);
        } else {
          setPageNumber(pageNumber + 1);
          setSpinner(false);
          setTasks(tasks.concat(responseJson.tasks));
        }
      })
      .catch(error => {
        setSpinner(false);
        console.error(error);
      });
  };
  const deleteTask = index => {
    tasks.splice(index, 1);
    setRefreshList(!refreshList);
  };
  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={constant.customDrawerManageTasks}
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
        data={tasks}
        listKey={(item, index) => `_keys${index.toString()}`}
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
        renderItem={({item, index}) => (
          <TaskListCard item={item} index={index} deleteItem={deleteTask} />
        )}
      />
      {spinner == true && (
        <View style={{marginBottom: 20, marginTop: 20}}>
          <BarIndicator count={5} size={20} color={'#0A0F26'} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default TaskListing;
