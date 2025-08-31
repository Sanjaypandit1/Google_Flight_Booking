// src/services/flightService.ts

// Free aviation APIs
const AVIATION_STACK_API_KEY = "dfb31b9c4db3a552960bad08b2d3ff18" // Free tier available
const OPEN_SKY_API = "https://opensky-network.org/api"
const AIRLABS_API_KEY = "your_airlabs_key" // Free tier available

// Cache for airport data to reduce API calls
const airportCache = new Map<string, Airport>()

export interface FlightSearchParams {
  origin: string
  destination: string
  date: string
  adults?: number
  currency?: string
  cabinClass?: string
}

export interface AirportSearchParams {
  query: string
}

export interface Flight {
  id: string
  price: {
    formatted: string
    raw: number
    currency?: string
  }
  legs: Array<{
    origin: {
      city: string
      name?: string
      iataCode: string
    }
    destination: {
      city: string
      name?: string
      iataCode: string
    }
    durationInMinutes: number
    carriers: {
      marketing: Array<{
        name: string
      }>
    }
    departure: string
    arrival: string
    stopCount?: number
  }>
}

export interface Airport {
  icao_code?: string
  iata_code: string
  name: string
  municipality_name: string
  country_code: string
  latitude: number
  longitude: number
}

export interface PopularTrip {
  id: string
  from: string
  to: string
  date: string
  returnDate?: string
  price: string
  airline: string
  flightNumber: string
  status: "upcoming" | "completed" | "cancelled"
  bookingReference: string
  gate?: string
  terminal?: string
  seat?: string
  popularity: number // New field for popularity ranking
}

// Helper function to simulate flight prices (real APIs would provide this)
const simulateFlightPricing = (origin: string, destination: string, date: string): number => {
  // Simple pricing algorithm based on distance and date
  const basePrice = 1000
  const dateMultiplier = new Date(date) > new Date() ? 1.2 : 1.0
  const routeMultiplier = Math.abs(origin.charCodeAt(0) - destination.charCodeAt(0)) / 10

  return Math.round(basePrice * dateMultiplier * routeMultiplier * 100) / 100
}

