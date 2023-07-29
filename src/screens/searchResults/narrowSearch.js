import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Dimensions,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useCallback, useRef, useEffect} from 'react';
import FormButton from '../../components/FormButton';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import RangeSlider from 'rn-range-slider';
import Thumb from './Slider/Thumb';
import Label from './Slider/Label';
import Notch from './Slider/Notch';
import Spinner from 'react-native-loading-spinner-overlay';
import Rail from './Slider/Rail';
import RailSelected from './Slider/RailSelected';
import MultiSelect from 'react-native-multiple-select';
import {useSelector, useDispatch} from 'react-redux';
import * as CONSTANT from '../../constants/globalConstants';
import styles from '../../style/styles';
import RBSheet from 'react-native-raw-bottom-sheet';
import {decode} from 'html-entities';
import constant from '../../constants/translation';

const NarrowSearch = ({navigation, route}) => {
  const userDetail = useSelector(state => state.value.userInfo);
  const [text, setText] = useState('');
  const [disable, setDisable] = useState(false);
  const [radius, setRadius] = useState('');
  const [lowRange, setLowRange] = useState('');
  const [highRange, setHighRange] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchCategories, setSearchCategories] = useState([]);
  const [subcategories, setSubCategories] = useState([]);
  const [subCategoriesServices, setSubCategoriesServices] = useState([]);
  const [searchSubCategories, setSearchSubCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState('');
  const [selectedSubCategories, setSelectedSubCategories] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoriesSlug, setSelectedCategoriesSlug] = useState('');
  const [selectedSubCategoriesSlug, setSelectedSubCategoriesSlug] =
    useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [countries, setCountries] = useState([]);
  const [checkUsers, setCheckUsers] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(false);
  const [refreshList, setRefreshList] = useState(false);
  const [selectedSkillType, setSelectedSkillType] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [englishLevel, setEnglishLevel] = useState([]);
  const [level, setLevel] = useState('');
  const [sellerType, setSellerType] = useState([]);
  const [seller, setSeller] = useState('');
  const [spinner, setSpinner] = useState(false);
  const [loader, setLoader] = useState(false);

  const [selectedSellerType, setSelectedSellerType] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState([]);
  const rbSheet = useRef();
  const rbSheetSubcategories = useRef();

  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);
  const renderLabel = useCallback(value => <Label text={value} />, []);
  const renderNotch = useCallback(() => <Notch />, []);

  useEffect(() => {
    getCategories();
    getSettings();
    getCountryTaxonomy();
    getEnglishLevelTaxonomy();
    getSellerTypeTaxonomy();
  }, []);

  const getCategories = async () => {
    setLoader(true);
    return fetch(
      CONSTANT.BaseUrl +
        'settings/get_options?type=taxonomy&taxonomy_name=product_cat',
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
        setCategories(responseJson);
        setSearchCategories(responseJson);
        setLoader(false);
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };
  const getSubCategories = async id => {
    return fetch(
      CONSTANT.BaseUrl +
        'settings/get_options?type=taxonomy&taxonomy_name=product_cat&parent_cat=' +
        id,
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
        setSpinner(false);
        setSubCategories(responseJson);
        setSearchSubCategories(responseJson);
        setRefreshList(!refreshList);
      })
      .catch(error => {
        setSpinner(false);
        console.error(error);
      });
  };
  const getSubCategoriesServices = async id => {
    return fetch(
      CONSTANT.BaseUrl +
        'settings/get_options?type=taxonomy&taxonomy_name=product_cat&parent_cat=' +
        id,
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
        setSpinner(false);
        setSubCategoriesServices(responseJson);
        setRefreshList(!refreshList);
      })
      .catch(error => {
        setSpinner(false);
        console.error(error);
      });
  };
  const getSettings = async () => {
    return fetch(CONSTANT.BaseUrl + 'settings/get_settings', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        setMinPrice(responseJson.min_search_price);
        setMaxPrice(responseJson.max_search_price);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const getEnglishLevelTaxonomy = () => {
    fetch(
      CONSTANT.BaseUrl +
        'settings/get_options?type=taxonomy&taxonomy_name=tb_english_level',
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
        setEnglishLevel(responseJson);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const getCountryTaxonomy = () => {
    fetch(CONSTANT.BaseUrl + 'settings/get_options?type=country', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        {
          Object.entries(responseJson).map(([key, value]) =>
            countries.push({
              slug: key,
              name: value,
            }),
          );
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const getSellerTypeTaxonomy = () => {
    fetch(
      CONSTANT.BaseUrl +
        'settings/get_options?type=taxonomy&taxonomy_name=tb_seller_type',
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
        setSellerType(responseJson);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const handelSelectedCategory = value => {
    getSubCategories(value.term_id);
    setSelectedCategoryId(value.term_id);
    setSelectedCategories(decode(value.name));
    setSelectedCategoriesSlug(value.slug);
    rbSheet.current.close();
    setSpinner(true);
  };
  const handelSelectedSubCategory = value => {
    setSpinner(true)
    getSubCategoriesServices(value.term_id);
    setSelectedSubCategories(decode(value.name));
    setSelectedSubCategoriesSlug(value.slug);
    rbSheetSubcategories.current.close();
  };

  const handelSearchItem = text => {
    console.log(text);
    const formattedQuery = text.toLowerCase();
    const newData = categories.filter(item => {
      return item.name.toLowerCase().includes(formattedQuery);
    });
    setSearchCategories(newData);
  };

  const manageSelectedType = (item, index) => {
    setCheckUsers(index);
    if (selectedSellerType.includes(item)) {
      const index = selectedSellerType.indexOf(item);
      if (index > -1) {
        selectedSellerType.splice(index, 1);
      }
      setSelectedSeller(false);
    } else {
      selectedSellerType.push(item);
      setSelectedSeller(true);
    }
  };
  const manageSelectedServices = (item, index) => {
    setCheckUsers(index);
    if (selectedServices.includes(item)) {
      const index = selectedServices.indexOf(item);
      if (index > -1) {
        selectedServices.splice(index, 1);
      }
      setSelectedSeller(false);
    } else {
      selectedServices.push(item);
      setSelectedSeller(true);
    }
  };

  const manageEnglishSkill = (item, index) => {
    setCheckUsers(index);
    if (selectedSkill.includes(item)) {
      const index = selectedSkill.indexOf(item);
      if (index > -1) {
        selectedSkill.splice(index, 1);
      }
      setSelectedSkillType(false);
    } else {
      selectedSkill.push(item);
      setSelectedSkillType(true);
    }
  };

  const searchFreelancer = () => {
    var seller = [];
    var english = [];
    for (var i = 0; i < selectedSellerType.length; i++) {
      seller.push(selectedSellerType[i].slug);
    }
    for (var j = 0; j < selectedSkill.length; j++) {
      english.push(selectedSkill[j].slug);
    }

    navigation.navigate('searchResult', {
      text: text,
      min: lowRange,
      max: highRange,
      location: selectedCountry.toString(),
      sellerType: seller,
      englishLevel: english,
    });
  };

  const searchTask = () => {
    var services = [];
    for (var j = 0; j < selectedServices.length; j++) {
      services.push(selectedServices[j].slug);
    }

    navigation.navigate('searchResultTask', {
      text: text,
      min: lowRange,
      max: highRange,
      location: selectedCountry.toString(),
      category: selectedCategoriesSlug,
      sub_category: selectedSubCategoriesSlug,
      services: [],
    });
  };
  const clearAllData = ()=> {
    setText('')
    setSelectedCategories('')
    setSelectedSubCategories('')
    setSubCategoriesServices([])
    setSelectedCountry([])
    setMinPrice(minPrice)
    setMaxPrice(maxPrice)
    setLowRange(minPrice)
    setHighRange(maxPrice)
    setSelectedSellerType([])
    setSelectedSkill([])
    setSelectedServices([])
  }
  return (
    <SafeAreaView style={styles.globalContainer}>
      <View style={styles.narrowSearchHeaderView}>
        <Text style={styles.narrowSearchHeaderText}>
          {constant.narrowSearchTitle}
        </Text>
        <View style={styles.narrowSearchHeaderIcon}>
          <Feather
            onPress={() => navigation.goBack()}
            style={{paddingHorizontal: 10}}
            name="x"
            type="x"
            color={'#1C1C1C'}
            size={25}
          />
        </View>
      </View>
      {loader && <Spinner visible={true} color={'#000'} />}
      <ScrollView
        style={{paddingHorizontal: 10}}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.narrowSearchInputView,
            {
              paddingVertical: Platform.OS == 'ios' ? 10 : 0,
            },
          ]}>
          <Feather
            style={{paddingLeft: 5, paddingRight: 10}}
            name={'search'}
            size={20}
            color={'#999999'}
          />
          <TextInput
            style={styles.narrowSearchInputStyle}
            placeholderTextColor={'#999999'}
            onChangeText={text => setText(text)}
            value={text}
            placeholder={constant.narrowSearchPlaceholder}
          />
        </View>
        {route.params.type == 'seller' && (
          <>
            <Text style={styles.narrowSearchHeadingText}>
              {constant.narrowSearchCategory}
            </Text>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => rbSheet.current.open()}
              style={[
                styles.narrowSearchCateogryConatiner,
                {
                  paddingVertical: Platform.OS == 'ios' ? 10 : 0,
                },
              ]}>
              <Text
                style={[
                  styles.narrowSearchCateogryTextStyle,
                  {color: selectedCategories != '' ? '#1C1C1C' : '#999999'},
                ]}>
                {selectedCategories != ''
                  ? selectedCategories
                  : constant.narrowSearchSelectCategory}
              </Text>
              <Feather
                style={styles.narrowSearchIconStyle}
                name={'chevron-right'}
                size={20}
                color={'#999999'}
              />
            </TouchableOpacity>
            {selectedCategories != '' &&

            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => rbSheetSubcategories.current.open()}
              style={{
                borderBottomColor: '#DDDDDD',
                borderBottomWidth: 1,
                paddingVertical: Platform.OS == 'ios' ? 10 : 0,
                marginTop: 20,
                paddingHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={[
                  styles.narrowSearchCateogryTextStyle,
                  {color: selectedSubCategories != '' ? '#1C1C1C' : '#999999'},
                ]}>
                {selectedSubCategories != ''
                  ? selectedSubCategories
                  : constant.narrowSearchSubCategory}
              </Text>
              {spinner ? (
                <ActivityIndicator
                  style={{marginLeft: 15}}
                  size="small"
                  color={CONSTANT.primaryColor}
                />
              ) : (
                <Feather
                  style={styles.narrowSearchIconStyle}
                  name={'chevron-right'}
                  size={20}
                  color={'#999999'}
                />
              )}
            </TouchableOpacity>
}
            <FlatList
              style={{marginTop:10}}
              data={subCategoriesServices}
              keyExtractor={(x, i) => i.toString()}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  onPress={() => manageSelectedServices(item, index)}
                  style={styles.checkBoxMainView}>
                  {selectedServices.includes(item) ? (
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
                  <Text style={styles.checkBoxTextSearch}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {route.params.type == 'freelancer' && (
          <>
            <Text style={styles.narrowSearchHeadingText}>
              {constant.narrowSearchType}
            </Text>
            <View>
              <FlatList
                data={sellerType}
                keyExtractor={(x, i) => i.toString()}
                renderItem={({item, index}) => (
                  <TouchableOpacity
                    onPress={() => manageSelectedType(item, index)}
                    style={styles.checkBoxMainView}>
                    {selectedSellerType.includes(item) ? (
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
                    <Text style={styles.checkBoxTextSearch}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            <Text style={styles.narrowSearchHeadingText}>
              {constant.narrowSearchEnglishSkill}
            </Text>
            <FlatList
              data={englishLevel}
              keyExtractor={(x, i) => i.toString()}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  onPress={() => manageEnglishSkill(item, index)}
                  style={styles.checkBoxMainView}>
                  {selectedSkill.includes(item) ? (
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
                  <Text style={styles.checkBoxTextSearch}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        <View style={styles.narrowSearchPriceRatingHeading}>
          <Text style={styles.narrowSearchPriceText}>
            {constant.narrowSearchMinPrice}
          </Text>
          <Text style={styles.narrowSearchPriceText}>
            {constant.narrowSearchMaxPrice}
          </Text>
        </View>
        <View style={styles.narrowSearchPriceAmount}>
          <Text style={styles.narrowSearchPriceTextAmount}>{minPrice}</Text>
          <Text style={styles.narrowSearchPriceTextAmount}>{maxPrice}</Text>
        </View>
        {maxPrice != 0 && (
          <RangeSlider
            style={styles.narrowSearchRangeSlider}
            gravity={'center'}
            min={Number(minPrice)}
            max={Number(maxPrice)}
            step={30}
            renderThumb={renderThumb}
            renderRail={renderRail}
            renderRailSelected={renderRailSelected}
            renderLabel={renderLabel}
            renderNotch={renderNotch}
            onValueChanged={(low, high, fromUser) => {
              setLowRange(low);
              setHighRange(high);
            }}
          />
        )}

        <Text style={styles.narrowSearchHeadingText}>
          {constant.narrowSearchLocation}
        </Text>
        <View
          style={styles.narrowSearchLocationConatiner}>
          <MultiSelect
            fontSize={16}
            onSelectedItemsChange={value => setSelectedCountry(value)}
            uniqueKey="slug"
            items={countries}
            selectedItems={selectedCountry}
            borderBottomWidth={0}
            single={true}
            searchInputPlaceholderText={constant.narrowSearchSelectCountry}
            selectText={constant.narrowSearchSelectCountry}
            styleMainWrapper={styles.multiSlectstyleMainWrapper}
            styleDropdownMenuSubsection={
              styles.multiSlectstyleDropdownMenuSubsection
            }
            styleListContainer={{
              maxHeight: 150,
            }}
            onChangeInput={text => console.log(text)}
            displayKey="name"
            submitButtonText={'submit'}
          />
        </View>

        <FormButton
          buttonTitle={'Apply filters'}
          backgroundColor={CONSTANT.primaryColor}
          textColor={'#fff'}
          onPress={() =>
            route.params.type == 'freelancer'
              ? searchFreelancer()
              : searchTask()
          }
        />
        <View style={styles.narrowSearchButtonView}>
          <Text
            onPress={()=> clearAllData()}
            style={styles.narrowSearchClearButton}>
            {constant.narrowSearchClearFilters}
          </Text>
        </View>
      </ScrollView>
      <RBSheet
        ref={rbSheet}
        height={Dimensions.get('window').height * 0.6}
        duration={250}
        customStyles={{
          container: {
            paddingLeft: 15,
            paddingRight: 15,
            backgroundColor: 'transparent',
          },
        }}>
        <View style={styles.RBSheetParentStyle}>
          <View style={styles.RBSheetheaderStyle}>
            <Feather
              onPress={() => rbSheet.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'arrow-left'}
              size={20}
              color={'#1C1C1C'}
            />
            <Text style={styles.RBSheetHeaderTextStyle}>
              {constant.narrowSearchSelectCategory}
            </Text>
          </View>
          <TouchableOpacity style={styles.homeRBSheetSearchStyle}>
            <Feather
              style={{textAlign: 'center'}}
              name={'search'}
              size={20}
              color={'#999999'}
            />
            <TextInput
              style={styles.homeRBSheetSearchTextStyle}
              placeholderTextColor={'#999999'}
              onChangeText={handelSearchItem}
              placeholder={constant.narrowSearchSearchCategory}
            />
          </TouchableOpacity>
          <FlatList
            style={{paddingHorizontal: 30}}
            showsVerticalScrollIndicator={true}
            extraData={refreshList}
            data={searchCategories}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity activeOpacity={0.3}>
                  {item.parent == 0 && (
                    <Text
                      style={styles.homeRBSheetListTextStyle}
                      onPress={() => handelSelectedCategory(item)}>
                      {decode(item.name)}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </RBSheet>
      <RBSheet
        ref={rbSheetSubcategories}
        height={Dimensions.get('window').height * 0.6}
        duration={250}
        customStyles={{
          container: {
            paddingLeft: 15,
            paddingRight: 15,
            backgroundColor: 'transparent',
          },
        }}>
        <View style={styles.RBSheetParentStyle}>
          <View style={styles.RBSheetheaderStyle}>
            <Feather
              onPress={() => rbSheetSubcategories.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'arrow-left'}
              size={20}
              color={'#1C1C1C'}
            />
            <Text style={styles.RBSheetHeaderTextStyle}>
              {constant.narrowSearchSubCategory}
            </Text>
          </View>
          <TouchableOpacity style={styles.homeRBSheetSearchStyle}>
            <Feather
              style={{textAlign: 'center'}}
              name={'search'}
              size={20}
              color={'#999999'}
            />
            <TextInput
              style={styles.homeRBSheetSearchTextStyle}
              placeholderTextColor={'#999999'}
              onChangeText={handelSearchItem}
              placeholder="Search category"
            />
          </TouchableOpacity>
          <FlatList
            style={{paddingHorizontal: 30}}
            showsVerticalScrollIndicator={true}
            data={searchSubCategories}
            extraData={refreshList}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity activeOpacity={0.3}>
                  <Text
                    style={styles.homeRBSheetListTextStyle}
                    onPress={() => handelSelectedSubCategory(item)}>
                    {decode(item.name)}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

export default NarrowSearch;
