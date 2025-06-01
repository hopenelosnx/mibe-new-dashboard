import apiConfig from '../apiConfig';

export interface Flight {
  id: number;
  flight_number: string;
  published: string;
  airline: string;
  departure_city: string;
  arrival_city: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  image_url?: string;
  description?: string;
  location?: string;
}

export const getFlights = async (): Promise<Flight[]> => {
    const response = await fetch(`${apiConfig.baseurl}flights/`);
    if (!response.ok) {
        throw new Error('Failed to fetch flights');
    }
    return response.json();
};

export const getFlightsWithPagination = async (
  page: number = 1,
  limit: number = 10
): Promise<{ flights: Flight[]; pagination: { page: number; limit: number; totalPages: number; totalRecords: number } }> => {
  const response = await fetch(`${apiConfig.baseurl}flights/paginated/?page=${page}&limit=${limit}`);
  console.log(response)
  if (!response.ok) {
    throw new Error("Failed to fetch flights with pagination");
  }
  const data = await response.json();
  return {
    flights: data.flights,
    pagination: data.pagination,
  };
}


export const addFlight = async (flight: Omit<Flight, 'id'>): Promise<Flight> => {
    console.log(JSON.stringify(flight))
    const response = await fetch(`${apiConfig.baseurl}flights/`, {
        method: 'POST',
        headers: apiConfig.headers,
        body: JSON.stringify(flight),
    });
    if (!response.ok) {
        throw new Error('Failed to add flight');
    }
    return response.json();
};

export const updateFlight = async (id: number, flight: Partial<Flight>): Promise<Flight> => {
    const response = await fetch(`${apiConfig.baseurl}flights/${id}`, {
        method: 'PUT',
        headers: apiConfig.headers,
        body: JSON.stringify(flight),
    });
    if (!response.ok) {
        throw new Error('Failed to update flight');
    }
    return response.json();
};

export const deleteFlight = async (id: number): Promise<void> => {
    const response = await fetch(`${apiConfig.baseurl}flights/${id}`, {
        method: 'DELETE',
        headers:apiConfig.headers,

    });
    if (!response.ok) {
        throw new Error('Failed to delete flight');
    }
};
export const getFlightById = async (id: number): Promise<Flight> => {
    const response = await fetch(`/api/flights/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch flight');
    }
    return response.json();
};
