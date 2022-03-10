import React from 'react';
import { Header, Icon } from 'react-native-elements';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { withNavigation } from 'react-navigation';
import { Platform, StyleSheet } from 'react-native';

class ClassDetailsHeader extends React.Component {

    render(){
        return(
            <SafeAreaProvider>
                <Header 
                    backgroundColor = '#2C4A52'
                    style = {{ padding: 20 }}

                    leftComponent = {
                        <Icon
                          type = 'font-awesome'
                          name = 'chevron-left'
                          onPress = { ()=>{
                              this.props.navigation.goBack()
                          }}
                          color = {'#F4EBDB'}
                        />
                    }

                    leftContainerStyle = {styles.leftContainer}

                    centerComponent = {{
                        text: this.props.title,
                        style: { fontSize: 28, textAlign: 'center', color: '#F4EBDB', fontFamily: 'Lora' }
                    }}
                />
            </SafeAreaProvider>
        )
    }

}

export default withNavigation(ClassDetailsHeader);

const stylesAndroid = StyleSheet.create({

    leftContainer: {
        justifyContent: 'center', 
        paddingLeft: 8 
    }

})

const stylesIOS = StyleSheet.create({

    leftContainer: {
        justifyContent: 'center', 
        paddingLeft: 15 
    },

})

const styles2 = StyleSheet.create({

    leftContainer: {
        justifyContent: 'center', 
        paddingLeft: 15 
    },

})