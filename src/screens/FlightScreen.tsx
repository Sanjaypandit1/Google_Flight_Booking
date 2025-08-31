import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  FlatList
} from 'react-native'
import React, { useState } from 'react'
import { searchFlights, Flight, FlightSearchParams } from '../services/flightService'
import DateTimePicker from '@react-native-community/datetimepicker'
import Icon from 'react-native-vector-icons/MaterialIcons'

// Airport data for autocomplete suggestions
const POPULAR_AIRPORTS = [
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York' },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles' },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris' },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai' },
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore' },
  { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago' },
  { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas' },
  { code: 'DEN', name: 'Denver International Airport', city: 'Denver' },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco' },
]

const FlightScreen = () => {
  const [origin, setOrigin] = useState('JFK')
  const [destination, setDestination] = useState('LAX')
  const [date, setDate] = useState('2024-01-15')
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false)
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const handleSearch = async () => {
    if (!origin || !destination || !date) {
      Alert.alert('Error', 'Please fill all fields')
      return
    }

    setLoading(true)
    setSearchPerformed(true)
    setShowOriginSuggestions(false)
    setShowDestinationSuggestions(false)
    
    try {
      const searchParams: FlightSearchParams = {
        origin: origin.toUpperCase().trim(),
        destination: destination.toUpperCase().trim(),
        date: date
      }
      
      console.log('Searching with params:', searchParams)
      const flightData = await searchFlights(searchParams)
      setFlights(flightData)
      
      if (flightData.length === 0) {
        Alert.alert('No flights found', 'Try different search parameters or dates')
      }
    } catch (error: any) {
      console.error('Search error:', error)
      Alert.alert('Error', error.message || 'Failed to search flights. Please check your internet connection and try again.')
      setFlights([])
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch (error) {
      return '--:--'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  const handleOriginSelect = (airportCode: string) => {
    setOrigin(airportCode)
    setShowOriginSuggestions(false)
  }

  const handleDestinationSelect = (airportCode: string) => {
    setDestination(airportCode)
    setShowDestinationSuggestions(false)
  }

  const handleDateSelect = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setSelectedDate(selectedDate)
      const formattedDate = selectedDate.toISOString().split('T')[0]
      setDate(formattedDate)
    }
  }

  const getAirportName = (code: string) => {
    const airport = POPULAR_AIRPORTS.find(ap => ap.code === code.toUpperCase())
    return airport ? `${airport.city} (${airport.code})` : code
  }

  const getAirportSuggestions = (input: string) => {
    if (!input) return POPULAR_AIRPORTS
    return POPULAR_AIRPORTS.filter(airport =>
      airport.code.toLowerCase().includes(input.toLowerCase()) ||
      airport.city.toLowerCase().includes(input.toLowerCase()) ||
      airport.name.toLowerCase().includes(input.toLowerCase())
    )
  }

  const renderFlightItem = ({ item }: { item: Flight }) => (
    <View style={styles.flightCard}>
      <View style={styles.flightHeader}>
        <Text style={styles.flightPrice}>{item.price.formatted}</Text>
        <Text style={styles.flightCarrier}>
          {item.legs[0]?.carriers?.marketing?.[0]?.name || 'Airline'}
        </Text>
      </View>
      
      <View style={styles.flightDetails}>
        <View style={styles.timeSection}>
          <Text style={styles.timeText}>{formatTime(item.legs[0]?.departure)}</Text>
          <Text style={styles.airportText}>{item.legs[0]?.origin?.iataCode}</Text>
          <Text style={styles.cityText}>{item.legs[0]?.origin?.city}</Text>
        </View>
        
        <View style={styles.durationSection}>
          <Text style={styles.durationText}>
            {formatDuration(item.legs[0]?.durationInMinutes)}
          </Text>
          <View style={styles.flightLine}>
            <View style={styles.line} />
            <Text style={styles.arrow}>→</Text>
          </View>
        </View>
        
        <View style={styles.timeSection}>
          <Text style={styles.timeText}>{formatTime(item.legs[0]?.arrival)}</Text>
          <Text style={styles.airportText}>{item.legs[0]?.destination?.iataCode}</Text>
          <Text style={styles.cityText}>{item.legs[0]?.destination?.city}</Text>
        </View>
      </View>
      
      {item.legs[0]?.stopCount && item.legs[0].stopCount > 0 && (
        <View style={styles.stopInfo}>
          <Text style={styles.stopText}>
            {item.legs[0].stopCount} stop{item.legs[0].stopCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
      
      <TouchableOpacity style={styles.selectButton}>
        <Text style={styles.selectButtonText}>Select Flight</Text>
      </TouchableOpacity>
    </View>
  )

  const renderSuggestionItem = (item: typeof POPULAR_AIRPORTS[0], onSelect: (code: string) => void) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => onSelect(item.code)}
    >
      <View>
        <Text style={styles.suggestionCode}>{item.code}</Text>
        <Text style={styles.suggestionCity}>{item.city}</Text>
        <Text style={styles.suggestionName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✈️ Flight Search</Text>
      
      <View style={styles.searchContainer}>
        {/* Origin Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>From</Text>
          <View>
            <TextInput
              style={styles.input}
              placeholder="Departure airport (e.g., JFK)"
              value={origin}
              onChangeText={(text) => {
                setOrigin(text)
                setShowOriginSuggestions(text.length > 0)
              }}
              onFocus={() => setShowOriginSuggestions(origin.length > 0)}
              onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {showOriginSuggestions && (
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={getAirportSuggestions(origin)}
                  renderItem={({ item }) => renderSuggestionItem(item, handleOriginSelect)}
                  keyExtractor={(item) => item.code}
                  keyboardShouldPersistTaps="always"
                />
              </View>
            )}
          </View>
          {origin && (
            <Text style={styles.airportNameText}>
              {getAirportName(origin)}
            </Text>
          )}
        </View>

        {/* Destination Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>To</Text>
          <View>
            <TextInput
              style={styles.input}
              placeholder="Destination airport (e.g., LAX)"
              value={destination}
              onChangeText={(text) => {
                setDestination(text)
                setShowDestinationSuggestions(text.length > 0)
              }}
              onFocus={() => setShowDestinationSuggestions(destination.length > 0)}
              onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {showDestinationSuggestions && (
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={getAirportSuggestions(destination)}
                  renderItem={({ item }) => renderSuggestionItem(item, handleDestinationSelect)}
                  keyExtractor={(item) => item.code}
                  keyboardShouldPersistTaps="always"
                />
              </View>
            )}
          </View>
          {destination && (
            <Text style={styles.airportNameText}>
              {getAirportName(destination)}
            </Text>
          )}
        </View>

        {/* Date Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Departure Date</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(date)}</Text>
            <Icon name="calendar-today" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateSelect}
            minimumDate={new Date()}
          />
        )}
        
        <TouchableOpacity 
          style={[styles.searchButton, loading && styles.searchButtonDisabled]} 
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? 'Searching...' : 'Search Flights'}
          </Text>
        </TouchableOpacity>
      </View>

      {searchPerformed && !loading && flights.length > 0 && (
        <Text style={styles.resultsCount}>
          Found {flights.length} flight{flights.length !== 1 ? 's' : ''}
        </Text>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Searching for flights...</Text>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          {searchPerformed && flights.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No flights found</Text>
              <Text style={styles.noResultsSubtext}>
                Try different airports or dates. Sample: JFK → LAX on 2024-01-15
              </Text>
            </View>
          ) : (
            <FlatList
              data={flights}
              renderItem={renderFlightItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}
    </View>
  )
}

export default FlightScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#1a73e8',
  },
  searchContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5f6368',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#202124',
  },
  airportNameText: {
    fontSize: 12,
    color: '#5f6368',
    marginTop: 4,
    marginLeft: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  suggestionCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  suggestionCity: {
    fontSize: 14,
    color: '#202124',
  },
  suggestionName: {
    fontSize: 12,
    color: '#5f6368',
  },
  searchButton: {
    backgroundColor: '#1a73e8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#9e9e9e',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5f6368',
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#5f6368',
  },
  resultsContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  flightCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  flightPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  flightCarrier: {
    fontSize: 14,
    color: '#5f6368',
    fontWeight: '500',
  },
  flightDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeSection: {
    alignItems: 'center',
    flex: 1,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 4,
  },
  airportText: {
    fontSize: 16,
    color: '#1a73e8',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cityText: {
    fontSize: 12,
    color: '#5f6368',
  },
  durationSection: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  durationText: {
    fontSize: 12,
    color: '#5f6368',
    marginBottom: 8,
    fontWeight: '500',
  },
  flightLine: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: '#dadce0',
  },
  arrow: {
    color: '#1a73e8',
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  stopInfo: {
    backgroundColor: '#f0f7ff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 16,
    alignItems: 'center',
  },
  stopText: {
    fontSize: 12,
    color: '#1a73e8',
    fontWeight: '500',
  },
  selectButton: {
    backgroundColor: '#f1f3f4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#1a73e8',
    fontSize: 14,
    fontWeight: '600',
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5f6368',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#5f6368',
    textAlign: 'center',
    lineHeight: 20,
  },
})