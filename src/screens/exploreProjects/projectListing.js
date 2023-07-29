import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Dimensions,
  Image,
  Platform,
  TouchableOpacity,
  PermissionsAndroid,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Header from '../../components/Header';
import styles from '../../style/styles.js';
import * as CONSTANT from '../../constants/globalConstants';
import {useIsFocused} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {updateSavedProjects} from '../../Redux/SavedSlice';
import Spinner from 'react-native-loading-spinner-overlay';
import constant from '../../constants/translation';
import ProjectListinCard from './projectListingCard';
import {BarIndicator} from 'react-native-indicators';
import RBSheet from 'react-native-raw-bottom-sheet';
import axios from 'axios';

const ProjectListing = ({navigation, route}) => {
  const userDetail = useSelector(state => state.value.userInfo);
  const [emptyTask, setEmptyTask] = useState(false);
  const isFocused = useIsFocused();
  const [projectsListing, setProjectsListing] = useState([]);
  const [loader, setLoader] = useState(false);
  const [loadMore, setLoadeMore] = useState(false);
  const [refreshFlatlist, setRefreshFlatList] = useState(false);
  const [page, setpage] = useState(2);
  const [totalRecord, settotalRecord] = useState('');
  const RBSheetSortProject = useRef();
  const onEndReachedCalledDuringMomentum = useRef(true);
  const {showSkills, showMoreDetails} = route.params;
  const [added, setAdded] = useState(false);
  const savedList = useSelector(state => state.saved.savedProjects);
  const token = useSelector(state => state.value.token);
  const dispatch = useDispatch();
  useEffect(() => {
    if (isFocused) {
      getProjects();
    }
  }, [isFocused]);

  const getProjects = async () => {
    setLoader(true);

    axios
      .get(CONSTANT.BaseUrl + 'projects/get_projects', {
        params: {
          type: 'search',
          show_posts: '10',
          keyword: route.params.text,
          min_price: 10,
          max_price: route.params.max,
          location: route.params.location,
          category: route.params.category,
          skills: route.params.skills,
          languages: route.params.languages,
          expertise_level: route.params.expert,
          user_id: userDetail.user_id,
        },
      })
      .then(response => {
        setLoader(false);
        settotalRecord(response.data.count_totals);
        setProjectsListing(response.data.projects);
        setpage(2);
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };
  const loadMoreData = async () => {
    setLoadeMore(true);
    axios
      .get(CONSTANT.BaseUrl + 'projects/get_projects', {
        params: {
          type: 'search',
          show_posts: '10',
          keyword: route.params.text,
          min_price: 10,
          max_price: route.params.max,
          location: route.params.location,
          category: route.params.category,
          skills: route.params.skills,
          languages: route.params.languages,
          expertise_level: route.params.expert,
          user_id: userDetail.user_id,
          page_number: page.toString(),
        },
      })
      .then(response => {
        let users = response.data.projects;
        setpage(page + 1);
        setProjectsListing(projectsListing.concat(users));
        setRefreshFlatList(!refreshFlatlist);
        setLoadeMore(false);
      })
      .catch(error => {
        console.error(error);
      });
  };
  const onEndReachedHandler = () => {
    if (!onEndReachedCalledDuringMomentum.current) {
      if (projectsListing.length >= 10) {
        loadMoreData();
      }
      onEndReachedCalledDuringMomentum.current = true;
    }
  };
  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={constant.expolreProject}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
      />
      {loader && <Spinner visible={true} color={'#000'} />}
      <View style={styles.ProjectListingSearchTitleParentStyle}>
        <Text
          style={styles.ProjectListingSearchTextStyle}
          //  onPress={() => loadMoreData()}
        >
          {totalRecord} {constant.searchResultResultFound}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('searchProjects')}
          style={styles.ProjectListingSearchIcon}>
          <Feather name={'sliders'} size={20} color={'#1C1C1C'} />
        </TouchableOpacity>
      </View>
      <>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={projectsListing}
          keyExtractor={(x, i) => i.toString()}
          extraData={refreshFlatlist}
          onEndReached={() => onEndReachedHandler()}
          onEndReachedThreshold={0.1}
          onMomentumScrollBegin={() => {
            onEndReachedCalledDuringMomentum.current = false;
          }}
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
          renderItem={({item, index}) => (
            <ProjectListinCard
              item={item}
              showSkills={showSkills}
              showMoreDetails={showMoreDetails}
              // handelAdded={handelAdded}
              // added={added}
            />
          )}
        />
      </>
      {loadMore == true && (
        <View style={{marginBottom: 20, marginTop: 20}}>
          <BarIndicator count={5} size={20} color={'#0A0F26'} />
        </View>
      )}
      {/* <RBSheet
        ref={RBSheetSortProject}
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
            <Text style={styles.RBSheetHeaderTextStyle}>Sort by</Text>
            <Feather
              onPress={() => RBSheetSortProject.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'x'}
              size={20}
              color={'#1C1C1C'}
            />
          </View>
          <TouchableOpacity
            style={styles.RBSheetSortView}
            onPress={() => handelSortBy('LowToHeigh')}>
            <View style={styles.RBSheetSortValue}>
              <Text style={styles.RBSheetSortText}>Price Low to high</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.RBSheetSortView, {backgroundColor: '#F7F7F7'}]}
            onPress={() => handelSortBy('HeighToLow')}>
            <View style={styles.RBSheetSortValue}>
              <Text style={styles.RBSheetSortText}>Price high to low</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.RBSheetSortView}
            onPress={() => handelSortBy('NewToOld')}>
            <View style={styles.RBSheetSortValue}>
              <Text style={styles.RBSheetSortText}>New to old</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.RBSheetSortView}
            onPress={() => handelSortBy('OldToNew')}>
            <View style={styles.RBSheetSortValue}>
              <Text style={styles.RBSheetSortText}>Old to new</Text>
            </View>
          </TouchableOpacity>
        </View>
      </RBSheet> */}
    </SafeAreaView>
  );
};

export default ProjectListing;
