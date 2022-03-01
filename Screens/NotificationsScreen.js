import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import AppHeader from '../Components/AppHeader';
import app from '../config';
import { getFirestore, getDocs, collection, query, where, updateDoc, doc, limit, getDocFromCache } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import moment from 'moment';
moment().format();


export default class NotificationsScreen extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            userId: '',
            notificationsData: [],
            runFetchNotifications: 0
        }
    }


    componentDidMount(){
        this.getUserId();
    }


    componentDidUpdate(){
        if( this.state.runFetchNotifications === 0 ){
            this.fetchNotifications()
        }
    }


    componentWillUnmount(){
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

                var id = doc.id
                var data = doc.data()
                data["doc_id"] = id

                var updatedNotificationsData = this.state.notificationsData
                updatedNotificationsData.push(data)

                this.setState({
                    notificationsData: updatedNotificationsData
                })

            })
        }
        else{
            console.log("No notifications")
        }

        this.setState({
            runFetchNotifications: 1
        })
    }


    markNotificationAsRead = async (notification) => {
        const db = getFirestore(app)
        var docId = notification.doc_id

        const docRef = doc(db, "All Notifications", docId)

        await updateDoc(docRef, {
            mark_as_read: true
        });

        return alert("Notification marked as 'read'")
    }


    keyExtractor = (item, index) => index.toString()


    renderItem = ({ i, item }) => {
        return(
            <ListItem.Swipeable 

                leftContent = {
                    <View style = {styles.centreAlign}>
                       <TouchableOpacity  
                            style = {styles.leftContent}
                            onPress = {()=>{
                                this.markNotificationAsRead(item)
                            }}>

                                <View style = {styles.centreAlign}>
                                   <Text>
                                       <Text style = {styles.swipeText}>Mark as read  </Text>
                                       <Icon type = 'font-awesome' name = 'check-circle' color = '#F1DCC9' size = {30}  />
                                    </Text>
                                </View>

                        </TouchableOpacity>
                    </View>
                }

                rightContent = {
                    <View style = {styles.centreAlign}>
                        <TouchableOpacity 
                            style = {styles.rightContent}
                            onPress = {()=>{
                                this.markNotificationAsRead(item)
                            }}>

                               <View style = {styles.centreAlign}>
                                   <Text>
                                       <Text style = {styles.swipeText}>Mark as read  </Text>
                                       <Icon type = 'font-awesome' name = 'check-circle' color = '#F1DCC9' size = {30}  />
                                    </Text>
                                </View>

                        </TouchableOpacity>
                    </View>
                }>

                <ListItem.Content style = {styles.listItemContainer}>

                    <View>
                        <Icon name = 'envelope' type = 'font-awesome-5' color = '#F1DCC9' size = {30} />
                    </View>

                    <View style = {{ marginLeft: '1.2%' }}> 
                        <ListItem.Title style = {styles.listItemTitle}>{item.class_name}</ListItem.Title>
                        <ListItem.Subtitle style = {styles.listItemSubtitle}>{item.message}</ListItem.Subtitle>
                    </View>

                </ListItem.Content>

            </ListItem.Swipeable>
        )
    }


    render(){
        return(
            <View>
            <AppHeader title = "Notifications" />


            {
                this.state.notificationsData.length === 0 ?
                (
                    <View style = {styles.nullNotificationsContainer}>
                        <Text style = {{ fontFamily: 'Lora', fontSize: 17 }}>You have no notifications</Text>
                    </View>
                )
                : (
                    <View style = {{ marginLeft: '3%', marginTop: '0.6%', marginRight: '3%' }}>

                        <View>
                            <Text>
                            <Text style = {{ fontFamily: 'Lora', fontSize: 17 }}>Notifications </Text>
                            <Icon name = 'sort-desc' type = 'font-awesome' color = '#696969' size = {35} />
                            </Text>
                        </View>

                        <ScrollView>
                            <View>

                                <FlatList 
                                    data = {this.state.notificationsData}
                                    renderItem = {this.renderItem}
                                    keyExtractor = {this.keyExtractor}
                                    scrollEnabled = {true}
                                />

                            </View>
                        </ScrollView>

                    </View>
                )
            }
            </View>
        )
    }

}

const styles = StyleSheet.create({

    centreAlign: {
        flex: 1, 
        justifyContent: 'center'
    },

    leftContent: {
        alignItems: 'flex-start', 
        backgroundColor: '#021C1E', 
        paddingLeft: '5%', 
        minHeight: '68%'
    },

    rightContent: {
        alignItems: 'flex-end', 
        backgroundColor: '#021C1E', 
        paddingRight: '5%', 
        minHeight: '68%'
    },

    swipeText: {
        fontFamily: 'Lora', 
        color: '#F1DCC9', 
        fontSize: 17
    },

    listItemContainer: {
        backgroundColor: 'rgba(44, 120, 115, 0.7)', 
        paddingVertical: 13, 
        paddingHorizontal: 15, 
        flex: 2, 
        flexDirection: 'row', 
        justifyContent: 'flex-start'
    },

    listItemTitle: {
        fontFamily: 'Lora', 
        fontWeight: 'bold', 
        color: '#021C1E', 
        fontSize: 18 
    },

    listItemSubtitle: {
        fontFamily: 'Lora', 
        color: 'rgba(2, 28, 30, 0.6)'
    },

    nullNotificationsContainer: {
        marginLeft: '3%', 
        marginTop: '1.5%'
    }

})