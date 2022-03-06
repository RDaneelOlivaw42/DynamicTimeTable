import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import { Icon, Input, Card } from 'react-native-elements';
import ClassDetailsHeader from '../Components/ClassDetailsHeader';
import moment from 'moment';
import app from '../config';
import { getFirestore, deleteDoc, collection, where, query, addDoc, getDocs, limit, doc } from 'firebase/firestore';
moment().format();
import { LinearGradient } from 'expo-linear-gradient';

const height = Dimensions.get('window').height
const width = Dimensions.get('window').width

export default class ClassDetailsScreen extends React.Component {

    constructor(props){
        super(props);
        
        this.state = {
            classStartTime: this.props.navigation.getParam("data")["class_starting_timing"],
            classEndTime: this.props.navigation.getParam("data")["class_ending_timing"],
            classDate: this.props.navigation.getParam("data")["class_date"],
            otherDetails: this.props.navigation.getParam("data")["other_details"],
            userId: this.props.navigation.getParam("data")["user_id"],
            className: this.props.navigation.getParam("data")["class_name"]
        }
    }


    returnDate = () => {
        var date = moment( this.state.classDate ).format( 'DD-MM-YYYY');
        return date;
    }


    returnClassStartTime = () => {
        var classStartTime = moment( this.state.classStartTime ).format( 'HH:mm' );
        return classStartTime;
    }


    returnClassEndTime = () => {
        var classEndTime = moment( this.state.classEndTime ).format( 'HH:mm' );
        return classEndTime;
    }


    returnClassDuration = () => {
        var classStartTimeHr = moment( this.state.classStartTime ).hour()
        var classStartTimeMin = moment( this.state.classStartTime ).minute()
        var classEndTimeHr = moment( this.state.classEndTime ).hour()
        var classEndTimeMin = moment( this.state.classEndTime ).minute()

        var durationMinute = classEndTimeMin - classStartTimeMin;
        var durationHour = classEndTimeHr - classStartTimeHr;
        var displayMinute, displayHour

        if( durationMinute === 0 ){
            displayMinute = ''
        }
        else if( durationMinute === 1 ){
            displayMinute = durationMinute + " minute"
        }
        else{
            displayMinute = durationMinute + " minutes"
        }

        if( durationHour === 0 ){
            displayHour = ''
        }
        else if( durationHour === 1 ){
            displayHour = durationHour + " hour "
        }
        else{
            displayHour = durationHour + " hours "
        }

        var duration = displayHour + displayMinute;
        return duration;
    }


    deleteClass = async () => {
        const db = getFirestore(app)
        var docId

        const q = query( collection(db, "Scheduled Classes"), where('user_id','==',this.state.userId), where('class_name','==',this.state.className), where('class_date','==',this.state.classDate), where('class_starting_timing','==',this.state.classStartTime),
        where('class_ending_timing','==',this.state.classEndTime), where('other_details','==',this.state.otherDetails), limit(1))

        const documentReference = await getDocs(q)

        if(documentReference){
            documentReference.forEach( async (doc)=>{

                var docIdArray = documentReference.docs.map( document => document.id )
                docId = docIdArray.toString()

            })
        }
        else{
            return alert("documentReference does not exist")
        }

        await deleteDoc( doc(db, "Scheduled Classes", docId) )

        return alert("Class has been cancelled")
    }


    classAttended = async () => {
        const db = getFirestore(app);
        var docId

        //deleting document from Scheduled Classes
        const q = query( collection(db, "Scheduled Classes"), where('user_id','==',this.state.userId), where('class_name','==',this.state.className), where('class_date','==',this.state.classDate), where('class_starting_timing','==',this.state.classStartTime),
        where('class_ending_timing','==',this.state.classEndTime), where('other_details','==',this.state.otherDetails), limit(1))

        const documentReference = await getDocs(q)

        if(documentReference){
            documentReference.forEach( async (doc)=>{

                var docIdArray = documentReference.docs.map( document => document.id )
                docId = docIdArray.toString()

            })
        }
        else{
            return alert("Sod off")
        }

        await deleteDoc( doc(db, "Scheduled Classes", docId) )


        return alert("Class has been marked as attended")
    }


    textInput = (value) => {
        return(
            <TextInputMask 
                style = {styles.textInput}
                value = {value}
            />
        )
    }


