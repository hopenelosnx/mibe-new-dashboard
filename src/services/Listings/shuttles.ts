import apiConfig from "../apiConfig";

export interface Shuttle {
    id: number;
    name: string;
    price: number;
    image_url: File | string;
    from_location: string;
    to_location: string;
    schedule: string;
    published: string;
}

export const pagination = {
    page: 1,
    page_size: 10,
    total_pages: 1,
    total_items: 0,
};

export const getShuttlesWithPagination = async (
  page: number = 1,
  limit: number = 10
): Promise<{ shuttles: Shuttle[]; pagination: { page: number; limit: number; totalPages: number; totalRecords: number } }> => {
  const response = await fetch(`${apiConfig.baseurl}shuttles/?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch shuttles with pagination");
  }
  const data = await response.json();
  return {
    shuttles: data.shuttles,
    pagination: data.pagination,
  };
}

export const getShuttles = async (): Promise<Shuttle[]> => {
    const response = await fetch(`${apiConfig.baseurl}shuttles/`);
    if (!response.ok) {
        throw new Error("Failed to fetch shuttles");
    }
    return response.json();
}

export const addShuttle = async (shuttle: Omit<Shuttle, "id">): Promise<Shuttle> => {
    const formData = new FormData();

    // Append the image file or URL to the form data
    if (shuttle.image_url instanceof File) {
        formData.append("image", shuttle.image_url);
    } else {
        formData.append("image_url", shuttle.image_url);
    }

    // Append other shuttle properties to the form data
    Object.entries(shuttle).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value as string | Blob);
        }
    });

    const response = await fetch(`${apiConfig.baseurl}shuttles/`, {
        method: "POST",
        body: formData,
        headers:apiConfig.headers,
    });

    if (!response.ok) {
        throw new Error("Failed to add shuttle");
    }
    return response.json();
};

export const updateShuttle = async (id: number, shuttle: Omit<Shuttle, "id">): Promise<Shuttle> => {
    const formData = new FormData();

    // Append the image file or URL to the form data
    if (shuttle.image_url instanceof File) {
        formData.append("image", shuttle.image_url);
    } else {
        formData.append("image_url", shuttle.image_url);
    }

    // Append other shuttle properties to the form data
    Object.entries(shuttle).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value as string | Blob);
        }
    });

    const response = await fetch(`${apiConfig.baseurl}shuttles/${id}/`, {
        method: "PUT",
        body: formData,
        headers:apiConfig.headers,
    });

    if (!response.ok) {
        throw new Error("Failed to update shuttle");
    }
    return response.json();
};

export const deleteShuttle = async (id: number): Promise<void> => {
    const response = await fetch(`${apiConfig.baseurl}shuttles/${id}/`, {
        method: "DELETE",
        headers:apiConfig.headers,
    });

    if (!response.ok) {
        throw new Error("Failed to delete shuttle");
    }
};

