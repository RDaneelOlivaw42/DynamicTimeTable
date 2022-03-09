import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Dimensions } from 'react-native';
import { Icon } from 'react-native-elements';
import AppHeader from '../Components/AppHeader';
import app from '../config';
import { getFirestore, collection, getDocs, where, query, limit, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from 'firebase/auth'

export default class SettingsScreen extends React.Component {

    constructor(){
        super();

        this.state = {
            emailId: '',
            userDetails: '',
            docId: '',
            firstName: '',
            lastName: '',
            password: '',
            newPassword: '',
            changedFirstName: '',
            changedLastName: ''
        }
    }


    componentDidMount(){
        this.getUserId();
        this.fetchUserDetails();
    }


    getUserId = () => {
        var auth = getAuth(app);

        onAuthStateChanged( auth, (user)=>{
            if(user){
                const userId = user.email

                this.setState({
                    emailId: userId
                });
            }
        });
    }


    fetchUserDetails = async () => {
        var db = getFirestore(app);
        var userId = this.state.emailId

        const q = query( collection(db, 'users'), where('email_id','==',userId), limit(1) )

        const querySnapshot = await getDocs(q)

        if(querySnapshot){

            querySnapshot.forEach( (doc)=>{

                var fetchedDocId = doc.id
                var fetchedData = doc.data()
                this.setState({
                    docId: fetchedDocId,
                    userDetails: fetchedData,
                    firstName: fetchedData.first_name,
                    lastName: fetchedData.last_name,
                    password: fetchedData.password
                })
            
            })

        }
        else{

        }
    }


    reauthenticateAndChangePassword = () => {
        const auth = getAuth(app);
        const user = auth.currentUser;
        var userId = this.state.emailId
        var currentPassword = this.state.password
        var newPassword = this.state.newPassword

        const credential = EmailAuthProvider.credential(userId, currentPassword)

        if(newPassword){
            var errorMessageReauthenticate, errorCodeReauthenticate

            reauthenticateWithCredential( user, credential )
            .catch( (error)=>{
                errorMessageReauthenticate = error.message
                errorCodeReauthenticate = error.code
                alert(errorMessageReauthenticate)
            })
            .then( ()=>{

                if(errorMessageReauthenticate){

                }
                else{

                    var errorMessagePassword, errorCodePassword
    
                    updatePassword(user, newPassword)
                    .catch( (error)=>{
                        errorMessagePassword = error.message
                        errorCodePassword = error.code
                        alert(errorMessagePassword)
                    })
                    .then( ()=>{
                        if(errorMessagePassword){

                        } 
                        else{
                            return alert("Profile Changed Successfully")
                        }
                    })

                }
    
            })

        }
        else{
            return alert("Profile Changed Successfully")
        }

    }


    updateUserProfile = async () => {
        const db = getFirestore(app);
        const auth = getAuth(app);
        const user = auth.currentUser;
        var docId = this.state.docId;
        const documentReference = doc(db, "users", docId);
        var userId = this.state.emailId;
        var password, firstName, lastName, name;

        if( this.state.newPassword ){
            password = this.state.newPassword
        }
        else{
            password = this.state.password
        }

        if( this.state.changedFirstName ){
            firstName = this.state.changedFirstName
        }
        else{
            firstName = this.state.firstName
        }

        if( this.state.changedLastName ){
            lastName = this.state.changedLastName
        }
        else{
            lastName = this.state.lastName
        }

        await setDoc( documentReference, {
            first_name: firstName,
            last_name: lastName,
            password: password,
            email_id: userId
        });

        name = firstName + " " + lastName

        updateProfile(user, {
            displayName: name
        })
        .then( ()=>{

        })
        .catch( (error)=>{
            var errorMessage = error.message
            var errorCode = error.code
            alert(errorMessage)
        })

    }


    deleteUser = async () => {
        const auth = getAuth(app);
        const user = auth.currentUser;
        var errorMessage, errorCode

        deleteUser(user)
        .catch( (error)=>{
            errorMessage = error.message;
            errorCode = error.code;
            return alert(errorMessage);
        })
        .then( ()=>{
            if(!errorMessage){
                const db = getFirestore(app)
                var docId = this.state.docId

                deleteDoc( doc(db, "users", docId) )

                return alert("Deleted User")
            }
            else{

            }
        })

    }


    render(){
        var userDetails = this.fetchUserDetails()

        if( Dimensions.get('window').width >= 826 && ( Platform.OS === 'macos' || Platform.OS === 'windows' || Platform.OS === 'web' ) ){
            return(
                <View>
                    <AppHeader title = "Settings" />
    
                    <View style = {styles.view}>
    
                    <ScrollView style = {{ width: '100%' }} contentContainerStyle = {{ alignItems: 'center' }}>
                    <Icon type = 'font-awesome' name = 'cogs' size = {75} />
    
                    <TextInput 
                       placeholder = {this.state.firstName}
                       placeholderTextColor = {'#F4EBDB'}
                       onChangeText = { (text)=>{
                           this.setState({
                               changedFirstName: text
                           })
                       }}
                       style = {[ styles.textInput, { marginTop: '5%' } ]}
                    />
    
                    <TextInput
                       placeholder = {this.state.lastName}
                       placeholderTextColor = {'#F4EBDB'}
                       onChangeText = { (text)=>{
                           this.setState({
                               changedLastName: text
                           })
                       }}
                       style = {styles.textInput}
                    />
    
                    <TextInput 
                       placeholder = {this.state.password}
                       placeholderTextColor = {'#F4EBDB'}
                       onChangeText = { (text)=>{
                           this.setState({
                               newPassword: text
                           })
                       }}
                       style = {styles.textInput}
                    />
    
                    <TouchableOpacity 
                       onPress = {()=>{
                        this.reauthenticateAndChangePassword();
                        this.updateUserProfile();
                       }}
                       style = {styles.saveButton}>
                        <Text style = {styles.buttonText}>Save Changes</Text>
                    </TouchableOpacity>
    
                    <TouchableOpacity onPress = {()=>{
                        this.deleteUser();
                    }}
                        style = {styles.deleteButton}>
                        <Text style = {styles.buttonText}>Delete User</Text>
                    </TouchableOpacity>
    
                    </ScrollView>
    
                    </View>
    
                </View>
            )
        }
        else if( Platform.OS === 'android' || Platform.OS === 'ios' || width > 826 ){
            return(
                <View style = {styles.container}>

                    <View style = {{ height: '22%' }}>
                        <AppHeader title = "Settings" />
                    </View>

                    <ScrollView style = {{ width: '100%' }} contentContainerStyle = {{ alignItems: 'center' }}>

                        <Icon type = 'font-awesome' name = 'cogs' size = {75} />
        
                        <TextInput 
                            placeholder = {this.state.firstName}
                            placeholderTextColor = {'#F4EBDB'}
                            onChangeText = { (text)=>{
                                this.setState({
                                    changedFirstName: text
                                })
                            }}
                            style = {[ styles.textInput, { marginTop: '10%' } ]}
                        />
        
                        <TextInput
                            placeholder = {this.state.lastName}
                            placeholderTextColor = {'#F4EBDB'}
                            onChangeText = { (text)=>{
                                this.setState({
                                    changedLastName: text
                                })
                            }}
                            style = {styles.textInput}
                        />
        
                        <TextInput 
                            placeholder = {this.state.password}
                            placeholderTextColor = {'#F4EBDB'}
                            onChangeText = { (text)=>{
                                this.setState({
                                    newPassword: text
                                })
                            }}
                            style = {styles.textInput}
                        />
        
                        <TouchableOpacity 
                            onPress = {()=>{
                                this.reauthenticateAndChangePassword();
                                this.updateUserProfile();
                            }}
                            style = {styles.saveButton}>
                            <Text style = {styles.buttonText}>Save Changes</Text>
                        </TouchableOpacity>
        
                        <TouchableOpacity 
                            onPress = {()=>{
                                this.deleteUser();
                            }}
                            style = {styles.deleteButton}>
                            <Text style = {styles.buttonText}>Delete User</Text>
                        </TouchableOpacity>
        
                    </ScrollView>

                </View>
            )
        }
    }

}

const stylesAndroid = StyleSheet.create({

    container: {
        display: 'flex', 
        flexDirection: 'column' 
    },

    textInput: {
        backgroundColor: 'rgba(44, 120, 115, 0.7)',
        marginBottom: 40,
        paddingVertical: 8,
        fontFamily: 'Lora-Bold',
        color: '#F4EBDB',
        paddingLeft: 10,
        fontSize: 15,
        borderRadius: 4,
        borderBottomColor: '#2C4A52',
        borderBottomWidth: 3,
        width: '70%'
    },

    saveButton: {
        backgroundColor: '#021C1E',
        width: '11%',
        paddingHorizontal: 17,
        paddingVertical: 10,
        marginBottom: 30,
        shadowColor: '#2C4A52',
        shadowOffset: { width: 4, height: 4 },
        shadowRadius: 5,
        marginTop: 30,
        alignSelf: 'center'
    },

    deleteButton: {
        backgroundColor: 'red',
        width: '11%',
        paddingHorizontal: 17,
        paddingVertical: 10,
        alignSelf: 'center'
    },

    buttonText: {
        color: '#f4EBDB',
        alignSelf: 'center',
        fontFamily: 'Lora-Bold',
        fontSize: 16
    }

})

const stylesIOS = StyleSheet.create({

    container: {
        display: 'flex', 
        flexDirection: 'column' 
    },

    textInput: {
        backgroundColor: 'rgba(44, 120, 115, 0.7)',
        marginBottom: 40,
        paddingVertical: 8,
        fontFamily: 'Lora-Bold',
        color: '#F4EBDB',
        paddingLeft: 10,
        fontSize: 15,
        borderRadius: 4,
        borderBottomColor: '#2C4A52',
        borderBottomWidth: 3,
        width: '70%'
    },

    saveButton: {
        backgroundColor: '#021C1E',
        width: '50%',
        paddingHorizontal: 17,
        paddingVertical: 10,
        marginBottom: 30,
        shadowColor: '#2C4A52',
        shadowOffset: { width: 4, height: 4 },
        shadowRadius: 5,
        marginTop: 30,
        alignSelf: 'center'
    },

    deleteButton: {
        backgroundColor: 'red',
        width: '50%',
        paddingHorizontal: 17,
        paddingVertical: 10,
        alignSelf: 'center'
    },

    buttonText: {
        color: '#f4EBDB',
        alignSelf: 'center',
        fontFamily: 'Lora-Bold',
        fontSize: 16
    }

})

const styles2 = StyleSheet.create({

    view: {
        marginTop: '4%',
        alignItems: 'center'
    },

    textInput: {
        backgroundColor: 'rgba(44, 120, 115, 0.7)',
        marginBottom: 40,
        paddingVertical: 10,
        fontFamily: 'Lora-Bold',
        color: '#F4EBDB',
        paddingLeft: 10,
        fontSize: 15,
        borderRadius: 4,
        borderBottomColor: '#2C4A52',
        borderBottomWidth: 3,
        width: '50%'
    },

    saveButton: {
        backgroundColor: '#021C1E',
        width: '11%',
        paddingHorizontal: 17,
        paddingVertical: 10,
        marginBottom: 30,
        shadowColor: '#2C4A52',
        shadowOffset: { width: 4, height: 4 },
        shadowRadius: 5,
        marginTop: 30,
        alignSelf: 'center'
    },

    deleteButton: {
        backgroundColor: 'red',
        width: '11%',
        paddingHorizontal: 17,
        paddingVertical: 10,
        alignSelf: 'center'
    },

    buttonText: {
        color: '#f4EBDB',
        alignSelf: 'center',
        fontFamily: 'Lora-Bold',
        fontSize: 16
    }

})


const styles = StyleSheet.create({

    view: {
        marginTop: '4%',
        alignItems: 'center'
    },

    textInput: {
        backgroundColor: 'rgba(44, 120, 115, 0.7)',
        marginBottom: 40,
        paddingVertical: 10,
        fontFamily: 'Lora-Bold',
        color: '#F4EBDB',
        paddingLeft: 10,
        fontSize: 15,
        borderRadius: 4,
        borderBottomColor: '#2C4A52',
        borderBottomWidth: 3,
        width: '50%'
    },

    saveButton: {
        backgroundColor: '#021C1E',
        width: '11%',
        paddingHorizontal: 17,
        paddingVertical: 10,
        marginBottom: 30,
        shadowColor: '#2C4A52',
        shadowOffset: { width: 4, height: 4 },
        shadowRadius: 5,
        marginTop: 30,
        alignSelf: 'center'
    },

    deleteButton: {
        backgroundColor: 'red',
        width: '11%',
        paddingHorizontal: 17,
        paddingVertical: 10,
        alignSelf: 'center'
    },

    buttonText: {
        color: '#f4EBDB',
        alignSelf: 'center',
        fontFamily: 'Lora-Bold',
        fontSize: 16
    }

})

/*import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Dimensions } from 'react-native';
import { Icon } from 'react-native-elements';
import AppHeader from '../Components/AppHeader';
import app from '../config';
import { getFirestore, collection, getDocs, where, query, limit, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from 'firebase/auth'

export default class SettingsScreen extends React.Component {

    constructor(){
        super();

        this.state = {
            emailId: '',
            userDetails: '',
            docId: '',
            firstName: '',
            lastName: '',
            password: '',
            newPassword: '',
            changedFirstName: '',
            changedLastName: ''
        }
    }


    componentDidMount(){
        this.getUserId();
        this.fetchUserDetails();
    }


    getUserId = () => {
        var auth = getAuth(app);

        onAuthStateChanged( auth, (user)=>{
            if(user){
                const userId = user.email

                this.setState({
                    emailId: userId
                });
            }
        });
    }


    fetchUserDetails = async () => {
        var db = getFirestore(app);
        var userId = this.state.emailId

        const q = query( collection(db, 'users'), where('email_id','==',userId), limit(1) )

        const querySnapshot = await getDocs(q)

        if(querySnapshot){

            querySnapshot.forEach( (doc)=>{

                var fetchedDocId = doc.id
                var fetchedData = doc.data()
                this.setState({
                    docId: fetchedDocId,
                    userDetails: fetchedData,
                    firstName: fetchedData.first_name,
                    lastName: fetchedData.last_name,
                    password: fetchedData.password
                })
            
            })

        }
        else{

        }
    }


    reauthenticateAndChangePassword = () => {
        const auth = getAuth(app);
        const user = auth.currentUser;
        var userId = this.state.emailId
        var currentPassword = this.state.password
        var newPassword = this.state.newPassword

        const credential = EmailAuthProvider.credential(userId, currentPassword)

        if(newPassword){
            var errorMessageReauthenticate, errorCodeReauthenticate

            reauthenticateWithCredential( user, credential )
            .catch( (error)=>{
                errorMessageReauthenticate = error.message
                errorCodeReauthenticate = error.code
                alert(errorMessageReauthenticate)
            })
            .then( ()=>{

                if(errorMessageReauthenticate){

                }
                else{

                    var errorMessagePassword, errorCodePassword
    
                    updatePassword(user, newPassword)
                    .catch( (error)=>{
                        errorMessagePassword = error.message
                        errorCodePassword = error.code
                        alert(errorMessagePassword)
                    })
                    .then( ()=>{
                        if(errorMessagePassword){

                        } 
                        else{
                            return alert("Profile Changed Successfully")
                        }
                    })

                }
    
            })

        }
        else{
            return alert("Profile Changed Successfully")
        }

    }


    updateUserProfile = async () => {
        const db = getFirestore(app);
        const auth = getAuth(app);
        const user = auth.currentUser;
        var docId = this.state.docId;
        const documentReference = doc(db, "users", docId);
        var userId = this.state.emailId;
        var password, firstName, lastName, name;

        if( this.state.newPassword ){
            password = this.state.newPassword
        }
        else{
            password = this.state.password
        }

        if( this.state.changedFirstName ){
            firstName = this.state.changedFirstName
        }
        else{
            firstName = this.state.firstName
        }

        if( this.state.changedLastName ){
            lastName = this.state.changedLastName
        }
        else{
            lastName = this.state.lastName
        }

        await setDoc( documentReference, {
            first_name: firstName,
            last_name: lastName,
            password: password,
            email_id: userId
        });

        name = firstName + " " + lastName

        updateProfile(user, {
            displayName: name
        })
        .then( ()=>{

        })
        .catch( (error)=>{
            var errorMessage = error.message
            var errorCode = error.code
            alert(errorMessage)
        })

    }


    deleteUser = async () => {
        const auth = getAuth(app);
        const user = auth.currentUser;
        var errorMessage, errorCode

        deleteUser(user)
        .catch( (error)=>{
            errorMessage = error.message;
            errorCode = error.code;
            return alert(errorMessage);
        })
        .then( ()=>{
            if(!errorMessage){
                const db = getFirestore(app)
                var docId = this.state.docId

                deleteDoc( doc(db, "users", docId) )

                return alert("Deleted User")
            }
            else{

            }
        })

    }


    render(){
        var userDetails = this.fetchUserDetails()

        if( Dimensions.get('window').width >= 826 && ( Platform.OS === 'macos' || Platform.OS === 'windows' || Platform.OS === 'web' ) ){
            return(
                <View>
                    <AppHeader title = "Settings" />
    
                    <View style = {styles.view}>
    
                    <ScrollView style = {{ width: '100%' }} contentContainerStyle = {{ alignItems: 'center' }}>
                    <Icon type = 'font-awesome' name = 'cogs' size = {75} />
    
                    <TextInput 
                       placeholder = {this.state.firstName}
                       placeholderTextColor = {'#F4EBDB'}
                       onChangeText = { (text)=>{
                           this.setState({
                               changedFirstName: text
                           })
                       }}
                       style = {[ styles.textInput, { marginTop: '5%' } ]}
                    />
    
                    <TextInput
                       placeholder = {this.state.lastName}
                       placeholderTextColor = {'#F4EBDB'}
                       onChangeText = { (text)=>{
                           this.setState({
                               changedLastName: text
                           })
                       }}
                       style = {styles.textInput}
                    />
    
                    <TextInput 
                       placeholder = {this.state.password}
                       placeholderTextColor = {'#F4EBDB'}
                       onChangeText = { (text)=>{
                           this.setState({
                               newPassword: text
                           })
                       }}
                       style = {styles.textInput}
                    />
    
                    <TouchableOpacity 
                       onPress = {()=>{
                        this.reauthenticateAndChangePassword();
                        this.updateUserProfile();
                       }}
                       style = {styles.saveButton}>
                        <Text style = {styles.buttonText}>Save Changes</Text>
                    </TouchableOpacity>
    
                    <TouchableOpacity onPress = {()=>{
                        this.deleteUser();
                    }}
                        style = {styles.deleteButton}>
                        <Text style = {styles.buttonText}>Delete User</Text>
                    </TouchableOpacity>
    
                    </ScrollView>
    
                    </View>
    
                </View>
            )
        }
        else if( Platform.OS === 'android' || Platform.OS === 'ios' || width > 826 ){
            return(
                <View style = {{ display: 'flex', flexDirection: 'column' }}>

                    <View style = {{ height: '22%' }}>
                        <AppHeader title = "Settings" />
                    </View>

                    <ScrollView style = {{ width: '100%' }} contentContainerStyle = {{ alignItems: 'center' }}>

                        <Icon type = 'font-awesome' name = 'cogs' size = {75} />
        
                        <TextInput 
                            placeholder = {this.state.firstName}
                            placeholderTextColor = {'#F4EBDB'}
                            onChangeText = { (text)=>{
                                this.setState({
                                    changedFirstName: text
                                })
                            }}
                            style = {[ styles.textInput, { marginTop: '10%', width: '70%', paddingVertical: 8 } ]}
                        />
        
                        <TextInput
                            placeholder = {this.state.lastName}
                            placeholderTextColor = {'#F4EBDB'}
                            onChangeText = { (text)=>{
                                this.setState({
                                    changedLastName: text
                                })
                            }}
                            style = {[ styles.textInput, { width: '70%', paddingVertical: 8 } ]}
                        />
        
                        <TextInput 
                            placeholder = {this.state.password}
                            placeholderTextColor = {'#F4EBDB'}
                            onChangeText = { (text)=>{
                                this.setState({
                                    newPassword: text
                                })
                            }}
                            style = {[ styles.textInput, { width: '70%', paddingVertical: 8 } ]}
                        />
        
                        <TouchableOpacity 
                            onPress = {()=>{
                                this.reauthenticateAndChangePassword();
                                this.updateUserProfile();
                            }}
                            style = {[styles.saveButton, { width: '50%' }]}>
                            <Text style = {styles.buttonText}>Save Changes</Text>
                        </TouchableOpacity>
        
                        <TouchableOpacity 
                            onPress = {()=>{
                                this.deleteUser();
                            }}
                            style = {[styles.deleteButton, { width: '50%' }]}>
                            <Text style = {styles.buttonText}>Delete User</Text>
                        </TouchableOpacity>
        
                    </ScrollView>

                </View>
            )
        }
    }

}


const styles = StyleSheet.create({

    view: {
        marginTop: '4%',
        alignItems: 'center'
    },

    textInput: {
        backgroundColor: 'rgba(44, 120, 115, 0.7)',
        marginBottom: 40,
        paddingVertical: 10,
        fontFamily: 'Lora-Bold',
        color: '#F4EBDB',
        paddingLeft: 10,
        fontSize: 15,
        borderRadius: 4,
        borderBottomColor: '#2C4A52',
        borderBottomWidth: 3,
        width: '50%'
    },

    saveButton: {
        backgroundColor: '#021C1E',
        width: '11%',
        paddingHorizontal: 17,
        paddingVertical: 10,
        marginBottom: 30,
        shadowColor: '#2C4A52',
        shadowOffset: { width: 4, height: 4 },
        shadowRadius: 5,
        marginTop: 30,
        alignSelf: 'center'
    },

    deleteButton: {
        backgroundColor: 'red',
        width: '11%',
        paddingHorizontal: 17,
        paddingVertical: 10,
        alignSelf: 'center'
    },

    buttonText: {
        color: '#f4EBDB',
        alignSelf: 'center',
        fontFamily: 'Lora-Bold',
        fontSize: 16
    }

})*/