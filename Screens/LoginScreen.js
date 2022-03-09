import React from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Modal, ScrollView, StyleSheet, ImageBackground, Platform, Dimensions } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, getAuth, updateProfile, sendPasswordResetEmail } from 'firebase/auth';      
import { getFirestore, collection, addDoc, getDocs, where, limit, updateDoc, doc, query } from 'firebase/firestore';
import app from '../config';
import * as Font from 'expo-font';

const width = Dimensions.get('screen').width

var customFonts = {
    'Lora-Bold': require('../assets/font/Lora-Bold.ttf'),
    'Lora': require('../assets/font/Lora-Regular.ttf')
};

export default class LoginScreen extends React.Component {

    constructor(){
        super();

        this.state = {
            firstName: '',
            lastName: '',
            emailID: '',
            password: '',
            confirmPassword: '',
            isModalVisible: false
        }
    }


    async _loadFontsAsync(){
        await Font.loadAsync(customFonts);
    }


    componentDidMount(){
        this._loadFontsAsync();
    }


    showModal = () => {
        return(
            <Modal
              animationType = 'fade'
              transparent = {true}
              visible = {this.state.isModalVisible}>
                  <View style = {styles.form}>

                      <ScrollView>
                          <KeyboardAvoidingView>

                              <Text style = {styles.formTitle}>Sign Up</Text>

                              <TextInput 
                                  placeholder = {'First Name'}
                                  placeholderTextColor = {'#F4EBDB'}
                                  onChangeText = {(text)=>{
                                      this.setState({
                                          firstName: text
                                      })
                                  }}
                                  value = {this.state.firstName}
                                  style = {styles.signUpTextInput}
                              />

                              <TextInput 
                                  placeholder = {'Last Name'}
                                  placeholderTextColor = {'#F4EBDB'}
                                  onChangeText = {(text)=>{
                                      this.setState({
                                          lastName: text
                                      })
                                  }}
                                  value = {this.state.lastName}
                                  style = {styles.signUpTextInput}
                              />

                              <TextInput 
                                  placeholder = {'Email ID'}
                                  placeholderTextColor = {'#F4EBDB'}
                                  onChangeText = {(text)=>{
                                      this.setState({
                                          emailID: text
                                      })
                                  }}
                                  keyboardType = 'email-address'
                                  value = {this.state.emailID}
                                  style = {styles.signUpTextInput}
                              />

                              <TextInput 
                                  placeholder = {'Password'}
                                  placeholderTextColor = {'#F4EBDB'}
                                  onChangeText = {(text)=>{
                                      this.setState({
                                          password: text
                                      })
                                  }}
                                  secureTextEntry = {true}
                                  value = {this.state.password}
                                  style = {styles.signUpTextInput}
                              />

                              <TextInput 
                                  placeholder = {'Confirm Password'}
                                  placeholderTextColor = {'#F4EBDB'}
                                  onChangeText = {(text)=>{
                                      this.setState({
                                          confirmPassword: text
                                      })
                                  }}
                                  secureTextEntry = {true}
                                  value = {this.state.confirmPassword}
                                  style = {styles.signUpTextInput}
                              />  

                              <TouchableOpacity
                                style = {styles.formButton}
                                onPress = {()=>{
                                    this.userSignUp(this.state.emailID, this.state.password);
                                    this.setState({
                                        isModalVisible: false
                                    });
                                }}>
                                  <Text style = {styles.formButtonText}>Register</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style = {styles.formButton}
                                onPress = {()=>{
                                    this.setState({
                                        isModalVisible: false
                                    })
                                }}>
                                  <Text style = {styles.formButtonText}>Cancel</Text>
                              </TouchableOpacity>

                          </KeyboardAvoidingView>
                      </ScrollView>

                  </View>
            </Modal>
        )
    }


    userSignUp = async (emailID, password) => {

        const db = getFirestore(app);
        const auth = getAuth(app);

        if(this.state.password !== this.state.confirmPassword){

            return alert("Password and Confirm Password do not match")
            
        }
        else{
        
            createUserWithEmailAndPassword(auth, emailID, password)
            .then( ()=>{

                this.updateUserProfile()

                try{
                    const userDoc = addDoc( collection(db, "users"), {
                        first_name: this.state.firstName,
                        last_name: this.state.lastName,
                        email_id: this.state.emailID,
                        password: this.state.password
                    })

                    return alert("New user has been registered");
                }
                catch(error){
                    return console.log("Error in Firestore \n" + error)
                }

            })
            .catch( (error)=>{
                var errorCode = error.code
                var errorMessage = error.message
                return alert("Error in Authentication \n" + errorMessage)
            });

        }

    }


    updateUserProfile = () => {
        const auth = getAuth(app);
        var name = this.state.firstName + " " + this.state.lastName

        updateProfile( auth.currentUser, {
            displayName: name
        })
        .then(()=>{
            console.log("added name to firebase auth")
        }) 
        .catch( (error)=>{
            var errorMessage = error.message
            var errorCode = error.code
            return alert(errorMessage)
        })
    }


    userLogin = async (emailID, password) => {
        var errorCode, errorMessage;

        const auth = getAuth(app);
        
        signInWithEmailAndPassword(auth, emailID, password)
        .catch( (error)=>{
            errorCode = error.code
            errorMessage = error.message
            return alert(errorMessage)
        })
        .then( async ()=>{
            if(errorMessage){

            }
            else{
                const db = getFirestore(app)
                const q = query( collection(db, 'users'), where('email_id','==',emailID), limit(1) )
                const querySnapshot = await getDocs(q)

                if(querySnapshot){
                    querySnapshot.forEach( (document)=>{

                        var firestorePassword = document.data().password
                        var docId = document.id

                        if(firestorePassword !== password){

                            updateDoc( doc(db, "users", docId), {
                                password: password
                            })

                        }

                    })
                }

                this.props.navigation.navigate('TabNavigator'); 
            }
        });

    }


