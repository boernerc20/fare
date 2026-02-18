export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  travelClass: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
  nonStop: boolean;
  currencyCode: string;
}

export interface FlightSegment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string; // ISO datetime
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft: { code: string };
  duration: string; // ISO 8601 e.g. PT2H30M
  numberOfStops: number;
}

export interface Itinerary {
  duration: string;
  segments: FlightSegment[];
}

export interface Price {
  currency: string;
  total: string;
  base: string;
  grandTotal: string;
}

export interface FlightOffer {
  id: string;
  source: string;
  itineraries: Itinerary[];
  price: Price;
  validatingAirlineCodes: string[];
  travelerPricings: {
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: Price;
    fareDetailsBySegment: {
      segmentId: string;
      cabin: string;
      class: string;
      includedCheckedBags?: { quantity: number };
    }[];
  }[];
  numberOfBookableSeats: number;
}

export interface FlightSearchResponse {
  data: FlightOffer[];
  meta?: { count: number };
  dictionaries?: {
    carriers?: Record<string, string>;
    aircraft?: Record<string, string>;
    locations?: Record<string, { cityCode: string; countryCode: string }>;
  };
  error?: string;
}

export interface AirportSuggestion {
  iataCode: string;
  name: string;
  cityName: string;
  countryCode: string;
  lat?: number;
  lon?: number;
}

export interface AirportCoords {
  iataCode: string;
  cityName: string;
  lat: number;
  lon: number;
}
