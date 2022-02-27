import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ListItem } from 'react-native-elements';
import AppHeader from '../Components/AppHeader';
import app from '../config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import moment from 'moment';

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
            classesData: []
        }

        this.fetchClassesData();
    }


    componentDidMount(){
        this.getUserId();
    }


    componentDidUpdate(){
        if(this.state.classesData.length === 0){
            this.fetchClassesData()
        }
        else{

        }
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
                    classesData: updatedClassesData
                })
                return updatedClassesData

            })
        }
        else{
            console.log("Somehow, this is empty");
        }
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
        return(
            <ListItem bottomDivider = {true} style = {{ width: '100%', borderColor: 'purple', borderWidth: 2 }}>
                <ListItem.Content>
                    <ListItem.Title style = {{ alignSelf: 'center', fontFamily: 'Lora' }}>{item.title}</ListItem.Title>
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

    
    renderItemMonday = ({ item }) => {
        var classes = this.state.classesData;
        var classItem, isClass, x, classData;
        var day = 1;
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


    renderItemTuesday = ({ item }) => {

        var classes = this.state.classesData;
        var classItem, isClass, x, classData;
        // change in each renderItem
        var day = 2;
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


    renderItemWednesday = ({ item }) => {

        var classes = this.state.classesData;
        var classItem, isClass, x, classData;
        // change in each renderItem
        var day = 3;
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


    renderItemThursday = ({ item }) => {

        var classes = this.state.classesData;
        var classItem, isClass, x, classData;
        // change in each renderItem
        var day = 4;
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


    renderItemFriday = ({ item }) => {

        var classes = this.state.classesData;
        var classItem, isClass, x, classData;
        // change in each renderItem
        var day = 5;
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


    renderItemSaturday = ({ item }) => {

        var classes = this.state.classesData;
        var classItem, isClass, x, classData;
        // change in each renderItem
        var day = 6;
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


    renderItemSunday = ({ item }) => {

        var classes = this.state.classesData;
        var classItem, isClass, x, classData;
        // change in each renderItem
        var day = 0;
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


    whichFunctionToRender = () => {
        var day = moment().day()
        var renderItemThing

        if( day === 1 ){
            renderItemThing = this.renderItemMonday
        } 
        else if( day === 2 ){
            renderItemThing = this.renderItemTuesday
        }
        else if( day === 3 ){
            renderItemThing = this.renderItemWednesday
        }
        else if( day === 4 ){
            renderItemThing = this.renderItemThursday
        }
        else if( day === 5 ){
            renderItemThing = this.renderItemFriday
        }
        else if( day === 6 ){
            renderItemThing = this.renderItemSaturday
        }
        else if( day === 0 ){
            renderItemThing = this.renderItemSunday
        }

        return renderItemThing
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
                                    renderItem = {this.renderItemMonday}
                                    keyExtractor = {this.keyExtractor}
                                    contentContainerStyle = {{ width: width/8, overflow: 'hidden' }}
                                />

                                <FlatList 
                                    data = {hours} 
                                    renderItem = {this.renderItemTuesday}
                                    keyExtractor = {this.keyExtractor}
                                    contentContainerStyle = {{ width: width/8, overflow: 'hidden' }}
                                />

                                <FlatList 
                                    data = {hours} 
                                    renderItem = {this.renderItemWednesday}
                                    keyExtractor = {this.keyExtractor}
                                    contentContainerStyle = {{ width: width/8, overflow: 'hidden' }}
                                />

                                <FlatList 
                                    data = {hours} 
                                    renderItem = {this.renderItemThursday}
                                    keyExtractor = {this.keyExtractor}
                                    contentContainerStyle = {{ width: width/8, overflow: 'hidden' }}
                                />

                                <FlatList 
                                    data = {hours} 
                                    renderItem = {this.renderItemFriday}
                                    keyExtractor = {this.keyExtractor}
                                    contentContainerStyle = {{ width: width/8, overflow: 'hidden' }}
                                />

                                <FlatList 
                                    data = {hours} 
                                    renderItem = {this.renderItemSaturday}
                                    keyExtractor = {this.keyExtractor}
                                    contentContainerStyle = {{ width: width/8, overflow: 'hidden' }}
                                />

                                <FlatList 
                                    data = {hours} 
                                    renderItem = {this.renderItemSunday}
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
                    <View style = {{ height: '100%', overflow: 'scroll' }}>
    
                        <AppHeader title = "Time Table" />
    
                        <View style = {{ width: '100%'}}>
    
                            <View style = {{ width: '70%', alignSelf: 'center' }}>
     
                                <View>
                                    <FlatList
                                        data = {this.getTodayDay()}
                                        renderItem = {this.renderItemDaysPhone}
                                        keyExtractor = {this.keyExtractor}
                                    />
                                </View>
    
                                <View>
                                    <FlatList
                                        data = {hours}
                                        renderItem = {this.whichFunctionToRender()}
                                        keyExtractor = {this.keyExtractor}
                                        scrollEnabled = {true}
                                    />
                                </View>
    
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