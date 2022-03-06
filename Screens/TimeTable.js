import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, StyleSheet, ScrollView, RefreshControl, Platform } from 'react-native';
import { ListItem } from 'react-native-elements';
import AppHeader from '../Components/AppHeader';
import app from '../config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import moment from 'moment';
import * as Font from 'expo-font';

var customFonts = {
    'Lora-Bold': require('../assets/font/Lora-Bold.ttf'),
    'Lora': require('../assets/font/Lora-Regular.ttf')
}

moment().format();
var rain = 'rgba(44, 120, 115, 0.8)'
var cadetBlue = '#004445'
var blueBlack = '#021C1E'
var greenery = '#6FB98F'
var smog = '#F1DCC9'
var smogSubtitle = '#F1DCC9'
var periwinkle = '#F4EBDB'
var periwinkleSubtitle = '#D6CFC1'
var linen = '#EAE2D6'
var rainClass = '#4B908C'


const hours = [
    {
        title: "12 AM",
        id: 0
    },
    {
        title: "1 AM",
        id: 1
    },
    {
        title: "2 AM",
        id: 2
    },
    {
        title: "3 AM",
        id: 3
    },
    {
        title: "4 AM",
        id: 4
    },
    {
        title: "5 AM",
        id: 5
    },
    {
        title: "6 AM",
        id: 6
    },
    {
        title: "7 AM",
        id: 7
    },
    {
        title: "8 AM",
        id: 8
    },
    {
        title: "9 AM",
        id: 9
    },
    {
        title: "10 AM",
        id: 10
    },
    {
        title: "11 AM",
        id: 11
    },
    {
        title: "12 AM",
        id: 12
    },
    {
        title: "1 PM",
        id: 13
    },
    {
        title: "2 PM",
        id: 14
    },
    {
        title: "3 PM",
        id: 15
    },
    {
        title: "4 PM",
        id: 16
    },
    {
        title: "5 PM",
        id: 17
    },
    {
        title: "6 PM",
        id: 18
    },
    {
        title: "7 PM",
        id: 19
    },
    {
        title: "8 PM",
        id: 20
    },
    {
        title: "9 PM",
        id: 21
    },
    {
        title: "10 PM",
        id: 22
    },
    {
        title: "11 PM",
        id: 23
    },
    {
        title: "12 PM",
        id: 24
    }
]

const days = [
    {
        title: "  ",
        id: 0
    },
    {
        title: "Monday",
        id: 1
    },
    {
        title: "Tuesday",
        id: 2
    },
    {
        title: "Wednesday",
        id: 3
    },
    {
        title: "Thursday",
        id: 4
    },
    {
        title: "Friday",
        id: 5
    },
    {
        title: "Saturday",
        id: 6
    },
    {
        title: "Sunday",
        id: 7
    }
]
const width = Dimensions.get('window').width
const height = Dimensions.get('window').height


