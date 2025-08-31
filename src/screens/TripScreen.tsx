import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const TripScreen = () => {
  return (
    <View style ={styles.container}>
      <Text>TripScreen</Text>
    </View>
  )
}
export default TripScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,               
    justifyContent: 'center', 
    alignItems: 'center',     
  },
})
