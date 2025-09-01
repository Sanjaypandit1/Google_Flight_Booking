# ✈️ Flight Booking App

A modern, feature-rich flight booking application built with React Native and Next.js, offering seamless flight search, booking, and user management capabilities.

## 🚀 Features

### 🔐 Authentication System
- **Sign In/Sign Up**: Complete user registration and login flow
- **Guest Mode**: Browse flights without creating an account
- **Protected Booking**: Authentication required for flight reservations
- **Profile Management**: User profile with logout functionality

### ✈️ Flight Search & Booking
- **Real-time Flight Search**: Search flights between destinations
- **Airline Integration**: Display real airline names (Delta, British Airways, Japan Airlines, etc.)
- **Flight Details**: Comprehensive flight information with departure/arrival times
- **Booking Protection**: Secure booking process for authenticated users
- **Search History**: Save and manage recent searches

### 📱 User Experience
- **Responsive Design**: Optimized for both mobile and web platforms
- **Tab Navigation**: Easy navigation between Flights, Trips, History, and Profile
- **Popular Destinations**: Curated list of trending travel destinations
- **Booking History**: Track all your flight reservations

## 🛠️ Technologies Used

- **Frontend**: React Native, Next.js, TypeScript
- **Styling**: Tailwind CSS, React Native StyleSheet
- **Navigation**: React Navigation (Tab Navigator)
- **Storage**: AsyncStorage for local data persistence
- **State Management**: React Context API
- **Authentication**: Custom authentication system
- **API Integration**: RESTful flight search APIs

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or Yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Setup Instructions

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/Sanjaypandit1/Google_Flight_Booking.git
   cd Google_Flight_Booking
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   # Using npm
   npm install
   
   # OR using Yarn
   yarn install
   \`\`\`


4. **Start Metro Server**
   \`\`\`bash
   # Using npm
   npm start


5. **Run the application**
   
   **For Android:**
   \`\`\`bash
   npx react-native run-android
 
   
## 🎯 Usage

### Authentication Flow
1. **First Launch**: Users see the authentication screen
2. **Sign Up**: New users can create an account with email/password
3. **Sign In**: Existing users can log in
4. **Guest Mode**: Users can skip authentication to browse flights

### Flight Search
1. **Search Flights**: Enter origin, destination, and travel dates
2. **View Results**: Browse available flights with airline details
3. **Book Flight**: Authenticated users can book selected flights
4. **Guest Warning**: Guests are prompted to sign in before booking

### Profile Management
- View user information (name, email)
- Access booking history
- Logout functionality


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Metro Server Issues:**
\`\`\`bash
npx react-native start --reset-cache
\`\`\`

**Android Build Errors:**
\`\`\`bash
cd android
./gradlew clean
cd ..
npm run android
\`\`\`


## 📞 Support

For support and questions:
- Create sanzu2244@gmail.ccom


---