export default class TimeTable extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            userId: '',
            classesData: [],
            runFetchClassesData: 0,
            sentNotification: false
        }
    }


    componentDidMount(){
        this.getUserId();
        this._loadFontsAsync();
    }


    async _loadFontsAsync(){
        await Font.loadAsync(customFonts);
    }


    componentDidUpdate(){
        if( this.state.runFetchClassesData === 0 ){
            this.fetchClassesData()
        }
    }


    componentWillUnmount(){
        this.fetchClassesData();
        this.checkToSendNotification();
    }


    getUserId = () => {
        const auth = getAuth(app);
        var userId

        onAuthStateChanged(auth, (user)=>{
            if(user){
                userId = user.email

                this.setState({
                    userId: userId
                });
            }
        });
    }


    fetchClassesData = async () => {
        const db = getFirestore(app);
        var userId = this.state.userId

        const q = query( collection(db, "Scheduled Classes"), where('user_id','==',userId) )

        const querySnapshot = await getDocs(q)

        if(querySnapshot){
            querySnapshot.forEach((doc)=>{

                var updatedClassesData = querySnapshot.docs.map( document => document.data() )
                this.setState({
                    classesData: updatedClassesData,
                })

            })
        }
        else{
            console.log("Somehow, this is empty");
        }

        this.setState({
            runFetchClassesData: 1
        })

        this.checkToSendNotification()
    }


    checkToSendNotification = () => {

        if( this.state.runFetchClassesData === 1 ){

            var data = this.state.classesData
            var length = data.length

            if( length !== 0 ){

                for( var x = 0; x < length; x++ ){
    
                    var classItem = data[x]

                    var today = moment().day()
                    var classDay = moment( classItem.class_date ).day()

                    if( today === classDay ){

                        //getting unix seconds for today (including time), for today (excluding time), then subtract
                        var date = new Date().toLocaleDateString('en-GB')
                        const [dd, mm, yyyy] = date.split("/")
                        var formattedDate = `${yyyy}-${mm}-${dd}`
                        var currentDateMoment = moment( formattedDate ).unix()
                        var currentMoment = moment().unix()
    
                        var currentTime = currentMoment - currentDateMoment
    
                        // getting unix seconds for class (including time), for class (excluding starting time), then subtract
                        var classMoment = moment( classItem.class_starting_timing ).unix()
                        var classDateMoment = moment( classItem.class_date ).unix()
                        var classTime = classMoment - classDateMoment

                        //time Left to class
                        var timeLeft = classTime - currentTime

                        if( timeLeft <= 3600 && timeLeft > 0 && this.state.sentNotification === false ){

                            var timeLeftRaw = timeLeft/60
                            var timeLeftFinal = timeLeftRaw.toString().substring(0, 2)

                            this.setState({
                                sentNotification: true
                            })

                            if( this.state.sentNotification === true ){
                                this.sendNotification(classItem, timeLeftFinal)
                            }

                        }

                    }    
    
                }
    
            }
            else{
    
            }
        }

    }


    sendNotification = async ( classItem, timeLeft ) => {
        const db = getFirestore(app)

        const refDoc = await addDoc( collection(db, 'All Notifications'), {
            class_name: classItem.class_name,
            class_time: classItem.class_starting_timing,
            message: "You have " + classItem.class_name + " in " + timeLeft + "minutes",
            time_left: timeLeft + "minutes",
            user_id: this.state.userId,
            mark_as_read: false
        });
    }


    keyExtractor = (item, index) => index.toString()


    renderItemDays = ({ item, i }) => {
        var x = item.id - 1
        var y = item.id
        var dates = this.getWeek()
        var date = dates.slice(x, y)
        return(
            <ListItem bottomDivider = {true} style = {{ width: '12.5%', borderColor: '#434659', borderWidth: 1 }} containerStyle = {{ backgroundColor: blueBlack }}>
                <ListItem.Content style = {{  height: height/21 }}>
                    <ListItem.Title style = {[ styles.listItemDaysText, { fontWeight: 'bold' } ]}>{date}</ListItem.Title>
                    <ListItem.Title style = {styles.listItemDaysText}>{item.title}</ListItem.Title>
                </ListItem.Content>
            </ListItem>
        )
    }


    renderItemDaysPhone = ({ item, i }) => {
        var x = item.id - 1
        var y = item.id
        var dates = this.getWeek()
        var date = dates.slice(x, y)
        return(
            <ListItem bottomDivider = {true} style = {{ width: '100%', borderColor: '#434659', borderWidth: 2 }} containerStyle = {{ backgroundColor: blueBlack }}>
                <ListItem.Content style = {{  height: height/18, alignItems: 'center', justifyContent: 'center' }}>
                    <ListItem.Title style = {[ styles.listItemDaysText, { fontWeight: '800', fontSize: 20 } ]}>{item.title}</ListItem.Title>
                </ListItem.Content>
            </ListItem>
        )
    }


    renderItemHours = ({ item }) => {
        var hour

        if( item.id < 10 ){
            hour = "0" + item.id + ":00"
        }
        else if( item.id === 10 || item.id > 10  ){
            hour = item.id + ":00"
        }

        return(
            <ListItem bottomDivider = {true} style = {{ borderWidth: 1, borderColor: '#434659' }} containerStyle = {{ backgroundColor: blueBlack, height: height/12 }}>
                <ListItem.Content>
                    <ListItem.Title style = {[ styles.listItemDaysText, { fontWeight: 'bold' } ]}>{item.title}</ListItem.Title>
                    <ListItem.Subtitle style = {styles.listItemDaysText}>{hour}</ListItem.Subtitle>
                </ListItem.Content>
            </ListItem>
        )
    }
    
    
    renderItem = ( { item }, givenDay ) => {
        var classes = this.state.classesData;
        var classItem, isClass, x, classData;
        var day = givenDay;
        var length = classes.length
        var definiteClassTime

        for( x = 0; x < length; x++ ){

            classItem = classes[x]

            var classDay = moment( classItem.class_date ).day()
            var classStartHour = moment( classItem.class_starting_timing ).hour()
            var classTime = moment( classItem.class_starting_timing ).format('HH:mm')
            var hour = item.id

            if( classDay === day ){

                if( classStartHour === hour ){
                    isClass = true
                    classData = classItem
                    definiteClassTime = classTime
                }
                else{
                    continue;
                }

            }
            else{

                continue;
                
            }

        }


        if( givenDay % 2 === 0 ){

            if( isClass === true ){
                return(
                    <ListItem bottomDivider = {true} style = { 
                        width >= 826 ? [ styles.renderItemActiveClass ] : styles.renderItemActiveClassPhone
                    }
                    containerStyle = {
                        width >= 826 ? styles.listItemEvenContainer : {}
                    }>
                        <ListItem.Content>
    
                            <TouchableOpacity
                                onPress = {()=>{
                                    this.props.navigation.navigate('ClassDetailsScreen', { "data": classData })
                                }}>
                                    <ListItem.Title style = {styles.listItemEvenTitle}>{ definiteClassTime }</ListItem.Title>
                                    <ListItem.Subtitle style = {styles.listItemEvenSubtitle}>{ classData.class_name }</ListItem.Subtitle>
                            </TouchableOpacity>
    
                        </ListItem.Content>
                    </ListItem>
                )
            }
            else{
                return(
                    <ListItem bottomDivider = {true} style = {
                        moment().day() === day ? styles.renderItemTodayClass : styles.renderItemClass
                    }
                    containerStyle = { 
                        moment().day() === day ? styles.renderItemTodayContentEven: styles.renderItemContentEven
                    }>
                        <ListItem.Content>
                            <ListItem.Title style = {styles.listItemEvenTitle}>{item.title}</ListItem.Title>
                            <ListItem.Subtitle style = {styles.listItemEvenSubtitle}>No Class</ListItem.Subtitle>
                        </ListItem.Content>
                    </ListItem>
                )
            }

        }
        else{

            if( isClass === true ){
                return(
                    <ListItem bottomDivider = {true} style = {
                        width >= 826 ? [ styles.renderItemActiveClass ] : [ styles.renderItemActiveClassPhone ]
                    }
                    containerStyle = {
                        width >= 826 ? styles.listItemOddContainer : {}
                    }>
                        <ListItem.Content>
                            <TouchableOpacity
                                onPress = {()=>{
                                    this.props.navigation.navigate('ClassDetailsScreen', { "data": classData })
                                }}>
                                    <ListItem.Title style = {styles.listItemOddTitle}>{ definiteClassTime }</ListItem.Title>
                                    <ListItem.Subtitle style = {styles.listItemOddSubtitle}>{ classData.class_name }</ListItem.Subtitle>
                            </TouchableOpacity>
                            
                        </ListItem.Content>
                    </ListItem>
                )
            }
            else{
                return(
                    <ListItem bottomDivider = {true} style = {
                        moment().day() === day ? styles.renderItemTodayClass : styles.renderItemClass
                    } 
                    containerStyle = { 
                        moment().day() === day ? styles.renderItemTodayContentOdd: styles.renderItemContentOdd
                    }>
                        <ListItem.Content>
                            <ListItem.Title style = {styles.listItemOddTitle}>{item.title}</ListItem.Title>
                            <ListItem.Subtitle style = {styles.listItemOddSubtitle}>No Class</ListItem.Subtitle>
                        </ListItem.Content>
                    </ListItem>
                )
            }

        }

    }


    getTodayDay = () => {
        var date = new Date()
        var options = { weekday: 'long' }

        var days = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ]
        var day = days[date.getDay()]
        var dayObject = {
                title: day,
                id: "0"
            }
        var data = []
        data.push(dayObject)
        return data;
    }


    getDay = () => {
        var day = moment().day()
        return day
    }


    getWeek = () => {
        var currentDate = new Date
        var week = []

        for ( var i = 1 ; i <= 7 ; i++ ){
            var firstDay = currentDate.getDate() - currentDate.getDay() + i
            var day = new Date(currentDate.setDate(firstDay)).toISOString().slice(8, 10)
            week.push(day)
        }

        return week;
    }
 

    render(){
        if( Dimensions.get('window').width >= 826 ){

            return(
                <View style = {{ flex: 2 , height: '100%' }}>
    
                    <View style = {{ width: '100%' }}>
                        <AppHeader title = "Time Table" />
                    </View>       
    
                    <View style = {{ height: '100%', width: '100%' }}>
    
                        <View style = {{ width: '100%' }}>
    
                            <FlatList 
                                data = {days}
                                renderItem = {this.renderItemDays}
                                keyExtractor = {this.keyExtractor}
                                numColumns = {8}
                            />
    
                        </View>
    
                        <ScrollView refreshControl = { 
                            <RefreshControl refreshing = {true} onRefresh = { ()=>{
                                try{
                                    this.fetchClassesData()
                                    console.log("Refreshed")
                                }
                                catch(error){
                                    var errorMessage = error.message
                                    return alert(errorMessage)
                                }
                            }}/>
                        }>

                            <View style = {{ height: '100%', width: '100%', display: 'flex', flexDirection: 'row', flex: 8 }}>

                                <FlatList 
                                    data = {hours}
                                    renderItem = {this.renderItemHours}
                                    keyExtractor = {this.keyExtractor}
                                    contentContainerStyle = {{ width: width/8, overflow: 'hidden' }}
                                />

                                <FlatList 
                                    data = {hours} 
                                    renderItem = { ( item ) => this.renderItem(item, 1) }
                                    keyExtractor = {this.keyExtractor}
                                    contentContainerStyle = {{ width: width/8, overflow: 'hidden' }}
                                />

                                <FlatList 
                                    data = {hours} 
                                    renderItem = { ( item ) => this.renderItem(item, 2) }
                                    keyExtractor = {this.keyExtractor}
                                    contentContainerStyle = {{ width: width/8, overflow: 'hidden' }}
                                />

                                <FlatList 
                                    data = {hours} 
                                    renderItem = { ( item ) => this.renderItem(item, 3) }
                                    keyExtractor = {this.keyExtractor}
                                    contentContainerStyle = {{ width: width/8, overflow: 'hidden' }}
                                />

                                <FlatList 
                                    data = {hours} 
                                    renderItem = { (item) => this.renderItem(item, 4) }
                                    keyExtractor = {this.keyExtractor}
                                    contentContainerStyle = {{ width: width/8, overflow: 'hidden' }}
                                />

                                <FlatList 
                                    data = {hours} 
                                    renderItem = { (item) => this.renderItem(item, 5) }
                                    keyExtractor = {this.keyExtractor}
                                    contentContainerStyle = {{ width: width/8, overflow: 'hidden' }}
                                />

                                <FlatList 
                                    data = {hours} 
                                    renderItem = { (item) => this.renderItem(item, 6) }
                                    keyExtractor = {this.keyExtractor}
                                    contentContainerStyle = {{ width: width/8, overflow: 'hidden' }}
                                />

                                <FlatList 
                                    data = {hours} 
                                    renderItem = { (item) => this.renderItem(item, 7) }
                                    keyExtractor = {this.keyExtractor}
                                    contentContainerStyle = {{ width: width/8, overflow: 'hidden' }}
                                />

                            </View>

                        </ScrollView>
    
                    </View>
    
                </View>
            )
    
        }
        else{
            return(
                <View style = {{ flex: 2, flexDirection: 'column' }}>

                    <View style = {{ position: 'absolute', height: '11%' }}>
                        <AppHeader title = "Time Table" />
                    </View>
                    
                    <View style = {{ top: '11%' }}>
                        <View style = {{ width: '70%', flexDirection: 'column', alignSelf: 'center' }}>

                            <FlatList
                                data = {this.getTodayDay()}
                                renderItem = {this.renderItemDaysPhone}
                                keyExtractor = {this.keyExtractor}
                                style = {{ width: '100%', alignSelf: 'center' }}
                            />

                            <FlatList
                                data = {hours}
                                renderItem = { (item) => this.renderItem(item, this.getDay()) }
                                keyExtractor = {this.keyExtractor}
                            />

                        </View>
                    </View>
        
                </View>
            )
        }
    
    }
    
}

