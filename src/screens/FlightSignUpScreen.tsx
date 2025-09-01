"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native"
import Icon from "react-native-vector-icons/Feather"
import auth from "@react-native-firebase/auth"
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

type RootStackParamList = {
  SignIn: undefined
  SignUp: undefined
  MainTabs: undefined
  FlightSearch: { user?: any }
}

type NavigationProps = NativeStackNavigationProp<RootStackParamList>

interface InputFieldProps {
  placeholder: string
  icon: string
  secureTextEntry?: boolean
  value: string
  onChangeText: (text: string) => void
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad"
  autoCapitalize?: "none" | "sentences" | "words" | "characters"
  error?: string
}

const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  icon,
  secureTextEntry = false,
  value,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<TextInput>(null)

  return (
    <View style={styles.inputWrapper}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.inputContainer, isFocused && styles.inputContainerFocused, error && styles.inputContainerError]}
        onPress={() => inputRef.current?.focus()}
      >
        <Icon name={icon} size={20} color="#888" style={styles.inputIcon} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#888"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={true}
          autoCorrect={false}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Icon name={isPasswordVisible ? "eye-off" : "eye"} size={20} color="#888" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

interface SocialButtonProps {
  icon: string
  backgroundColor: string
  onPress: () => void
  disabled?: boolean
}

const SocialButton: React.FC<SocialButtonProps> = ({ icon, backgroundColor, onPress, disabled = false }) => {
  return (
    <TouchableOpacity
      style={[styles.socialButton, { backgroundColor }, disabled && styles.socialButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Icon name={icon} size={20} color="#fff" />
    </TouchableOpacity>
  )
}

interface FirebaseSignUpScreenProps {
  onAuthSuccess?: (user: any) => void
}

const FlightSignUpScreen: React.FC<FirebaseSignUpScreenProps> = ({ onAuthSuccess }) => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const navigation = useNavigation<NavigationProps>()

  // Configure Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "YOUR_WEB_CLIENT_ID", // Replace with your actual web client ID
      offlineAccess: true,
    })
  }, [])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!agreeToTerms) {
      newErrors.terms = "You must agree to the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignUp = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    Keyboard.dismiss()

    try {
      // Create user account
      const userCredential = await auth().createUserWithEmailAndPassword(email, password)

      // Update user profile with display name
      await userCredential.user.updateProfile({
        displayName: `${firstName} ${lastName}`,
      })

      console.log("User account created successfully:", userCredential.user.email)

      if (onAuthSuccess) {
        onAuthSuccess(userCredential.user)
      }

      // Navigate to flight search screen
      navigation.navigate("FlightSearch", { user: userCredential.user })

      // Show success message
      Alert.alert("Welcome to SkyBooker!", `Your account has been created successfully. Happy travels, ${firstName}!`, [
        {
          text: "Start Exploring",
          onPress: () => {
            navigation.navigate("FlightSearch", { user: userCredential.user })
          },
        },
      ])
    } catch (error: any) {
      console.error("Sign up error:", error)
      let errorMessage = "An error occurred during sign up"

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists"
          setErrors({ email: "This email is already registered" })
          break
        case "auth/invalid-email":
          errorMessage = "Invalid email address"
          setErrors({ email: "Invalid email address" })
          break
        case "auth/weak-password":
          errorMessage = "Password is too weak"
          setErrors({ password: "Please choose a stronger password" })
          break
        case "auth/operation-not-allowed":
          errorMessage = "Email/password accounts are not enabled"
          break
        default:
          errorMessage = error.message || errorMessage
      }

      Alert.alert("Sign Up Failed", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
      const userInfo = await GoogleSignin.signIn()
      const tokens = await GoogleSignin.getTokens()
      const idToken = tokens.idToken
      const googleCredential = auth.GoogleAuthProvider.credential(idToken)
      const userCredential = await auth().signInWithCredential(googleCredential)

      console.log("Google sign up successful:", userCredential.user.email)

      if (onAuthSuccess) {
        onAuthSuccess(userCredential.user)
      }

      // Navigate to flight search screen
      navigation.navigate("FlightSearch", { user: userCredential.user })

      // Show success message
      Alert.alert("Welcome to SkyBooker!", "Your account has been created successfully with Google.", [
        {
          text: "Start Exploring",
          onPress: () => {
            navigation.navigate("FlightSearch", { user: userCredential.user })
          },
        },
      ])
    } catch (error: any) {
      console.error("Google sign up error:", error)
      let errorMessage = "Google sign up failed"

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = "Sign up was cancelled"
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = "Sign up is already in progress"
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = "Google Play Services not available"
      } else {
        errorMessage = error.message || errorMessage
      }

      Alert.alert("Google Sign Up Failed", errorMessage)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSignIn = () => {
    navigation.navigate("SignIn")
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Image source={require("../assets/logo.png")} style={styles.logo} />
            <Text style={styles.appName}>SkyBooker</Text>
            <Text style={styles.appTagline}>Create your account to start your journey</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>Join us and explore the world</Text>

            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <InputField
                  placeholder="First Name"
                  icon="user"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  error={errors.firstName}
                />
              </View>
              <View style={styles.nameField}>
                <InputField
                  placeholder="Last Name"
                  icon="user"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  error={errors.lastName}
                />
              </View>
            </View>

            <InputField
              placeholder="Email Address"
              icon="mail"
              value={email}
              onChangeText={(text) => setEmail(text.trim())}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <InputField
              placeholder="Password"
              icon="lock"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              error={errors.password}
            />

            <InputField
              placeholder="Confirm Password"
              icon="lock"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
              error={errors.confirmPassword}
            />

            <TouchableOpacity style={styles.termsContainer} onPress={() => setAgreeToTerms(!agreeToTerms)}>
              <View style={styles.checkbox}>{agreeToTerms && <Icon name="check" size={14} color="#1E40AF" />}</View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.signUpButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <SocialButton
                icon="facebook"
                backgroundColor="#3b5998"
                onPress={() => Alert.alert("Facebook", "Facebook sign up not implemented yet")}
                disabled={googleLoading}
              />
              <TouchableOpacity
                style={[styles.googleButton, googleLoading && styles.socialButtonDisabled]}
                onPress={handleGoogleSignUp}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.googleButtonText}>G</Text>
                )}
              </TouchableOpacity>
              <SocialButton
                icon="smartphone"
                backgroundColor="#333"
                onPress={() => Alert.alert("Phone", "Phone sign up not implemented yet")}
                disabled={googleLoading}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E40AF",
    marginBottom: 5,
  },
  appTagline: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
  },
  formContainer: {
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 30,
    textAlign: "center",
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  nameField: {
    flex: 1,
    marginHorizontal: 5,
  },
  inputWrapper: {
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputContainerFocused: {
    borderColor: "#1E40AF",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  inputContainerError: {
    borderColor: "#ef4444",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#1E293B",
    paddingVertical: 0,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#1E40AF",
    borderRadius: 4,
    marginRight: 10,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  termsText: {
    fontSize: 14,
    color: "#64748B",
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: "#1E40AF",
    fontWeight: "500",
  },
  signUpButton: {
    backgroundColor: "#1E40AF",
    borderRadius: 12,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    paddingHorizontal: 15,
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
    gap: 15,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  socialButtonDisabled: {
    opacity: 0.5,
  },
  googleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#DB4437",
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#64748B",
  },
  signInText: {
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "bold",
  },
})

export default FlightSignUpScreen
