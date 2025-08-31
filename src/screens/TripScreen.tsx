import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  FlatList,
  Image 
} from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'

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
}

const TripScreen = () => {
  // Mock trip data
  const trips: Trip[] = [
    {
      id: '1',
      from: 'New York (JFK)',
      to: 'Los Angeles (LAX)',
      date: 'Jan 15, 2024',
      returnDate: 'Jan 22, 2024',
      price: '$299',
      airline: 'Delta Airlines',
      flightNumber: 'DL 2456',
      status: 'upcoming'
    },
    {
      id: '2',
      from: 'Chicago (ORD)',
      to: 'Miami (MIA)',
      date: 'Feb 20, 2024',
      price: '$249',
      airline: 'American Airlines',
      flightNumber: 'AA 1234',
      status: 'upcoming'
    },
    {
      id: '3',
      from: 'San Francisco (SFO)',
      to: 'Seattle (SEA)',
      date: 'Dec 10, 2023',
      returnDate: 'Dec 15, 2023',
      price: '$189',
      airline: 'Alaska Airlines',
      flightNumber: 'AS 567',
      status: 'completed'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#1a73e8';
      case 'completed': return '#0f9d58';
      case 'cancelled': return '#db4437';
      default: return '#5f6368';
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return 'flight-takeoff';
      case 'completed': return 'check-circle';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  }

  const renderTripItem = ({ item }: { item: Trip }) => (
    <View style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <View style={styles.airlineInfo}>
          <Icon name="flight" size={24} color="#1a73e8" />
          <Text style={styles.airlineName}>{item.airline}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
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
          <Text style={styles.durationText}>Direct</Text>
        </View>
        
        <View style={styles.routeSection}>
          <Text style={styles.routeTime}>
            {item.returnDate ? item.returnDate : 'One way'}
          </Text>
          <Text style={styles.routeAirport}>{item.to}</Text>
        </View>
      </View>

      <View style={styles.tripFooter}>
        <Text style={styles.flightNumber}>{item.flightNumber}</Text>
        <Text style={styles.tripPrice}>{item.price}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.viewDetailsButton}>
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
        {item.status === 'upcoming' && (
          <TouchableOpacity style={styles.checkInButton}>
            <Text style={styles.checkInText}>Check-in</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Trips</Text>
      
      {trips.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="flight" size={64} color="#dadce0" />
          <Text style={styles.emptyStateText}>No trips booked yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Your booked flights will appear here once you make a reservation
          </Text>
          <TouchableOpacity style={styles.searchFlightsButton}>
            <Text style={styles.searchFlightsText}>Search Flights</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={trips}
          renderItem={renderTripItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

export default TripScreen

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
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#5f6368',
    textAlign: 'center',
    marginBottom: 24,
  },
  searchFlightsButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchFlightsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  tripCard: {
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
  airlineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
    marginLeft: 8,
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
    marginBottom: 20,
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
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  flightNumber: {
    fontSize: 12,
    color: '#5f6368',
  },
  tripPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: '#f1f3f4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#1a73e8',
    fontSize: 14,
    fontWeight: '600',
  },
  checkInButton: {
    flex: 1,
    backgroundColor: '#0f9d58',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkInText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
})