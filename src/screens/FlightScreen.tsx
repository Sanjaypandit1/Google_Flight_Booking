import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const FlightScreen = () => {
  return (
    <View style={styles.container}>
      <Text>FlightScreen</Text>
    </View>
  )
}

export default FlightScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,               
    justifyContent: 'center', 
    alignItems: 'center',     
  },
})
