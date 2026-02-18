import Amadeus from "amadeus";
import type {
  FlightSearchResponse,
  SearchParams,
  AirportSuggestion,
} from "@/types/flights";

// Lazily initialised so the module loads without env vars at build time
let client: Amadeus | null = null;

function getClient(): Amadeus {
  if (!client) {
    if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
      throw new Error(
        "Missing AMADEUS_API_KEY or AMADEUS_API_SECRET env variables"
      );
    }
    client = new Amadeus({
      clientId: process.env.AMADEUS_API_KEY,
      clientSecret: process.env.AMADEUS_API_SECRET,
    });
  }
  return client;
}

export async function searchFlights(
  params: SearchParams
): Promise<FlightSearchResponse> {
  const amadeus = getClient();

  const query: Record<string, string | number | boolean> = {
    originLocationCode: params.origin,
    destinationLocationCode: params.destination,
    departureDate: params.departureDate,
    adults: params.adults,
    travelClass: params.travelClass,
    nonStop: params.nonStop,
    currencyCode: params.currencyCode,
    max: 20,
  };

  if (params.returnDate) {
    query.returnDate = params.returnDate;
  }

  const response = await amadeus.shopping.flightOffersSearch.get(query);
  return response.result as FlightSearchResponse;
}

export async function searchAirports(
  keyword: string
): Promise<AirportSuggestion[]> {
  const amadeus = getClient();
  const response = await amadeus.referenceData.locations.get({
    keyword,
    subType: "AIRPORT,CITY",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (response.result?.data ?? []).map((loc: any) => ({
    iataCode: loc.iataCode,
    name: loc.name,
    cityName: loc.address?.cityName ?? loc.name,
    countryCode: loc.address?.countryCode ?? "",
    lat: loc.geoCode?.latitude,
    lon: loc.geoCode?.longitude,
  }));
}
