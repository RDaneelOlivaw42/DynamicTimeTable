import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Dimensions, Platform } from 'react-native';
import AppHeader from "../Components/AppHeader";
import app from "../config";
import { getFirestore, addDoc, collection } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Input } from 'react-native-elements';
import { TextInputMask } from 'react-native-masked-text';
import moment from 'moment';
moment().format();
var momentito = require('moment-timezone')


export default class FormScreen extends React.Component {

    constructor(){
        super();

        this.state = {
            className: '',
            classDate: '',
            classStartingTiming: '',
            classEndingTiming: '',
            otherDetails: '',
            userId: '',
            isDateValid: false
        }
    }


    componentDidMount(){
        this.getUserId();
    }


    getUserId = () => {
        const auth = getAuth(app);

        onAuthStateChanged(auth, (user)=>{
            if(user){
                const userId = user.email

                this.setState({
                    userId: userId
                });
            }
        });
    }


    scheduleClass = () => {

        if( !this.state.className || !this.state.classDate || !this.state.classStartingTiming || !this.state.classEndingTiming ){
            return alert("Insufficient data to schedule class. Fill all the fields, then schedule.");
        }
        else{

            if(this.state.isDateValid === true){

                const db = getFirestore(app);
                var location = moment.tz.guess()

                var classDate = this.state.classDate;
                var classStartingTiming = this.state.classStartingTiming;
                var classEndingTiming = this.state.classEndingTiming;
        
                var classStart = classDate + " " + classStartingTiming
                var classEnd = classDate + " " + classEndingTiming
        
                var classStartDraft = moment.tz(classStart, 'DD-MM-YYYY HH:mm', location)
                var classEndDraft = moment.tz(classEnd, 'DD-MM-YYYY HH:mm', location)
                var classDateDraft = moment.tz(classDate, 'DD-MM-YYYY', location)

                var classStartMoment = classStartDraft.format()
                var classEndMoment = classEndDraft.format()
                var classDateMoment = classDateDraft.format()

                try{
    
                    const classDoc = addDoc( collection(db, "Scheduled Classes"), {
                        user_id: this.state.userId,
                        class_name: this.state.className,
                        class_date: classDateMoment,
                        class_starting_timing: classStartMoment,
                        class_ending_timing: classEndMoment,
                        other_details: this.state.otherDetails,
                    });
    
                    return alert("Class Scheduled")
    
                }
                catch(error){
                    console.log("Error in Firestore: " + error);
                }; 

            }
            else{
                return alert("Class Date is not valid");
            }

        }

    }


    checkIsClassDateValid = () => {
        var dateValid = this.classDate.isValid()

        this.setState({
            isDateValid: dateValid
        });
    }


    classDateField = () => {
        return(
            <TextInputMask 
                style = {styles.textInputMask}
                placeholder = {'DD-MM-YYYY'}
                placeholderTextColor = {'#F1DCC9'}
                type = {'datetime'}
                options = {{
                    format: 'DD-MM-YYYY'
                }}
                value = {this.state.classDate}
                onChangeText = { (text)=>{

                    this.setState({
                        classDate: text
                    })

                    this.checkIsClassDateValid();

                }}
                ref = { (ref) => this.classDate = ref }
            />
        )
    }

    
    classStartingTiming = () => {
        return(
            <TextInputMask
                style = {styles.textInputMask}
                placeholder = {'HR:MIN'}
                placeholderTextColor = {'#F1DCC9'}
                type = {'datetime'}
                options = {{
                    format: 'HH:mm'
                }}
                value = {this.state.classStartingTiming}
                onChangeText = { (text)=>{

                    this.setState({
                        classStartingTiming: text
                    })

                }}
            />
        )
    }


    classEndingTiming = () => {
        return(
            <TextInputMask
                style = {styles.textInputMask}
                placeholder = {'HR:MIN'}
                placeholderTextColor = {'#F1DCC9'}
                type = {'datetime'}
                options = {{
                    format: 'HH:mm'
                }}
                value = {this.state.classEndingTiming}
                onChangeText = { (text)=>{

                    this.setState({
                        classEndingTiming: text
                    })

                }}
            />
        )
    }


