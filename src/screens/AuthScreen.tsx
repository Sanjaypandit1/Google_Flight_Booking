"use client"

import { useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useAuth } from "../Auth/auth"

const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)

  const { signIn, signUp, continueAsGuest } = useAuth()

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    if (isSignUp) {
      if (!formData.name) {
        Alert.alert("Error", "Please enter your name")
        return
      }
      if (formData.password !== formData.confirmPassword) {
        Alert.alert("Error", "Passwords do not match")
        return
      }
    }

    setLoading(true)
    try {
      let success = false

      if (isSignUp) {
        success = await signUp(formData.name, formData.email, formData.password, formData.phone)
      } else {
        success = await signIn(formData.email, formData.password)
      }

      if (!success) {
        Alert.alert("Error", isSignUp ? "Failed to create account" : "Invalid credentials")
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGuestMode = () => {
    Alert.alert("Continue as Guest", "You can browse flights but will need to sign in to make bookings.", [
      { text: "Cancel", style: "cancel" },
      { text: "Continue", onPress: continueAsGuest },
    ])
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Icon name="flight" size={64} color="#1a73e8" />
          <Text style={styles.title}>Flight Booking</Text>
          <Text style={styles.subtitle}>{isSignUp ? "Create your account" : "Welcome back"}</Text>
        </View>

        <View style={styles.form}>
          {isSignUp && (
            <View style={styles.inputContainer}>
              <Icon name="person" size={20} color="#5f6368" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Icon name="email" size={20} color="#5f6368" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {isSignUp && (
            <View style={styles.inputContainer}>
              <Icon name="phone" size={20} color="#5f6368" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number (Optional)"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#5f6368" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />
          </View>

          {isSignUp && (
            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#5f6368" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                secureTextEntry
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchButton} onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.switchButtonText}>
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.guestButton} onPress={handleGuestMode}>
            <Icon name="person-outline" size={20} color="#5f6368" />
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default AuthScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a73e8",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#5f6368",
    textAlign: "center",
  },
  form: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e8eaed",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#202124",
  },
  submitButton: {
    backgroundColor: "#1a73e8",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#1a73e8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: "#9aa0a6",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  switchButton: {
    alignItems: "center",
    marginBottom: 24,
  },
  switchButtonText: {
    color: "#1a73e8",
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e8eaed",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#5f6368",
    fontSize: 12,
    fontWeight: "500",
  },
  guestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e8eaed",
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: "#f8f9fa",
  },
  guestButtonText: {
    color: "#5f6368",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
})