    resetPassword = () => {
        const auth = getAuth(app);
        var userId = this.state.emailID

        sendPasswordResetEmail(auth, userId)
        .then( ()=>{
            return alert("Password-reset email sent")
        })
        .catch( (error)=>{
            var errorCode = error.code
            var errorMessage = error.message
            return alert(errorMessage)
        })
    }


    render(){
        return(
            <View style = {styles.container}>
                <ImageBackground source = {require('../assets/bg_img.jpeg')} style = {styles.imageBackground} resizeMode = 'cover'>
                    <ScrollView style = {styles.scrollView}>
    
                        <View style = {styles.titleBackground}>
                            <Text style = {styles.title}>DYNAMIC TIME TABLE</Text>
                        </View>
        
                        <View>
                            {this.showModal()}
                        </View>
        
                        <TextInput 
                            placeholder = {"Email ID"}
                            placeholderTextColor = {'#F4EBDB'}
                            keyboardType = 'email-address'
                            autoFocus = {true}
                            onChangeText = { (text)=>{
                                this.setState({
                                    emailID: text
                                })
                            }}
                            style = {styles.textInput}
                            blurOnSubmit = {true}
                        />
        
                        <TextInput 
                            placeholder = {"Password"}
                            placeholderTextColor = {'#F4EBDB'}
                            secureTextEntry = {true}
                            onChangeText = { (text)=>{
                                this.setState({
                                    password: text
                                })
                            }}
                            style = {styles.textInput}
                        />
        
                        <TouchableOpacity
                            style = {styles.button}
                            onPress = { ()=>{
                                this.userLogin(this.state.emailID, this.state.password);
                            }}>
                                <Text style = {styles.buttonText}>Login</Text>
                        </TouchableOpacity>
        
                        <TouchableOpacity
                            style = {styles.button}
                            onPress = { ()=>{
                                this.setState({
                                    isModalVisible: true
                                })
                            }}>
                                <Text style = {styles.buttonText}>Sign up</Text>
                        </TouchableOpacity>
        
                        <TouchableOpacity 
                            style = {styles.forgotButton}
                            onPress = {()=>{
                                this.resetPassword()
                            }}>
                                <Text style = {styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>
    
                    </ScrollView>

                </ImageBackground>
            </View>
        )
    }

}

const styles = StyleSheet.create({

    form: {
        margin: 100, 
        alignSelf: 'center', 
        width: '40%', 
        borderColor: '#FFF', 
        borderWidth: 2, 
        paddingHorizontal: 20, 
        paddingTop: 20, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },

    formTitle: {
        fontFamily: 'Lora', 
        color: '#F4EBDB', 
        fontWeight: 'bold', 
        fontSize: 17, 
        alignSelf: 'center' 
    },

    signUpTextInput: {
        fontFamily: 'Lora',
        backgroundColor: 'rgba(142, 197, 171, 0.9)',
        padding: 5,
        borderRadius: 3,
        borderBottomColor: '#021C1E',
        borderBottomWidth: 2,
        color: '#F4EBDB',
        alignSelf: 'center',
        margin: 10,
        width: '100%'
    },

    formButton: {
        backgroundColor: '#021C1E',
        padding: 10,
        justifyContent: 'center',
        shadowColor: '#004445',
        shadowOffset: { width: 5, height: 5 },
        shadowRadius: 5,
        alignSelf: 'center',
        marginBottom: 15,
        marginTop: 5,
        width: '15%'
    },

    formButtonText: {
        fontFamily: 'Lora',
        color: '#F4EBDB',
        alignSelf: 'center',
    },

    container: {
        width: '100%',
        height: '100%',
        backgroundColor: '#021C1E'
    },

    imageBackground: { 
        flex: 1, 
        justifyContent: 'center',
        marginHorizontal: '10%'
    },

    scrollView: {
        marginTop: '10%', 
        marginBottom: '20%'
    },

    titleBackground: {
        backgroundColor: 'rgba(6, 28, 30, 0.5)', 
        padding: 20, 
        alignSelf: 'center',
        marginBottom: '10%'
    },

    title: { 
        fontFamily: 'Lora-Bold', 
        color: '#F4EBDB', 
        fontSize: 80,
        fontWeight: '800' 
    },

    textInput: {
        fontFamily: 'Lora',
        backgroundColor: 'rgba(142, 197, 171, 0.7)',
        width: '60%',
        padding: 10,
        marginLeft: '8%',
        borderRadius: 3,
        borderBottomColor: '#021C1E',
        borderBottomWidth: 2,
        color: '#F4EBDB',
        fontSize: 16,
        marginBottom: 40,
    },

    button: {
        backgroundColor: '#021C1E',
        padding: 15,
        width: '10%',
        justifyContent: 'center',
        marginLeft: '8%',        
        shadowColor: '#004445',
        shadowOffset: { width: 5, height: 5 },
        shadowRadius: 5,
        marginBottom: 25
    },

    buttonText: {
        color: '#F4EBDB',
        fontFamily: 'Lora-Bold',
        alignSelf: 'center',
        fontSize: 16
    },

    forgotButton: {
        backgroundColor: 'rgba(0, 68, 69, 0.5)',
        marginLeft: '8%',
        alignSelf: 'flex-start'
    },

    forgotText: {
        fontFamily: 'Lora',
        color: '#F4EBDB',
        fontSize: 16
    },

})