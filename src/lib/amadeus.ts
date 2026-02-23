import Amadeus from "amadeus";
import type {
  FlightSearchResponse,
  SearchParams,
  AirportSuggestion,
  AirportGroup,
} from "@/types/flights";

let client: Amadeus | null = null;

function getClient(): Amadeus {
  if (!client) {
    if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
      throw new Error("Missing AMADEUS_API_KEY or AMADEUS_API_SECRET env variables");
    }
    client = new Amadeus({
      clientId: process.env.AMADEUS_API_KEY,
      clientSecret: process.env.AMADEUS_API_SECRET,
    });
  }
  return client;
}

export async function searchFlights(params: SearchParams): Promise<FlightSearchResponse> {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toSuggestion(loc: any, subType: "AIRPORT" | "CITY"): AirportSuggestion {
  return {
    iataCode: loc.iataCode,
    name: loc.name,
    cityName: loc.address?.cityName ?? loc.name,
    countryCode: loc.address?.countryCode ?? "",
    subType,
    lat: loc.geoCode?.latitude,
    lon: loc.geoCode?.longitude,
  };
}

export async function searchAirports(keyword: string): Promise<AirportGroup[]> {
  const amadeus = getClient();

  // Amadeus matches better with uppercase; fetch more results for grouping
  const response = await amadeus.referenceData.locations.get({
    keyword: keyword.toUpperCase(),
    subType: "AIRPORT,CITY",
    "page[limit]": 20,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any[] = response.result?.data ?? [];

  const cities = raw.filter((l) => l.subType === "CITY");
  const airports = raw.filter((l) => l.subType === "AIRPORT");

  // cityCode → airports under that city
  const byCity = new Map<string, typeof airports>();
  for (const ap of airports) {
    const cc: string = ap.address?.cityCode ?? ap.iataCode;
    if (!byCity.has(cc)) byCity.set(cc, []);
    byCity.get(cc)!.push(ap);
  }

  const groups: AirportGroup[] = [];
  const handledCities = new Set<string>();

  // 1. Cities that Amadeus explicitly returned
  for (const city of cities) {
    if (handledCities.has(city.iataCode)) continue;
    handledCities.add(city.iataCode);
    const aps = (byCity.get(city.iataCode) ?? []).map((ap) => toSuggestion(ap, "AIRPORT"));
    groups.push({ city: toSuggestion(city, "CITY"), airports: aps });
  }

  // 2. Airports whose city wasn't returned — synthesise a city header from the airport's metadata
  for (const ap of airports) {
    const cc: string = ap.address?.cityCode ?? ap.iataCode;
    if (handledCities.has(cc)) continue;
    handledCities.add(cc);
    const synthCity: AirportSuggestion = {
      iataCode: cc,
      name: ap.address?.cityName ?? ap.name,
      cityName: ap.address?.cityName ?? ap.name,
      countryCode: ap.address?.countryCode ?? "",
      subType: "CITY",
      lat: ap.geoCode?.latitude,
      lon: ap.geoCode?.longitude,
    };
    const aps = (byCity.get(cc) ?? []).map((a) => toSuggestion(a, "AIRPORT"));
    groups.push({ city: synthCity, airports: aps });
  }

  return groups;
}
