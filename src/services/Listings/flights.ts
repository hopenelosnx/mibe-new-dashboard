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

const token = localStorage.getItem("travelUserToken");
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
    
    if (flight.published === "") {
        flight.published = "1";
    }
    const data = JSON.stringify(flight);
    const response = await fetch(`${apiConfig.baseurl}flights/`, {
        method: 'POST',
        headers: {
            "Content-Type":"application/json",
            "Authorization": `Bearer ${token}`
        },
        body: data,
    });
    if (!response.ok) {
        throw new Error('Failed to add flight');
    }
    return response.json();
};

export const updateFlight = async (id: number, flight: Partial<Flight>): Promise<Flight> => {
    const response = await fetch(`${apiConfig.baseurl}flights/${id}`, {
        method: 'PUT',
        headers: {
            "Content-Type":"application/json",
            "Authorization": `Bearer ${token}`
        },
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

export const publishFlights = async(id: number, published: { published: string }): Promise<Flight> => {
    const response = await fetch(`${apiConfig.baseurl}flights/published/${id}`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(published)
    })
    if(!response.ok){
        console.log(response)
        throw new Error("Failed to publish flight")
    }

    return response.json();
}