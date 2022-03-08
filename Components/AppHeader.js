import React from 'react';
import { Header, Icon, Badge } from 'react-native-elements';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DrawerActions } from 'react-navigation-drawer';
import { StyleSheet, Platform } from 'react-native';
import { withNavigation } from 'react-navigation';
import app from '../config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, query, collection, where, getDocs } from 'firebase/firestore'

class AppHeader extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            userId: '',
            value: 0
        }
    }


    componentDidMount(){
        this.getUserId()
        this.fetchNotifications();
    }


    getUserId = () => {
        var auth = getAuth(app);

        onAuthStateChanged( auth, (user)=>{
            if(user){
                const userId = user.email

                this.setState({
                    userId: userId
                });
            }
        });
    }


    fetchNotifications = async () => {
        const db = getFirestore(app)
        var userId = this.state.userId

        const q = query( collection(db, 'All Notifications'), where('user_id','==',userId), where('mark_as_read','==',false) )

        const querySnapshot = await getDocs(q)

        if(querySnapshot){
            querySnapshot.forEach( (doc)=>{

                var notificationsData = querySnapshot.docs.map( document => document.data() )
                var notificationNumber = notificationsData.length
                this.setState({
                    value: notificationNumber
                })

            })
        }
        else{
            console.log("No Notifications")
        }
    }


    BellIconWithBadge = () => {
        
        if( this.state.value === 0 ){
            return(
                <SafeAreaProvider>

                    <Icon type = 'font-awesome' name = 'bell' size = {28} color = {'#F4EBDB'} style = { Platform.OS === 'android' ? styles.androidBell : styles.webBell }
                          onPress = {()=>{ this.props.navigation.navigate('NotificationsScreen') }} />

                </SafeAreaProvider>
            )
        }
        else{
            return(
                <SafeAreaProvider>
                    <Icon type = 'font-awesome' name = 'bell' size = {28} color = {'#F4EBDB'} style = { Platform.OS === 'android' ? styles.androidBell : styles.webBell }
                          onPress = {()=>{ this.props.navigation.navigate('NotificationsScreen') }} />
    
                    <Badge 
                        value = {this.state.value}
                        status = "error"
                        containerStyle = { Platform.OS === 'android' ? styles.androidBadge : styles.webBadge }
                    />
                </SafeAreaProvider>
            )
        }

    }


    render(){
        this.fetchNotifications()
        return(
            <SafeAreaProvider>
                <Header 
                    backgroundColor = '#2C4A52'
                    style = {styles.background}

                    leftComponent = {
                        <Icon
                          type = 'font-awesome'
                          name = 'bars'
                          onPress = { ()=>{
                              this.props.navigation.dispatch(DrawerActions.toggleDrawer());
                          }}
                          color = {'#F4EBDB'}
                        />
                    }
                    leftContainerStyle = {{ justifyContent: 'center', paddingLeft: 8 }}

                    rightComponent = { < this.BellIconWithBadge /> }

                    rightContainerStyle = { Platform.OS === 'android' ? styles.rightContainerAndroid : styles.rightContainerWeb }

                    centerComponent = {{
                        text: this.props.title,
                        style: { fontSize: 28, textAlign: 'center', color: '#F4EBDB', fontFamily: 'Lora' }
                    }}
                />
            </SafeAreaProvider>
        )
    }

}

export default withNavigation(AppHeader);


const styles = StyleSheet.create({

    background: {
        padding: 20
    },

    androidBell: {
        paddingRight: 13, 
        paddingTop: 3
    },

    androidBadge: {
        position: 'absolute', 
        right: 0
    },

    rightContainerAndroid: {
        justifyContent: 'center', 
        paddingTop: 5, 
        paddingRight: 4
    },

    webBell: {
        paddingRight: 7, 
        paddingTop: 3
    },

    webBadge: {
        position: 'absolute', 
        right: 1
    },

    rightContainerWeb: {
        justifyContent: 'center', 
        paddingRight: 4
    }

});

// this.props.navigation.dispatch(DrawerActions.toggleDrawer());