"use client"

import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Image } from "react-native"
import type React from "react"
import { useState, useEffect } from "react"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useNavigation, type NavigationProp } from "@react-navigation/native"
import { useAuth } from "../Auth/auth"

// Define your root stack param list
type RootStackParamList = {
  Flights: undefined
  Trips: undefined
  History: undefined
  Profile: undefined
}

// User data interface
interface User {
  name: string
  email: string
  phone: string
  profileImage: string | null
}

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const { user, isGuest, signOut } = useAuth() // Added auth context

  const [localUser, setLocalUser] = useState<User>({
    name: user?.name || "Guest User",
    email: user?.email || "guest@example.com",
    phone: user?.phone || "+977 (555) 123-4567",
    profileImage: null,
  })

  useEffect(() => {
    if (user) {
      setLocalUser({
        name: user.name,
        email: user.email,
        phone: user.phone || "contact number",
        profileImage: null,
      })
    } else if (isGuest) {
      setLocalUser({
        name: "Guest User",
        email: "guest@example.com",
        phone: "contact number",
        profileImage: null,
      })
    }
  }, [user, isGuest])

  const handleFlightBook = () => {
    navigation.navigate("History")
  }

  const handleTrips = () => {
    navigation.navigate("Trips")
  }

  const handleTermsAndConditions = () => {
    Alert.alert(
      "Terms and Conditions",
      "By using our Flight Search App, you agree to the following terms:\n\n" +
        "1. You will use the app only for lawful purposes.\n" +
        "2. All flight bookings are subject to availability.\n" +
        "3. Prices are subject to change without notice.\n" +
        "4. Cancellation policies vary by airline.\n" +
        "5. We are not responsible for airline schedule changes.\n\n" +
        "For our complete terms and conditions, please visit our website at www.flightapp.com/terms",
      [{ text: "I Understand", style: "default" }],
    )
  }

  const handleEditProfile = () => {
    if (isGuest) {
      Alert.alert("Sign In Required", "Please sign in to edit your profile.", [{ text: "OK", style: "default" }])
      return
    }

    Alert.alert("Edit Profile", "What would you like to update?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Change Name",
        onPress: () =>
          Alert.prompt("Change Name", "Enter your new name", (newName) => {
            if (newName && newName.trim().length > 0) {
              setLocalUser({ ...localUser, name: newName })
            }
          }),
      },
      {
        text: "Change Email",
        onPress: () =>
          Alert.prompt("Change Email", "Enter your new email", (newEmail) => {
            if (newEmail && newEmail.trim().length > 0) {
              setLocalUser({ ...localUser, email: newEmail })
            }
          }),
      },
      {
        text: "Change Phone",
        onPress: () =>
          Alert.prompt("Change Phone", "Enter your new phone number", (newPhone) => {
            if (newPhone && newPhone.trim().length > 0) {
              setLocalUser({ ...localUser, phone: newPhone })
            }
          }),
      },
    ])
  }

  const handleSupport = () => {
    Alert.alert(
      "Help & Support",
      "We're here to help you!\n\n" +
        "📞 Call us: +977 0904367278\n" +
        "✉️ Email: sanzaypandit@gmail.com\n" +
        "🕒 Available 24/7 for urgent flight issues\n\n" +
        "Common issues:\n" +
        "• Flight booking modifications\n" +
        "• Cancellation requests\n" +
        "• Payment issues\n" +
        "• Check-in problems",
      [
        { text: "Call Support", onPress: () => Alert.alert("Call", "Would call 1-800-FLY-APP0") },
        { text: "Email Support", onPress: () => Alert.alert("Email", "Would email support@flightapp.com") },
        { text: "Close", style: "cancel" },
      ],
    )
  }

  const handleAbout = () => {
    Alert.alert(
      "About Flight App",
      "Flight Search App v1.0\n\n" +
        "The easiest way to book flights and manage your travel plans.\n\n" +
        "Features:\n" +
        "• Search and compare flights across multiple airlines\n" +
        "• Book with secure payment processing\n" +
        "• Manage your upcoming trips\n" +
        "• Access your booking history\n" +
        "• Get real-time flight status updates\n\n" +
        "Built with React Native ",
      [{ text: "OK", style: "default" }],
    )
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut()
            Alert.alert("Logged out", "You have been logged out successfully")
          } catch (error) {
            Alert.alert("Error", "Failed to logout. Please try again.")
          }
        },
      },
    ])
  }

  const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )

  const ProfileItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
  }: {
    icon: string
    title: string
    subtitle?: string
    onPress?: () => void
    rightElement?: React.ReactNode
  }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.profileItemLeft}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={24} color="#1a73e8" />
        </View>
        <View style={styles.profileItemText}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.profileItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (onPress && <Icon name="chevron-right" size={24} color="#9aa0a6" />)}
    </TouchableOpacity>
  )

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>👤 Profile</Text>
        <Text style={styles.subtitle}>
          {isGuest ? "Guest Mode - Sign in for full features" : "Manage your account and preferences"}
        </Text>
      </View>

      {/* User Info Card */}
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          {localUser.profileImage ? (
            <Image source={{ uri: localUser.profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatar, isGuest && styles.guestAvatar]}>
              <Icon name={isGuest ? "person-outline" : "person"} size={40} color="white" />
            </View>
          )}
          {!isGuest && (
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="camera-alt" size={16} color="#1a73e8" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{localUser.name}</Text>
          <View style={styles.userDetailItem}>
            <Icon name="email" size={16} color="#5f6368" />
            <Text style={styles.userEmail}>{localUser.email}</Text>
          </View>
          <View style={styles.userDetailItem}>
            <Icon name="phone" size={16} color="#5f6368" />
            <Text style={styles.userContact}>{localUser.phone}</Text>
          </View>
          {isGuest && (
            <View style={styles.guestBadge}>
              <Text style={styles.guestBadgeText}>Guest Mode</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
          <Icon name="edit" size={16} color="#1a73e8" />
          <Text style={styles.editProfileText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Main Menu */}
      <ProfileSection title="Account">
        <ProfileItem
          icon="flight"
          title="Flight Bookings"
          subtitle="See your booked flights"
          onPress={handleFlightBook}
        />
        <ProfileItem icon="card-travel" title="My Trips" subtitle="View your travel plans" onPress={handleTrips} />
      </ProfileSection>

      <ProfileSection title="Support">
        <ProfileItem
          icon="description"
          title="Terms and Conditions"
          subtitle="Read our terms and policies"
          onPress={handleTermsAndConditions}
        />
        <ProfileItem
          icon="help"
          title="Help and Support"
          subtitle="Get help with your account"
          onPress={handleSupport}
        />
        <ProfileItem icon="info" title="About" subtitle="App version and information" onPress={handleAbout} />
      </ProfileSection>

      {/* Logout */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#ea4335" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: "white",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a73e8",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#5f6368",
    textAlign: "center",
    marginTop: 4,
  },
  userCard: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1a73e8",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#202124",
    marginBottom: 8,
  },
  userDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#5f6368",
    marginLeft: 8,
  },
  userContact: {
    fontSize: 14,
    color: "#5f6368",
    marginLeft: 8,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f0f7ff",
    borderRadius: 12,
  },
  editProfileText: {
    color: "#1a73e8",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  section: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#202124",
    padding: 20,
    paddingBottom: 12,
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  profileItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f7ff",
    alignItems: "center",
    justifyContent: "center",
  },
  profileItemText: {
    marginLeft: 16,
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#202124",
    marginBottom: 2,
  },
  profileItemSubtitle: {
    fontSize: 12,
    color: "#5f6368",
  },
  logoutContainer: {
    margin: 16,
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fce8e6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ea4335",
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 100,
  },
  guestAvatar: {
    backgroundColor: "#9aa0a6",
  },
  guestBadge: {
    backgroundColor: "#fef7e0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  guestBadgeText: {
    fontSize: 12,
    color: "#f9ab00",
    fontWeight: "600",
  },
})