    render(){
        return(
            <View>
                <ClassDetailsHeader title = "Class Details" />

            <View style = {styles.container}>
            <ScrollView style = {{ width: '100%' }}>

            <Card containerStyle = {styles.cardContainer}>
                <Text>
                    <Icon type = 'font-awesome' name = 'graduation-cap' color = {'#F4EBDB'} size = {22} />
                    <Card.Title style = {styles.title}>   Name of Class:</Card.Title>
                    <Text style = {styles.value}>  {this.state.className}</Text>
                </Text>

                <View style = {styles.line} />
            </Card>

            <Card containerStyle = {styles.cardContainer}>
                <Text>
                    <Icon type = 'font-awesome' name = 'calendar' color = {'#F4EBDB'} size = {22} />
                    <Card.Title style = {styles.title}>   Date of Class:</Card.Title>
                    <Text style = {styles.value}>  {this.state.classDate}</Text>
                </Text>

                <View style = {styles.line} />
            </Card>

            <Card containerStyle = {styles.cardContainer}>
                <Text>
                    <Icon type = 'font-awesome' name = 'hourglass-start' color = {'#F4EBDB'} size = {22} />
                    <Card.Title style = {styles.title}>   Class Starts at (in 24-hour clock):</Card.Title>
                    <Text style = {styles.value}>  {this.returnClassStartTime()}</Text>
                </Text>

                <View style = {styles.line} />
            </Card>

            <Card containerStyle = {styles.cardContainer}>
                <Text>
                    <Icon type = 'font-awesome' name = 'hourglass-end' color = {'#F4EBDB'} size = {22} />
                    <Card.Title style = {styles.title}>   Class Ends at (in 24-hour clock):</Card.Title>
                    <Text style = {styles.value}>  {this.returnClassEndTime()}</Text>
                </Text>

                <View style = {styles.line} />
            </Card>

            <Card containerStyle = {styles.cardContainer}>
                <Text>
                    <Icon type = 'font-awesome' name = 'clock-o' color = {'#F4EBDB'} size = {22} />
                    <Card.Title style = {styles.title}>   Class Duration:</Card.Title>
                    <Text style = {styles.value}>  {this.returnClassDuration()}</Text>
                </Text>

                <View style = {styles.line} />
            </Card>

            <Card containerStyle = {styles.cardContainer}>
                <Text>
                    <Icon type = 'font-awesome' name = 'map' color = {'#F4EBDB'} size = {22} />
                    <Card.Title style = {styles.title}>   Other Details:</Card.Title>
                    <Text style = {styles.value}>  {this.state.otherDetails}</Text>
                </Text>

                <View style = {styles.line} />
            </Card>

            </ScrollView>

            <View style = {styles.buttonsContainer}>
            <TouchableOpacity 
            style = {[ styles.button, { marginRight: 60 } ]}
            onPress = {()=>{
                this.deleteClass();
            }}>
                <Text style = {styles.buttonText}>Cancel Class</Text>
            </TouchableOpacity>

            <TouchableOpacity 
            style = {styles.button}
            onPress = {()=>{
                this.classAttended();
            }}>
                <Text style = {styles.buttonText}>Attended Class</Text>
            </TouchableOpacity>
            </View>

            </View>

            </View>
        )
    }

}


const styles = StyleSheet.create({

    title: {
        fontFamily: 'Lora',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#F4EBDB',
    },

    value: {
        fontFamily: 'Lora',
        fontSize: 14,
        color: '#F4EBDB',
    },

    cardContainer: {
        backgroundColor: 'rgba(44, 120, 115, 0.7)',
        width: '85%',
        alignSelf: 'center',
        marginTop: 30
    },

    line: {
        width: '100%', 
        backgroundColor: '#F4EBDB', 
        height: 1,
        marginTop: 10
    },

    button: {
        alignSelf: 'center',
        backgroundColor: '#021C1E',
        paddingVertical: 15,
        shadowColor: '#2C4A52',
        shadowOffset: { width: 4, height: 4 },
        shadowRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        paddingHorizontal: 20
    },

    buttonText: {
        fontFamily: 'Lora',
        fontSize: 20,
        color: '#F4EBDB'
    },

    container: {
        marginTop: '0.5%',
        alignItems: 'center'
    },

    buttonsContainer: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',

    }

})