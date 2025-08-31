// src/services/flightService.ts

const RAPID_API_KEY = "5413f7ca30mshc497056ffd3f401p1b33e2jsne498e77d47eb"
const RAPID_API_HOST = "sky-scrapper.p.rapidapi.com"

export interface FlightSearchParams {
  origin: string
  destination: string
  date: string
  adults?: number
  currency?: string
  cabinClass?: string
  countryCode?: string
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
      displayCode?: string
    }
    destination: {
      city: string
      name?: string
      iataCode: string
      displayCode?: string
    }
    durationInMinutes: number
    duration?: string
    carriers: {
      marketing: Array<{
        name: string
        logoUrl?: string
        alternateName?: string
      }>
      operating?: Array<{
        name: string
      }>
    }
    departure: string
    arrival: string
    stopCount?: number
    segments?: Array<{
      departure: {
        date: string
        time: string
        airport: {
          iataCode: string
          name: string
        }
      }
      arrival: {
        date: string
        time: string
        airport: {
          iataCode: string
          name: string
        }
      }
      carrier: {
        name: string
      }
      durationInMinutes: number
    }>
  }>
  isNonStop?: boolean
  totalDuration?: number
}

export interface FlightSearchResponse {
  data?: {
    itineraries?: Flight[]
    flights?: Flight[]
    results?: Flight[]
  }
  itineraries?: Flight[]
  flights?: Flight[]
  results?: Flight[]
  status?: string
  message?: string
}

export const searchFlights = async (params: FlightSearchParams): Promise<Flight[]> => {
  try {
    const { 
      origin, 
      destination, 
      date, 
      adults = 1, 
      currency = "USD",
      cabinClass = "economy",
      countryCode = "US"
    } = params

    // Create the legs parameter with proper URL encoding
    const legs = encodeURIComponent(JSON.stringify([
      {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        date: date
      }
    ]))

    // Fixed URL construction using actual parameters
    const url = `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchFlights?legs=${legs}&adults=${adults}&currency=${currency}&cabinClass=${cabinClass}&countryCode=${countryCode}`

    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPID_API_KEY,
        "X-RapidAPI-Host": RAPID_API_HOST,
      },
    }

    console.log("Making API request to Sky Scrapper...")
    console.log("URL:", url)
    
    const response = await fetch(url, options)

    if (!response.ok) {
      console.error("API response error:", response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: FlightSearchResponse = await response.json()
    console.log("API response received:", data)

    // Handle different response formats from the API
    let flights: Flight[] = []

    if (data.data?.itineraries) {
      flights = data.data.itineraries
    } else if (data.data?.flights) {
      flights = data.data.flights
    } else if (data.data?.results) {
      flights = data.data.results
    } else if (data.itineraries) {
      flights = data.itineraries
    } else if (data.flights) {
      flights = data.flights
    } else if (data.results) {
      flights = data.results
    } else if (Array.isArray(data)) {
      flights = data
    }

    console.log(`Found ${flights.length} flights in API response`)

    if (flights.length > 0) {
      return flights
    }

    console.log("No flights found in API response")
    return []

  } catch (error) {
    console.error("Error searching flights:", error)
    throw new Error("Failed to fetch flights. Please check your internet connection and try again.")
  }
}