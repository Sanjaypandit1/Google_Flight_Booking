'use client';

import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useState, useCallback } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; // ✅ import this

interface SearchHistory {
  id: string;
  origin: string;
  destination: string;
  date: string;
  timestamp: number;
  resultsCount: number;
}

interface BookingHistory {
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

const HistoryScreen = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [bookingHistory, setBookingHistory] = useState<BookingHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'searches' | 'bookings'>(
    'searches',
  );

  // ✅ Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, []),
  );

  const loadHistory = async () => {
    try {
      // Load search history
      const searches = await AsyncStorage.getItem('recentSearches');
      if (searches) {
        setSearchHistory(JSON.parse(searches));
      } else {
        setSearchHistory([]);
      }

      // Load booking history
      const bookings = await AsyncStorage.getItem('bookingHistory');
      if (bookings) {
        setBookingHistory(JSON.parse(bookings));
      } else {
        setBookingHistory([]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const clearSearchHistory = () => {
    Alert.alert(
      'Clear Search History',
      'Are you sure you want to clear all search history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('recentSearches');
              setSearchHistory([]);
            } catch (error) {
              console.error('Error clearing history:', error);
            }
          },
        },
      ],
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  const renderSearchItem = ({ item }: { item: SearchHistory }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View style={styles.routeInfo}>
          <Icon name="search" size={20} color="#1a73e8" />
          <Text style={styles.routeText}>
            {item.origin} → {item.destination}
          </Text>
        </View>
        <Text style={styles.timestampText}>{formatTime(item.timestamp)}</Text>
      </View>

      <View style={styles.historyDetails}>
        <Text style={styles.dateText}>Departure: {item.date}</Text>
        <Text style={styles.resultsText}>
          {item.resultsCount} flight{item.resultsCount !== 1 ? 's' : ''} found
        </Text>
      </View>

      <Text style={styles.searchDateText}>
        Searched on {formatDate(item.timestamp)}
      </Text>
    </View>
  );

  const renderBookingItem = ({ item }: { item: BookingHistory }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View style={styles.routeInfo}>
          <Icon
            name={getStatusIcon(item.status)}
            size={20}
            color={getStatusColor(item.status)}
          />
          <Text style={styles.routeText}>
            {item.from} → {item.to}
          </Text>
        </View>
        <Text
          style={[styles.statusText, { color: getStatusColor(item.status) }]}
        >
          {item.status.toUpperCase()}
        </Text>
      </View>

      <View style={styles.bookingDetails}>
        <Text style={styles.flightNumberText}>{item.flightNumber}</Text>
        <Text style={styles.airlineText}>{item.airline}</Text>
        <Text style={styles.timeText}>
          {item.departureTime} - {item.arrivalTime} ({item.duration})
        </Text>
      </View>

      <View style={styles.bookingFooter}>
        <Text style={styles.dateText}>Flight: {item.date}</Text>
        <Text style={styles.priceText}>{item.price}</Text>
      </View>

      <Text style={styles.bookingDateText}>
        Booked on {formatDate(item.bookingDate)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 History</Text>
        <Text style={styles.subtitle}>Your searches and bookings</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'searches' && styles.activeTab]}
          onPress={() => setActiveTab('searches')}
        >
          <Icon
            name="search"
            size={20}
            color={activeTab === 'searches' ? '#1a73e8' : '#5f6368'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'searches' && styles.activeTabText,
            ]}
          >
            Searches
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
          onPress={() => setActiveTab('bookings')}
        >
          <Icon
            name="flight"
            size={20}
            color={activeTab === 'bookings' ? '#1a73e8' : '#5f6368'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'bookings' && styles.activeTabText,
            ]}
          >
            Bookings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'searches' ? (
        searchHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="search" size={64} color="#dadce0" />
            <Text style={styles.emptyStateText}>No search history</Text>
            <Text style={styles.emptyStateSubtext}>
              Your flight searches will appear here
            </Text>
          </View>
        ) : (
          <FlatList
            data={searchHistory}
            renderItem={renderSearchItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.headerActions}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={clearSearchHistory}>
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )
      ) : bookingHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="flight" size={64} color="#dadce0" />
          <Text style={styles.emptyStateText}>No bookings yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Your flight bookings will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookingHistory}
          renderItem={renderBookingItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>Flight Bookings</Text>
          }
        />
      )}
    </View>
  );
};

export default HistoryScreen;

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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#f0f7ff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5f6368',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#1a73e8',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#202124',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  clearText: {
    fontSize: 14,
    color: '#ea4335',
    fontWeight: '600',
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
  },
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  historyCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#202124',
    marginLeft: 8,
  },
  timestampText: {
    fontSize: 12,
    color: '#5f6368',
    fontWeight: '500',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  historyDetails: {
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#202124',
    fontWeight: '500',
    marginBottom: 4,
  },
  resultsText: {
    fontSize: 12,
    color: '#0f9d58',
    fontWeight: '600',
  },
  searchDateText: {
    fontSize: 12,
    color: '#9aa0a6',
    fontStyle: 'italic',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  flightNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a73e8',
    marginBottom: 4,
  },
  airlineText: {
    fontSize: 14,
    color: '#5f6368',
    fontWeight: '500',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#5f6368',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f9d58',
  },
  bookingDateText: {
    fontSize: 12,
    color: '#9aa0a6',
    fontStyle: 'italic',
  },
});
