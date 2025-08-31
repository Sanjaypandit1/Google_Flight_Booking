'use client';

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPopularTrips } from '../services/flightService';

interface Trip {
  id: string;
  from: string;
  to: string;
  date: string;
  returnDate?: string;
  price: string;
  airline: string;
  flightNumber: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  bookingReference: string;
  gate?: string;
  terminal?: string;
  seat?: string;
}

interface Booking {
  id: string;
  flightNumber: string;
  airline: string;
  from: string;
  to: string;
  date: string;
  price: string;
  status: 'completed' | 'upcoming' | 'cancelled';
  bookingDate: number;
  departureTime: string;
  arrivalTime: string;
  duration: string;
}

const TripScreen = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const popularTrips = await getPopularTrips();
      const convertedTrips: Trip[] = popularTrips.map(
        ({ popularity, ...trip }) => trip,
      );
      setTrips(convertedTrips);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trips');
      console.error('Error fetching popular trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularTrips();
  }, []);

  const filteredTrips = trips;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '#1a73e8';
      case 'completed':
        return '#0f9d58';
      case 'cancelled':
        return '#ea4335';
      default:
        return '#5f6368';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'flight-takeoff';
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'cancel';
      default:
        return 'help';
    }
  };

  const handleBookFlight = async (trip: Trip) => {
    try {
      const newBooking: Booking = {
        id: Date.now().toString(),
        flightNumber: trip.flightNumber,
        airline: trip.airline,
        from: trip.from,
        to: trip.to,
        date: trip.date,
        price: trip.price,
        status: 'upcoming',
        bookingDate: Date.now(),
        departureTime: '08:00', // Default time since not available in trip data
        arrivalTime: '12:00', // Default time since not available in trip data
        duration: '4h 0m', // Default duration since not available in trip data
      };

      const existingBookings = await AsyncStorage.getItem('bookingHistory');
      let bookings: Booking[] = [];

      if (existingBookings) {
        bookings = JSON.parse(existingBookings);
      }

      bookings.unshift(newBooking);
      await AsyncStorage.setItem('bookingHistory', JSON.stringify(bookings));

      Alert.alert(
        'Booking Confirmed!',
        `Your flight ${trip.flightNumber} from ${trip.from} to ${trip.to} on ${trip.date} has been booked.`,
        [{ text: 'OK' }],
      );
    } catch (error) {
      console.error('Error booking flight:', error);
      Alert.alert('Error', 'Failed to book flight. Please try again.');
    }
  };

  const handleViewDetails = (trip: Trip) => {
    const details = `Flight: ${trip.flightNumber}
Airline: ${trip.airline}
Route: ${trip.from} → ${trip.to}
Date: ${trip.date}
${trip.returnDate ? `Return: ${trip.returnDate}` : ''}
Booking Reference: ${trip.bookingReference}
${trip.seat ? `Seat: ${trip.seat}` : ''}
${trip.gate ? `Gate: ${trip.gate}` : ''}
${trip.terminal ? `Terminal: ${trip.terminal}` : ''}
Price: ${trip.price}`;

    Alert.alert('Flight Details', details);
  };

  const renderTripItem = ({ item }: { item: Trip }) => (
    <View style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <View style={styles.airlineInfo}>
          <Icon name="flight" size={24} color="#1a73e8" />
          <View style={styles.airlineText}>
            <Text style={styles.airlineName}>{item.airline}</Text>
            <Text style={styles.flightNumber}>{item.flightNumber}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Icon name={getStatusIcon(item.status)} size={14} color="white" />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeSection}>
          <Text style={styles.routeTime}>{item.date}</Text>
          <Text style={styles.routeAirport}>{item.from}</Text>
        </View>

        <View style={styles.durationSection}>
          <Icon name="flight" size={20} color="#5f6368" />
          <Text style={styles.durationText}>
            {item.returnDate ? 'Round Trip' : 'One Way'}
          </Text>
        </View>

        <View style={styles.routeSection}>
          <Text style={styles.routeTime}>
            {item.returnDate ? item.returnDate : 'One way'}
          </Text>
          <Text style={styles.routeAirport}>{item.to}</Text>
        </View>
      </View>

      <View style={styles.tripInfo}>
        <View style={styles.infoItem}>
          <Icon name="confirmation-number" size={16} color="#5f6368" />
          <Text style={styles.infoText}>{item.bookingReference}</Text>
        </View>
        {item.seat && (
          <View style={styles.infoItem}>
            <Icon name="event-seat" size={16} color="#5f6368" />
            <Text style={styles.infoText}>{item.seat}</Text>
          </View>
        )}
        {item.gate && (
          <View style={styles.infoItem}>
            <Icon name="location-on" size={16} color="#5f6368" />
            <Text style={styles.infoText}>Gate {item.gate}</Text>
          </View>
        )}
      </View>

      <View style={styles.tripFooter}>
        <Text style={styles.tripPrice}>{item.price}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => handleViewDetails(item)}
        >
          <Icon name="info" size={16} color="#1a73e8" />
          <Text style={styles.viewDetailsText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bookFlightButton}
          onPress={() => handleBookFlight(item)}
        >
          <Icon name="flight" size={16} color="white" />
          <Text style={styles.bookFlightText}>Book Flight</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>✈️ Popular Trips</Text>
          <Text style={styles.subtitle}>
            Loading the most popular destinations...
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Icon name="flight" size={64} color="#1a73e8" />
          <Text style={styles.loadingText}>Loading popular trips...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>✈️ Popular Trips</Text>
          <Text style={styles.subtitle}>Something went wrong</Text>
        </View>
        <View style={styles.emptyState}>
          <Icon name="error" size={64} color="#ea4335" />
          <Text style={styles.emptyStateText}>Error Loading Trips</Text>
          <Text style={styles.emptyStateSubtext}>{error}</Text>
          <TouchableOpacity
            style={styles.searchFlightsButton}
            onPress={fetchPopularTrips}
          >
            <Icon name="refresh" size={20} color="white" />
            <Text style={styles.searchFlightsText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✈️ Popular Trips</Text>
        <Text style={styles.subtitle}>Top 7 most popular destinations</Text>
      </View>

      {filteredTrips.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="flight" size={64} color="#dadce0" />
          <Text style={styles.emptyStateText}>No popular trips available</Text>
          <Text style={styles.emptyStateSubtext}>
            Popular trips will appear here once data is available
          </Text>
          <TouchableOpacity style={styles.searchFlightsButton}>
            <Icon name="search" size={20} color="white" />
            <Text style={styles.searchFlightsText}>Search Flights</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          renderItem={renderTripItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default TripScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a73e8',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#5f6368',
    textAlign: 'center',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5f6368',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#5f6368',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  searchFlightsButton: {
    backgroundColor: '#1a73e8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  searchFlightsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  tripCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  airlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  airlineText: {
    marginLeft: 12,
  },
  airlineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
  },
  flightNumber: {
    fontSize: 12,
    color: '#5f6368',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  routeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeSection: {
    alignItems: 'center',
    flex: 1,
  },
  routeTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 4,
  },
  routeAirport: {
    fontSize: 12,
    color: '#5f6368',
  },
  durationSection: {
    alignItems: 'center',
    flex: 1,
  },
  durationText: {
    fontSize: 12,
    color: '#5f6368',
    marginTop: 4,
    fontWeight: '500',
  },
  tripInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#5f6368',
    marginLeft: 4,
    fontWeight: '500',
  },
  tripFooter: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  tripPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e8eaed',
  },
  viewDetailsText: {
    color: '#1a73e8',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  bookFlightButton: {
    flex: 1,
    backgroundColor: '#1a73e8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  bookFlightText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a73e8',
    marginTop: 16,
    textAlign: 'center',
  },
});
