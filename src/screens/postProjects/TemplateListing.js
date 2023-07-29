import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Header from '../../components/Header';
import styles from '../../style/styles.js';
import constant from '../../constants/translation';
import {useNavigation} from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import {useSelector, useDispatch} from 'react-redux';
import {BarIndicator} from 'react-native-indicators';
import * as CONSTANT from '../../constants/globalConstants';
import ProjectTemplateCard from './ProjectTemplateCard';

const TemplateListing = () => {
  const token = useSelector(state => state.value.token);
  const userDetail = useSelector(state => state.value.userInfo);
  const onEndReachedCalledDuringMomentum = useRef(true);
  const navigationforword = useNavigation();
  const [emptyTask, setEmptyTask] = useState(false);
  const [loader, setLoader] = useState(true);
  const [spinner, setSpinner] = useState(false);
  const [search, setSearch] = useState('');
  const [searchLoader, setSearchLoader] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [projectTemplates, setprojectTemplates] = useState([]);

  useEffect(() => {
    getProjectTemplates();
  }, [search]);

  const getProjectTemplates = () => {
    setSearchLoader(true);
    fetch(
      CONSTANT.BaseUrl +
        'get-projects?post_id=' +
        userDetail.profile_id +
        '&user_id=' +
        userDetail.user_id +
        '&page_number=1' +
        '&type=search&keyword=' +
        search,

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
          setprojectTemplates(responseJson.project_data);
        }
        setLoader(false);
        setSearchLoader(false);
      })
      .catch(error => {
        setSearchLoader(false);
        setLoader(false);
        console.error(error);
      });
  };

  const loadMoreProjectTemplates = () => {
    setSpinner(true);
    fetch(
      CONSTANT.BaseUrl +
        'get-projects?post_id=' +
        userDetail.profile_id +
        '&user_id=' +
        userDetail.user_id +
        '&page_number=' +
        pageNumber +
        '&type=search&keyword=' +
        search,

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
          setprojectTemplates(
            projectTemplates.concat(responseJson.project_data),
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
      loadMoreProjectTemplates();
      onEndReachedCalledDuringMomentum.current = true;
    }
  };

  return (
    <SafeAreaView style={styles.globalContainer}>
      {loader && <Spinner visible={true} color={'#000'} />}
      <Header
        title={constant.postProjectTemplates}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
        backIcon={true}
      />
      {/* <ScrollView showsVerticalScrollIndicator={false}> */}
      <View style={styles.postProjectView}>
        <Text style={styles.postProjectHeading}>
          {constant.postProjectChooseTemplateProjects}
        </Text>
        <Text style={styles.postProjectText}>
          {constant.postProjectPreviouslyPostedProject}
        </Text>
      </View>
      <View style={{borderColor: '#DDDDDD', borderWidth: 0.5}} />
      <View
        style={[styles.postProjectView, {marginVertical: 0, paddingTop: 0}]}>
        <View
          style={[styles.homeSearchParentInputStyle, {paddingHorizontal: 10}]}>
          <TextInput
            style={[styles.empProjectSearchInputStyle,{lineHeight: 0,}]}
            placeholderTextColor={'#999999'}
            onChangeText={text => setSearch(text)}
            value={search}
            placeholder={constant.empAllProjectSearchPlaceHolder}
          />
          {searchLoader ? (
            <ActivityIndicator size="small" color={'#1C1C1C'} />
          ) : (
            <Feather
              style={styles.homeSearchIconStyle}
              name={'search'}
              size={20}
              color={'#999999'}
            />
          )}
        </View>
      </View>
      <View style={{borderColor: '#DDDDDD', borderWidth: 0.5, marginTop: 15}} />

      <FlatList
        style={{marginVertical: 5}}
        showsVerticalScrollIndicator={false}
        data={projectTemplates}
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
        onEndReached={() => onEndReachedHandler()}
        onEndReachedThreshold={0.1}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        renderItem={({item, index}) => <ProjectTemplateCard item={item} />}
      />
      {spinner == true && (
        <View style={{marginBottom: 20, marginTop: 20}}>
          <BarIndicator count={5} size={20} color={'#0A0F26'} />
        </View>
      )}
      {/* </ScrollView> */}
    </SafeAreaView>
  );
};

export default TemplateListing;