const styles = StyleSheet.create({

    renderItemClass: {
        borderColor: blueBlack,
        borderWidth: 1
    }, 

    renderItemActiveClass: {
        borderColor: '#F4EBDB',
        borderWidth: 1
    },

    renderItemContent: {
        height: height/12
    },

    renderItemTodayClass: {
        flex: 1,
        borderLeftColor: '#fff',
        borderRightColor: '#fff',
        borderBottomColor: blueBlack,
        borderTopColor: blueBlack,
        borderWidth: 1
    },

    renderItemTodayContent: {
        backgroundColor: '#EAE2D6',
        height: height/12
    },

    renderItemClassPhone: {
        borderColor: blueBlack,
        borderWidth: 1,
    },

    renderItemActiveClassPhone: {
        borderColor: 'green',
        borderWidth: 2, 
    },

    listItemDaysText: {
        color: linen,  
        fontFamily: 'Lora'
    },

    listItemOddTitle: {
        color: periwinkle, 
        fontFamily: 'Lora'
    },

    listItemOddSubtitle: {
        color: periwinkleSubtitle, 
        fontFamily: 'Lora'
    },

    listItemOddContainer: {
        backgroundColor: rainClass, 
        height: height/12 
    },

    renderItemTodayContentOdd: {
        backgroundColor: '#EAE2D6',
        height: height/12,
        backgroundColor: rain
    },

    renderItemContentOdd: {
        height: height/12,
        backgroundColor: rain 
    },

    listItemEvenContainer: {
        backgroundColor: cadetBlue, 
        height: height/12
    },

    listItemEvenTitle: {
        color: smog, 
        fontFamily: 'Lora' 
    },

    listItemEvenSubtitle: {
        color: smogSubtitle, 
        fontFamily: 'Lora' 
    },

    renderItemTodayContentEven: {
        backgroundColor: '#EAE2D6',
        height: height/12,
        backgroundColor: cadetBlue 
    },

    renderItemContentEven: {
        height: height/12,
        backgroundColor: cadetBlue 
    }

})


/*

                    <View>
                    <ScrollView style = {{ width: '100%' }} refreshControl = { 
                            <RefreshControl refreshing = {true} onRefresh = { ()=>{
                                try{
                                    this.fetchClassesData()
                                    return alert("Refreshed")
                                }
                                catch(error){
                                    var errorMessage = error.message
                                    return alert(errorMessage)
                                }
                            }}/>
                    }>
                        <View style = {{ width: '70%', flexDirection: 'column', alignSelf: 'center' }}>

                            <FlatList
                                data = {this.getTodayDay()}
                                renderItem = {this.renderItemDaysPhone}
                                keyExtractor = {this.keyExtractor}
                                style = {{ width: '100%', alignSelf: 'center' }}
                            />

                            <FlatList
                                data = {hours}
                                renderItem = { (item) => this.renderItem(item, this.getDay()) }
                                keyExtractor = {this.keyExtractor}
                                style = {{}}
                            />

                        </View>
                    </ScrollView>
                    </View>

*/