// Search airports using AviationStack (free tier available)
export const searchAirports = async (params: AirportSearchParams): Promise<Airport[]> => {
  try {
    const { query } = params

    if (!query || query.trim().length < 2) {
      throw new Error("Please enter at least 2 characters to search for airports")
    }

    // Check cache first
    const cacheKey = query.toLowerCase()
    if (airportCache.has(cacheKey)) {
      return [airportCache.get(cacheKey) as Airport]
    }

    // Try AviationStack API first
    try {
      const url = `http://api.aviationstack.com/v1/airports?access_key=${AVIATION_STACK_API_KEY}&search=${encodeURIComponent(query)}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.data && data.data.length > 0) {
        const airports = data.data.map((airport: any) => ({
          iata_code: airport.iata_code,
          name: airport.airport_name,
          municipality_name: airport.city,
          country_code: airport.country_code,
          latitude: airport.latitude,
          longitude: airport.longitude,
        }))

        // Cache the result
        airportCache.set(cacheKey, airports[0])
        return airports
      }
    } catch (error) {
      console.warn("AviationStack API failed, trying fallback", error)
    }

    // Fallback to local airport data if API fails
    const localAirports = await searchLocalAirports(query)
    if (localAirports.length > 0) {
      airportCache.set(cacheKey, localAirports[0])
      return localAirports
    }

    return []
  } catch (error) {
    console.error("Error searching airports:", error)
    throw new Error("Failed to search airports. Please try again.")
  }
}

// Local airport data as fallback
const searchLocalAirports = async (query: string): Promise<Airport[]> => {
  // This would typically be a local JSON file with major airports
  const majorAirports: Airport[] = [
    {
      iata_code: "JFK",
      name: "John F. Kennedy International Airport",
      municipality_name: "New York",
      country_code: "US",
      latitude: 40.639751,
      longitude: -73.778925,
    },
    {
      iata_code: "LAX",
      name: "Los Angeles International Airport",
      municipality_name: "Los Angeles",
      country_code: "US",
      latitude: 33.942791,
      longitude: -118.410042,
    },
    // Add more major airports as needed
  ]

  const queryLower = query.toLowerCase()
  return majorAirports.filter(
    (airport) =>
      airport.iata_code.toLowerCase().includes(queryLower) ||
      airport.name.toLowerCase().includes(queryLower) ||
      airport.municipality_name.toLowerCase().includes(queryLower),
  )
}

// Get real-time flight data from OpenSky Network (free)
export const getRealTimeFlights = async (airportCode: string): Promise<any[]> => {
  try {
    const url = `${OPEN_SKY_API}/flights/departure?airport=${airportCode}&begin=${Math.floor(Date.now() / 1000) - 3600}&end=${Math.floor(Date.now() / 1000)}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`OpenSky API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching real-time flights:", error)
    return []
  }
}

// Main search function using free APIs
export const searchFlights = async (params: FlightSearchParams): Promise<Flight[]> => {
  try {
    console.log("Starting flight search with params:", params)

    // Validate inputs
    if (!params.origin || !params.destination) {
      throw new Error("Please enter both origin and destination airports")
    }

    if (!params.date) {
      throw new Error("Please select a departure date")
    }

    // For free APIs, we'll simulate flight data as most free APIs don't provide booking info
    const price = simulateFlightPricing(params.origin, params.destination, params.date)

    // Simulate flight results
    const simulatedFlights: Flight[] = [
      {
        id: "1",
        price: {
          formatted: `$${price.toFixed(2)}`,
          raw: price,
          currency: params.currency || "USD",
        },
        legs: [
          {
            origin: {
              city: params.origin,
              iataCode: params.origin,
            },
            destination: {
              city: params.destination,
              iataCode: params.destination,
            },
            durationInMinutes: 120,
            carriers: {
              marketing: [{ name: "Simulated Airlines" }],
            },
            departure: `${params.date}T08:00:00`,
            arrival: `${params.date}T10:00:00`,
            stopCount: 0,
          },
        ],
      },
      {
        id: "2",
        price: {
          formatted: `$${(price * 1.3).toFixed(2)}`,
          raw: price * 1.3,
          currency: params.currency || "USD",
        },
        legs: [
          {
            origin: {
              city: params.origin,
              iataCode: params.origin,
            },
            destination: {
              city: params.destination,
              iataCode: params.destination,
            },
            durationInMinutes: 180,
            carriers: {
              marketing: [{ name: "Simulated Airlines with Stop" }],
            },
            departure: `${params.date}T12:00:00`,
            arrival: `${params.date}T15:00:00`,
            stopCount: 1,
          },
        ],
      },
    ]

    return simulatedFlights
  } catch (error) {
    console.error("Error searching flights:", error)
    throw new Error("Unable to search flights. Please verify your airport codes and try again.")
  }
}

// Get airport information by IATA code
export const getAirportInfo = async (iataCode: string): Promise<Airport | null> => {
  try {
    // Try AviationStack
    const url = `http://api.aviationstack.com/v1/airports?access_key=${AVIATION_STACK_API_KEY}&iata_code=${iataCode}`
    const response = await fetch(url)

    if (response.ok) {
      const data = await response.json()
      if (data.data && data.data.length > 0) {
        const airport = data.data[0]
        return {
          iata_code: airport.iata_code,
          name: airport.airport_name,
          municipality_name: airport.city,
          country_code: airport.country_code,
          latitude: airport.latitude,
          longitude: airport.longitude,
        }
      }
    }

    // Fallback to local data
    const localResults = await searchLocalAirports(iataCode)
    return localResults.length > 0 ? localResults[0] : null
  } catch (error) {
    console.error("Error getting airport info:", error)
    return null
  }
}

// Get the 7 most popular trips
export const getPopularTrips = async (): Promise<PopularTrip[]> => {
  try {
    // Simulate API call with popular destinations and routes
    const popularTrips: PopularTrip[] = [
      {
        id: "1",
        from: "New York (JFK)",
        to: "Los Angeles (LAX)",
        date: "Mar 15, 2025",
        returnDate: "Mar 22, 2025",
        price: "$299",
        airline: "Delta Airlines",
        flightNumber: "DL 2456",
        status: "upcoming",
        bookingReference: "DL7X9K",
        gate: "A12",
        terminal: "Terminal 4",
        seat: "14A",
        popularity: 95,
      },
      {
        id: "2",
        from: "London (LHR)",
        to: "Paris (CDG)",
        date: "Apr 10, 2025",
        returnDate: "Apr 14, 2025",
        price: "$189",
        airline: "British Airways",
        flightNumber: "BA 308",
        status: "upcoming",
        bookingReference: "BA9M3K",
        gate: "B15",
        terminal: "Terminal 5",
        seat: "12F",
        popularity: 92,
      },
      {
        id: "3",
        from: "Tokyo (NRT)",
        to: "Seoul (ICN)",
        date: "May 5, 2025",
        price: "$245",
        airline: "Japan Airlines",
        flightNumber: "JL 958",
        status: "upcoming",
        bookingReference: "JL4K8P",
        seat: "18A",
        popularity: 89,
      },
      {
        id: "4",
        from: "Dubai (DXB)",
        to: "Mumbai (BOM)",
        date: "Apr 20, 2025",
        returnDate: "Apr 28, 2025",
        price: "$320",
        airline: "Emirates",
        flightNumber: "EK 508",
        status: "upcoming",
        bookingReference: "EK7L2M",
        gate: "C8",
        terminal: "Terminal 3",
        seat: "22C",
        popularity: 87,
      },
      {
        id: "5",
        from: "Sydney (SYD)",
        to: "Melbourne (MEL)",
        date: "Mar 25, 2025",
        returnDate: "Mar 30, 2025",
        price: "$149",
        airline: "Qantas",
        flightNumber: "QF 401",
        status: "upcoming",
        bookingReference: "QF5N9R",
        gate: "D12",
        terminal: "Terminal 1",
        seat: "8B",
        popularity: 85,
      },
      {
        id: "6",
        from: "Barcelona (BCN)",
        to: "Rome (FCO)",
        date: "Jun 12, 2025",
        returnDate: "Jun 18, 2025",
        price: "$175",
        airline: "Vueling",
        flightNumber: "VY 6134",
        status: "upcoming",
        bookingReference: "VY3P7Q",
        seat: "15E",
        popularity: 83,
      },
      {
        id: "7",
        from: "Singapore (SIN)",
        to: "Bangkok (BKK)",
        date: "May 15, 2025",
        price: "$128",
        airline: "Singapore Airlines",
        flightNumber: "SQ 711",
        status: "upcoming",
        bookingReference: "SQ8R4T",
        gate: "A7",
        terminal: "Terminal 2",
        seat: "11D",
        popularity: 81,
      },
      {
        id: "8",
        from: "Chicago (ORD)",
        to: "Miami (MIA)",
        date: "Apr 20, 2025",
        price: "$249",
        airline: "American Airlines",
        flightNumber: "AA 1234",
        status: "upcoming",
        bookingReference: "AA8M2P",
        seat: "22F",
        popularity: 78,
      },
      {
        id: "9",
        from: "San Francisco (SFO)",
        to: "Seattle (SEA)",
        date: "Jan 10, 2025",
        returnDate: "Jan 15, 2025",
        price: "$189",
        airline: "Alaska Airlines",
        flightNumber: "AS 567",
        status: "completed",
        bookingReference: "AS3K7L",
        popularity: 75,
      },
      {
        id: "10",
        from: "Boston (BOS)",
        to: "Denver (DEN)",
        date: "Feb 28, 2025",
        price: "$199",
        airline: "United Airlines",
        flightNumber: "UA 892",
        status: "upcoming",
        bookingReference: "UA5N8Q",
        gate: "B7",
        terminal: "Terminal 1",
        seat: "18C",
        popularity: 72,
      },
    ]

    // Sort by popularity and return top 7
    const sortedTrips = popularTrips.sort((a, b) => b.popularity - a.popularity).slice(0, 7)

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000))

    return sortedTrips
  } catch (error) {
    console.error("Error fetching popular trips:", error)
    throw new Error("Failed to fetch popular trips. Please try again.")
  }
}
