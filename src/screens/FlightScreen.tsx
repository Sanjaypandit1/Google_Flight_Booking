"use client"

import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native"
import { useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import DateTimePicker from "@react-native-community/datetimepicker"
import Icon from "react-native-vector-icons/MaterialIcons"
import { searchFlights, type Flight, type FlightSearchParams, getAirportInfo } from "../services/flightService"
import { useAuth } from "../Auth/auth" // Added auth context

// Popular airport codes for info
const POPULAR_AIRPORTS = [
  {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
  },
  {
    code: "LAX",
    name: "Los Angeles International Airport",
    city: "Los Angeles",
  },
  { code: "LHR", name: "Heathrow Airport", city: "London" },
  { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris" },
  { code: "DXB", name: "Dubai International Airport", city: "Dubai" },
  { code: "SIN", name: "Changi Airport", city: "Singapore" },
]

interface RecentSearch {
  id: string
  origin: string
  destination: string
  date: string
  timestamp: number
  resultsCount: number
}

interface Booking {
  id: string
  flightNumber: string
  airline: string
  from: string
  to: string
  date: string
  price: string
  status: "completed" | "upcoming" | "cancelled"
  bookingDate: number
  departureTime: string
  arrivalTime: string
  duration: string
}

const FlightScreen = () => {
  const [origin, setOrigin] = useState("JFK")
  const [destination, setDestination] = useState("LAX")
  const [date, setDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [originInfo, setOriginInfo] = useState<string>("")
  const [destinationInfo, setDestinationInfo] = useState<string>("")
  const { user, isGuest, requireAuth } = useAuth() // Added auth context

  useEffect(() => {
    loadRecentSearches()
    updateAirportInfo(origin, setOriginInfo)
    updateAirportInfo(destination, setDestinationInfo)
  }, [])

  useEffect(() => {
    updateAirportInfo(origin, setOriginInfo)
  }, [origin])

  useEffect(() => {
    updateAirportInfo(destination, setDestinationInfo)
  }, [destination])

  const updateAirportInfo = async (code: string, setInfo: (info: string) => void) => {
    if (code.length < 2) {
      setInfo("")
      return
    }

    // Check if it's a known popular airport first
    const popularAirport = POPULAR_AIRPORTS.find((a) => a.code === code.toUpperCase())
    if (popularAirport) {
      setInfo(`${popularAirport.city} (${popularAirport.code})`)
      return
    }

    // Try to get info from API
    try {
      const info = await getAirportInfo(code.toUpperCase())
      if (info) {
        setInfo(`${info.municipality_name} (${info.iata_code})`)
      } else {
        setInfo("")
      }
    } catch (error) {
      console.error("Error getting airport info:", error)
      setInfo("")
    }
  }

  const loadRecentSearches = async () => {
    try {
      const searches = await AsyncStorage.getItem("recentSearches")
      if (searches) setRecentSearches(JSON.parse(searches))
    } catch (error) {
      console.error("Error loading recent searches:", error)
    }
  }

  const saveRecentSearch = async (search: FlightSearchParams, resultsCount: number) => {
    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      origin: search.origin,
      destination: search.destination,
      date: search.date,
      timestamp: Date.now(),
      resultsCount: resultsCount,
    }
    const updated = [newSearch, ...recentSearches.slice(0, 4)]
    setRecentSearches(updated)
    await AsyncStorage.setItem("recentSearches", JSON.stringify(updated))
  }

  const handleBookFlight = async (flight: Flight) => {
    // Check if user is authenticated
    if (!requireAuth()) {
      Alert.alert("Sign In Required", "You must be signed in to book flights. Would you like to sign in now?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign In",
          onPress: () => {
            Alert.alert("Info", "Please restart the app and sign in to book flights.")
          },
        },
      ])
      return
    }

    try {
      const firstLeg = flight.legs?.[0]
      if (!firstLeg) {
        Alert.alert("Error", "Flight information is incomplete.")
        return
      }

      // Generate a flight number if not available
      const flightNumber = `FL${flight.id.padStart(4, "0")}`
      const airline = firstLeg.carriers?.marketing?.[0]?.name || "Unknown Airline"
      const from = `${firstLeg.origin?.city} (${firstLeg.origin?.iataCode})`
      const to = `${firstLeg.destination?.city} (${firstLeg.destination?.iataCode})`
      const departureDate = new Date(firstLeg.departure)
      const date = departureDate.toLocaleDateString()
      const departureTime = formatTime(firstLeg.departure)
      const arrivalTime = formatTime(firstLeg.arrival)
      const duration = formatDuration(firstLeg.durationInMinutes)

      const newBooking: Booking = {
        id: Date.now().toString(),
        flightNumber,
        airline,
        from,
        to,
        date,
        price: flight.price.formatted,
        status: "upcoming",
        bookingDate: Date.now(),
        departureTime,
        arrivalTime,
        duration,
      }

      const existingBookings = await AsyncStorage.getItem("bookingHistory")
      let bookings: Booking[] = []

      if (existingBookings) {
        bookings = JSON.parse(existingBookings)
      }

      bookings.unshift(newBooking)
      await AsyncStorage.setItem("bookingHistory", JSON.stringify(bookings))

      Alert.alert(
        "Booking Confirmed!",
        `Your flight ${flightNumber} from ${from} to ${to} on ${date} has been booked successfully!`,
        [{ text: "OK" }],
      )
    } catch (error) {
      console.error("Error booking flight:", error)
      Alert.alert("Error", "Failed to book flight. Please try again.")
    }
  }

  const handleSearch = async () => {
    if (!origin || !destination) {
      Alert.alert("Error", "Please enter origin and destination")
      return
    }

    if (origin.toUpperCase() === destination.toUpperCase()) {
      Alert.alert("Error", "Origin and destination cannot be the same")
      return
    }

    setLoading(true)
    try {
      const params: FlightSearchParams = {
        origin: origin.toUpperCase().trim(),
        destination: destination.toUpperCase().trim(),
        date: date.toISOString().split("T")[0],
      }
      const results = await searchFlights(params)
      setFlights(results)
      await saveRecentSearch(params, results.length)
      if (results.length === 0) Alert.alert("No flights found", "Try another date or route.")
    } catch (error: any) {
      Alert.alert("Error", error.message || "Unable to fetch flights. Try again.")
      setFlights([])
    } finally {
      setLoading(false)
    }
  }

  const swapAirports = () => {
    setOrigin(destination)
    setDestination(origin)
  }

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "--:--"
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const handleViewDetails = (flight: Flight) => {
    const firstLeg = flight.legs?.[0]
    const flightNumber = `FL${flight.id.padStart(4, "0")}`
    const airline = firstLeg?.carriers?.marketing?.[0]?.name || "Unknown Airline"

    Alert.alert("Flight Details", `Flight: ${flightNumber}\nAirline: ${airline}\nPrice: ${flight.price.formatted}`)
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>✈️ Find Flights</Text>

      {/* Inputs */}
      <View style={styles.card}>
        <View style={styles.routeRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>From</Text>
            <TextInput
              style={styles.input}
              value={origin}
              placeholder="JFK"
              maxLength={3}
              onChangeText={setOrigin}
              autoCapitalize="characters"
            />
            <Text style={styles.airportInfo}>{originInfo}</Text>
          </View>

          <TouchableOpacity onPress={swapAirports} style={styles.swapButton}>
            <Icon name="swap-horiz" size={28} color="#1a73e8" />
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>To</Text>
            <TextInput
              style={styles.input}
              value={destination}
              placeholder="LAX"
              maxLength={3}
              onChangeText={setDestination}
              autoCapitalize="characters"
            />
            <Text style={styles.airportInfo}>{destinationInfo}</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Departure Date</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>{formatDate(date)}</Text>
            <Icon name="date-range" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(_, d) => {
              setShowDatePicker(false)
              if (d) setDate(d)
            }}
          />
        )}

        <TouchableOpacity
          style={[styles.searchBtn, loading && styles.searchBtnDisabled]}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.searchText}>Search Flights</Text>}
        </TouchableOpacity>
      </View>

      {/* Results */}
      <View style={styles.results}>
        {flights.length > 0 && <Text style={styles.sectionTitle}>Available Flights</Text>}

        {flights.map((flight) => {
          const firstLeg = flight.legs?.[0]
          const stopCount = firstLeg?.stopCount || 0

          return (
            <View key={flight.id} style={styles.flightCard}>
              <View style={styles.flightHeader}>
                <Text style={styles.price}>{flight.price.formatted}</Text>
                <Text style={styles.airline}>{firstLeg?.carriers?.marketing?.[0]?.name || "Airline"}</Text>
              </View>

              <View style={styles.flightRoute}>
                <View style={styles.routeSection}>
                  <Text style={styles.time}>{formatTime(firstLeg?.departure || "")}</Text>
                  <Text style={styles.airportCode}>{firstLeg?.origin?.iataCode}</Text>
                  <Text style={styles.city}>{firstLeg?.origin?.city}</Text>
                </View>

                <View style={styles.routeMiddle}>
                  <View style={styles.flightLine} />
                  <Icon name="flight" size={16} color="#1a73e8" />
                  <View style={styles.flightLine} />
                  <Text style={styles.duration}>{formatDuration(firstLeg?.durationInMinutes || 0)}</Text>
                  {stopCount > 0 && (
                    <Text style={styles.stops}>
                      {stopCount} stop{stopCount !== 1 ? "s" : ""}
                    </Text>
                  )}
                </View>

                <View style={styles.routeSection}>
                  <Text style={styles.time}>{formatTime(firstLeg?.arrival || "")}</Text>
                  <Text style={styles.airportCode}>{firstLeg?.destination?.iataCode}</Text>
                  <Text style={styles.city}>{firstLeg?.destination?.city}</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.viewDetailsButton} onPress={() => handleViewDetails(flight)}>
                  <Icon name="info" size={16} color="#1a73e8" />
                  <Text style={styles.viewDetailsText}>Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.bookFlightButton,
                    isGuest && styles.disabledBookButton, // Added disabled style for guests
                  ]}
                  onPress={() => handleBookFlight(flight)}
                >
                  <Icon name={isGuest ? "lock" : "flight"} size={16} color="white" />
                  <Text style={styles.bookFlightText}>{isGuest ? "Sign In to Book" : "Book Flight"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        })}
      </View>

      {/* Info about free API limitations */}
      {flights.length > 0 && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Icon name="info" size={16} color="#1a73e8" /> Using simulated flight data. Real flight search requires a
            paid API subscription.
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

export default FlightScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a73e8",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5f6368",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  airportInfo: {
    fontSize: 12,
    color: "#5f6368",
    textAlign: "center",
    marginTop: 4,
    height: 16,
  },
  swapButton: {
    padding: 8,
    marginHorizontal: 8,
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 16,
  },
  dateText: { fontSize: 16 },
  searchBtn: {
    backgroundColor: "#1a73e8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  searchBtnDisabled: {
    backgroundColor: "#9e9e9e",
  },
  searchText: { color: "white", fontWeight: "600", fontSize: 16 },
  recent: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  recentText: { marginLeft: 8, fontSize: 14, flex: 1 },
  resultsCountText: {
    fontSize: 12,
    color: "#0f9d58",
    fontWeight: "600",
    marginLeft: 8,
  },
  results: { paddingBottom: 40 },
  flightCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  flightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  price: { fontSize: 20, fontWeight: "bold", color: "#1a73e8" },
  airline: { fontSize: 14, fontWeight: "600", color: "#5f6368" },
  flightRoute: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  routeSection: {
    alignItems: "center",
    flex: 1,
  },
  time: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  airportCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a73e8",
    marginBottom: 2,
  },
  city: { fontSize: 12, color: "#5f6368" },
  routeMiddle: {
    alignItems: "center",
    marginHorizontal: 8,
    minWidth: 80,
  },
  flightLine: {
    height: 1,
    width: "100%",
    backgroundColor: "#ddd",
    marginVertical: 4,
  },
  duration: {
    fontSize: 12,
    color: "#5f6368",
    marginTop: 4,
  },
  stops: {
    fontSize: 11,
    color: "#e65100",
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewDetailsButton: {
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
  },
  viewDetailsText: {
    color: "#0d47a1",
    fontSize: 14,
    marginLeft: 4,
  },
  bookFlightButton: {
    backgroundColor: "#1a73e8",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
  },
  disabledBookButton: {
    backgroundColor: "#9aa0a6",
    shadowOpacity: 0,
    elevation: 0,
  },
  bookFlightText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
  },
  infoBox: {
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    color: "#0d47a1",
    fontSize: 14,
  },
})
