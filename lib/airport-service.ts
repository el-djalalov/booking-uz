import { apiServerClient } from "./api-server-client";

export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

interface AirportApiResponse {
  cities: {
    [key: string]: {
      countryIataCode: string;
      countryName: string;
      cityName: string;
      cityIataCode: string;
      airports?: {
        airportName: string;
        airportIataCode: string;
      }[];
    };
  };
}

export async function searchAirports(query: string): Promise<Airport[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    // Using GET, same as the working airline service
    const response = await apiServerClient.get<AirportApiResponse>(
      "/avia/airports", 
      {
        part: query, // Using 'part' as the parameter
        lang: "en",
      }
    );

    if (!response.success || !response.data) {
      console.error("Airport search API returned an error:", response.message);
      return [];
    }

    // Flatten the nested API response into a simple list
    const airports: Airport[] = [];
    for (const cityKey in response.data.cities) {
      const city = response.data.cities[cityKey];
      if (city.airports && city.airports.length > 0) {
        for (const airport of city.airports) {
          airports.push({
            iata: airport.airportIataCode,
            name: airport.airportName,
            city: city.cityName,
            country: city.countryName,
          });
        }
      } else {
        // If a city has no specific airports, treat the city itself as an airport
        airports.push({
          iata: city.cityIataCode,
          name: city.cityName,
          city: city.cityName,
          country: city.countryName,
        });
      }
    }

    return airports;
  } catch (error) {
    console.error("Error fetching airports:", error);
    return [];
  }
}