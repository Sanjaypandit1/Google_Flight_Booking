"use client"

import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Switch } from "react-native"
import type React from "react"
import { useState } from "react"
import Icon from "react-native-vector-icons/MaterialIcons"

const ProfileScreen = () => {
const [notificationsEnabled, setNotificationsEnabled] = useState(true)
const [darkModeEnabled, setDarkModeEnabled] = useState(false)
const [biometricEnabled, setBiometricEnabled] = useState(false)

const handleEditProfile = () => {
Alert.alert("Edit Profile", "Profile editing feature coming soon!")
}

const handleSupport = () => {
Alert.alert("Support", "Contact support at support@flightapp.com")
}

const handleAbout = () => {
Alert.alert("About", "Flight Search App v1.0\nBuilt with React Native")
}

const handleLogout = () => {
Alert.alert("Logout", "Are you sure you want to logout?", [
{ text: "Cancel", style: "cancel" },
{
text: "Logout",
style: "destructive",
onPress: () => {
// Handle logout logic here
Alert.alert("Logged out", "You have been logged out successfully")
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
<Text style={styles.subtitle}>Manage your account and preferences</Text>
</View>

{/* User Info Card */}
<View style={styles.userCard}>
<View style={styles.avatarContainer}>
<View style={styles.avatar}>
<Icon name="person" size={40} color="white" />
</View>
<TouchableOpacity style={styles.editAvatarButton}>
<Icon name="camera-alt" size={16} color="#1a73e8" />
</TouchableOpacity>
</View>
<View style={styles.userInfo}>
<Text style={styles.userName}>John Doe</Text>
<Text style={styles.userEmail}>john.doe@example.com</Text>
<Text style={styles.memberSince}>Member since Dec 2024</Text>
</View>
<TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
<Icon name="edit" size={16} color="#1a73e8" />
</TouchableOpacity>
</View>

{/* Travel Preferences */}
<ProfileSection title="Travel Preferences">
<ProfileItem
icon="flight"
title="Preferred Airlines"
subtitle="Delta, American Airlines"
onPress={() => Alert.alert("Coming Soon", "Airline preferences feature coming soon!")}
/>
<ProfileItem
icon="event-seat"
title="Seat Preference"
subtitle="Window seat"
onPress={() => Alert.alert("Coming Soon", "Seat preferences feature coming soon!")}
/>
<ProfileItem
icon="card-travel"
title="Travel Class"
subtitle="Economy"
onPress={() => Alert.alert("Coming Soon", "Travel class preferences feature coming soon!")}
/>
</ProfileSection>

{/* App Settings */}
<ProfileSection title="App Settings">
<ProfileItem
icon="notifications"
title="Push Notifications"
subtitle="Get notified about flight deals and updates"
rightElement={
<Switch
value={notificationsEnabled}
onValueChange={setNotificationsEnabled}
trackColor={{ false: "#e0e0e0", true: "#bbdefb" }}
thumbColor={notificationsEnabled ? "#1a73e8" : "#f4f3f4"}
/>
}
/>
<ProfileItem
icon="dark-mode"
title="Dark Mode"
subtitle="Switch to dark theme"
rightElement={
<Switch
value={darkModeEnabled}
onValueChange={setDarkModeEnabled}
trackColor={{ false: "#e0e0e0", true: "#bbdefb" }}
thumbColor={darkModeEnabled ? "#1a73e8" : "#f4f3f4"}
/>
}
/>
<ProfileItem
icon="fingerprint"
title="Biometric Login"
subtitle="Use fingerprint or face ID"
rightElement={
<Switch
value={biometricEnabled}
onValueChange={setBiometricEnabled}
trackColor={{ false: "#e0e0e0", true: "#bbdefb" }}
thumbColor={biometricEnabled ? "#1a73e8" : "#f4f3f4"}
/>
}
/>
</ProfileSection>

{/* Account */}
<ProfileSection title="Account">
<ProfileItem
icon="payment"
title="Payment Methods"
subtitle="Manage your cards and payment options"
onPress={() => Alert.alert("Coming Soon", "Payment methods feature coming soon!")}
/>
<ProfileItem
icon="security"
title="Privacy & Security"
subtitle="Manage your privacy settings"
onPress={() => Alert.alert("Coming Soon", "Privacy settings feature coming soon!")}
/>
<ProfileItem
icon="language"
title="Language"
subtitle="English (US)"
onPress={() => Alert.alert("Coming Soon", "Language settings feature coming soon!")}
/>
</ProfileSection>

{/* Support */}
<ProfileSection title="Support & Info">
<ProfileItem icon="help" title="Help & Support" subtitle="Get help with your account" onPress={handleSupport} />
<ProfileItem
icon="star"
title="Rate the App"
subtitle="Share your feedback"
onPress={() => Alert.alert("Thank you!", "Rating feature coming soon!")}
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
width: 60,
height: 60,
borderRadius: 30,
backgroundColor: "#1a73e8",
alignItems: "center",
justifyContent: "center",
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
marginBottom: 4,
},
userEmail: {
fontSize: 14,
color: "#5f6368",
marginBottom: 2,
},
memberSince: {
fontSize: 12,
color: "#9aa0a6",
},
editProfileButton: {
padding: 8,
backgroundColor: "#f0f7ff",
borderRadius: 12,
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
})