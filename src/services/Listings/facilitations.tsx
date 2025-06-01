import apiConfig from "../apiConfig";

export interface Facilitation{
    id: number;
    name: string;
    description?: string;
    image_url?: File | string;
    published: string;
    price: number;
}

export const getFacilitationServices = async (): Promise<Facilitation[]> => {
    const response = await fetch(`${apiConfig.baseurl}facilitations/`);
    if (!response.ok) {
        throw new Error("Failed to fetch facilitations");
    }
    return response.json();
};


export const getFacilitationServicesWithPagination = async (
    page = 1,
    limit = 10
): Promise<{
    facilitations: Facilitation[];
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalRecords: number;
    };
}> => {
    const response = await fetch(
        `${apiConfig.baseurl}facilitations/?page=${page}&limit=${limit}`
    );
    if (!response.ok) {
        throw new Error("Failed to fetch facilitations with pagination");
    }
    const data = await response.json();
    return {
        facilitations: data.facilitations,
        pagination: data.pagination,
    };
}

export const addFacilitationService = async (facilitation: Omit<Facilitation, 'id'>): Promise<Facilitation> => {
    const formData = new FormData();

    // Append the image file or URL to the form data
    if (facilitation.image_url instanceof File) {
        formData.append("image", facilitation.image_url);
    } else {
        formData.append("image_url", facilitation.image_url);
    }

    // Append other package properties to the form data
    Object.entries(facilitation).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value as string | Blob);
        }
    });

    const response = await fetch(`${apiConfig.baseurl}facilitations/`, {
        method: "POST",
        body: formData,
        headers:apiConfig.headers,
    });

    if (!response.ok) {
        throw new Error("Failed to add facilitation");
    }
    return response.json();
};


export const updateFacilitationService = async (id: number, facilitation: Omit<Facilitation, 'id'>): Promise<Facilitation> => {
    const formData = new FormData();

    // Append the image file or URL to the form data
    if (facilitation.image_url instanceof File) {
        formData.append("image", facilitation.image_url);
    } else {
        formData.append("image_url", facilitation.image_url);
    }

    // Append other package properties to the form data
    Object.entries(facilitation).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value as string | Blob);
        }
    });

    const response = await fetch(`${apiConfig.baseurl}facilitations/${id}/`, {
        method: "PUT",
        body: formData,
        headers:apiConfig.headers,
    });

    if (!response.ok) {
        throw new Error("Failed to update facilitation");
    }
    return response.json();
};

export const deleteFacilitationService = async (id: number): Promise<void> => {
    const response = await fetch(`${apiConfig.baseurl}facilitations/${id}/`, {
        method: "DELETE",
        headers:apiConfig.headers,
    });

    if (!response.ok) {
        throw new Error("Failed to delete facilitation");
    }
};