    classNameField = () => {
        return(
            <TextInput 
                style = {styles.textInputMask}
                placeholder = {'Class Name'}
                placeholderTextColor = {'#F1DCC9'}
                onChangeText = {(text)=>{
                    this.setState({
                        className: text
                    })
                }}
                value = {this.state.className}
            />
        )
    }


    otherDetailsField = () => {
        return(
            <TextInput
                style = {styles.textInputMask}
                placeholder = {'Other necessary details for the class'}
                placeholderTextColor = {'#F1DCC9'}
                onChangeText = { (text)=>{
                    this.setState({
                        otherDetails: text
                    })
                }}
                value = {this.state.otherDetails}
            />
        )
    }


    render(){
        return(
            <View>
                <AppHeader title = "Schedule Class" />

                <View style = {styles.view}>

                    <ScrollView style = {styles.scrollView} contentContainerStyle = {styles.scrollViewContent}>

                        <Input 
                            label = {'Class Name'}
                            labelStyle = {styles.label}
                            InputComponent = {this.classNameField}
                            leftIcon = {{ type: 'font-awesome', name: 'graduation-cap', color: '#F4EBDB', size: 22 }}
                            autoFocus = {true}
                            containerStyle = {styles.input}
                        />
    
                        <Input
                            label = {'Class Date'}
                            labelStyle = {styles.label}
                            InputComponent = {this.classDateField}
                            leftIcon = {{ type: 'font-awesome', name: 'calendar', color: '#F4EBDB', size: 22 }}
                            containerStyle = {styles.input}
                        />
    
                        <Input
                            label = {'Class Starts at (in 24-hour clock)'}
                            labelStyle = {styles.label}
                            InputComponent = {this.classStartingTiming}
                            containerStyle = {styles.input}
                            leftIcon = {{ type: 'font-awesome', name: 'hourglass-start', color: '#F4EBDB', size: 22 }}
                        />
    
                        <Input
                            label = {'Class Ends at (in 24-hour clock)'}
                            labelStyle = {styles.label}
                            InputComponent = {this.classEndingTiming}
                            containerStyle = {styles.input}
                            leftIcon = {{ type: 'font-awesome', name: 'hourglass-end', color: '#F4EBDB', size: 22 }}
                        />
    
                        <Input
                            label = {'Other Details'}
                            labelStyle = {styles.label}
                            InputComponent = {this.otherDetailsField}
                            containerStyle = {styles.input}
                            leftIcon = {{ type: 'font-awesome', name: 'map', color: '#F4EBDB', size: 22 }}
                        />

                        <TouchableOpacity
                            style = {styles.button}
                            onPress = {()=>{
                                this.scheduleClass();
                            }}>
                                <Text style = {styles.buttonText}>Schedule Class</Text>
                        </TouchableOpacity>

                    </ScrollView>

                </View>

            </View>
        )
    }

}

const styles = StyleSheet.create({

    view: {
        display: 'flex',
        flex: 6,
        marginTop: '0.5%',
        alignItems: 'center'
    },

    scrollView: {
        width: '100%'
    },

    scrollViewContent: {
        alignItems: 'center'
    },

    textInputMask: {
        fontSize: 15,
        fontFamily: 'Lora',
        padding: 10,
        opacity: 0.68,
        borderBottomColor: '#F4EBDB',
        borderBottomWidth: 1,
        width: '100%',
    },

    label: {
        color: '#F4EBDB',
        fontFamily: 'Lora',
        fontSize: 15,
        marginTop: 2
    },

    input: {
        marginBottom: 40, 
        backgroundColor: 'rgba(44, 120, 115, 0.7)',
        borderRadius: 3,
        width: '85%'
    },

    button: {
        backgroundColor: '#021C1E',
        paddingHorizontal: 20,
        paddingVertical: 15,
        shadowColor: '#2C4A52',
        shadowOffset: { width: 4, height: 4 },
        shadowRadius: 5
    },

    buttonText: {
        fontFamily: 'Lora',
        fontSize: 20,
        color: '#F4EBDB'
    }

})