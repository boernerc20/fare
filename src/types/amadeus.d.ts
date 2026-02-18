declare module "amadeus" {
  interface AmadeusOptions {
    clientId: string;
    clientSecret: string;
    hostname?: string;
    logLevel?: string;
  }

  interface Response {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
  }

  interface GetOptions {
    [key: string]: string | number | boolean | undefined;
  }

  interface Locations {
    get(options: GetOptions): Promise<Response>;
  }

  interface ReferenceData {
    locations: Locations;
  }

  interface FlightOffersSearch {
    get(options: GetOptions): Promise<Response>;
  }

  interface Shopping {
    flightOffersSearch: FlightOffersSearch;
  }

  class Amadeus {
    constructor(options: AmadeusOptions);
    referenceData: ReferenceData;
    shopping: Shopping;
  }

  export default Amadeus;
}
