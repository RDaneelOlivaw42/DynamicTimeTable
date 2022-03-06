import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon, Avatar } from 'react-native-elements';
import { DrawerItems } from 'react-navigation-drawer';
import { signOut, getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, query, collection, where, limit, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import app from '../config';
import * as ImagePicker from 'expo-image-picker';

export default class CustomSideBarMenu extends React.Component {


    constructor(props){
        super(props);

        this.state = {
            userId: '',
            image: '',
            fetchedNameFirebase: '',
            runFetchImage: 0
        }
    }


    componentDidMount(){
        this.getUserId()
    }


    getUserId = () => {
        const auth = getAuth(app);

        onAuthStateChanged(auth, (user)=>{
            if(user){
                const userId = user.email
                const userName = user.displayName

                this.setState({
                    userId: userId,
                    fetchedNameFirebase: userName
                });
            }
        });
    }


    selectImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        })

        if(!result.cancelled){

            this.setState({
                image: result.uri
            })

            this.uploadImage(result.uri, this.state.userId)

        }
    }


    uploadImage = async ( uri, userId ) => {
        var response = await fetch(uri)
        var blob = await response.blob()

        const db = getStorage(app);
        const storageRef = ref(db, 'user_profiles/' + userId)

        uploadBytes(storageRef, blob)
        .then( ()=>{
            this.fetchImage(userId)
            return alert("Image has been successfully uploaded")
        })
    }


    fetchImage = (userId) => {
        const db = getStorage(app);
        const storageRef = ref(db, 'user_profiles/' + userId)

        getDownloadURL(storageRef)
        .then( (uri)=>{

            this.setState({
                image: uri
            })

        })
        .catch( (error)=>{
            var errorMessage = error.errorMessage
            var errorCode = error.code
            console.log(errorMessage)
        })
    }


    render(){
        this.fetchImage(this.state.userId)
        return(
            <View style = {styles.container}>

                <View style = {styles.avatar}>
                    <Avatar
                        avatarStyle = {{ alignSelf: 'center' }}
                        source = {{ uri: this.state.image }}
                        rounded = {true}
                        size = 'xlarge'
                        onPress = {()=>{
                            this.selectImage()
                        }}
                    />
                </View>

                <View style = {styles.nameView}>
                    <Text style = {{ fontSize: 16, fontWeight: 'bold' }}>Welcome, {this.state.fetchedNameFirebase}</Text>
                </View>

                <View style = {styles.drawerItemsContainer}>
                    <DrawerItems {...this.props} />
                </View>

                <View style = {styles.logOutContainer}>

                    <TouchableOpacity
                      style = {styles.logOutButton}
                      onPress = { ()=>{
                          const auth = getAuth(app);
                          signOut(auth);
                          this.props.navigation.navigate('LoginScreen');
                      }}>

                        <View style = {{ flex: 2, flexDirection: 'row' }}>

                            <View style = {{ paddingLeft: 10, paddingRight: 28 }}>
                                <Icon name = 'logout' type = 'antdesign' />
                            </View>
                            
                            <Text style = {styles.logOutText}>Logout</Text>

                        </View>

                    </TouchableOpacity>

                </View>

            </View>
        )
    }

}


const styles = StyleSheet.create({

    container: {
        flex: 1
    },

    drawerItemsContainer: {
        flex: 0.8
    },
    
    logOutContainer: {
        flex: 0.02,
        justifyContent: 'center',
        paddingBottom: 30
    },

    logOutButton: {
        height: 30,
        width: '100%',
        justifyContent: 'center',
        padding: 10
    },

    logOutText: {
        fontWeight: 'bold',
    },

    avatar: {
        alignItems: 'center',
        paddingTop: '5%',
        backgroundColor: '#2C7873',
        width: '100%',
        alignContent: 'center',
        paddingBottom: '5%'
    },

    nameView: {
        alignItems: 'center',
        marginTop: '5%',
        marginBottom: '5%'
    }

})