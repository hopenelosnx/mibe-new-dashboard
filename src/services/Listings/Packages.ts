import apiConfig from "../apiConfig";

// Interface representing a package
export interface Package {
    id: number; // Unique identifier for the package
    name: string; // Name of the package
    published: string; // Whether the package is published
    description: string; // Description of the package
    image_url: File | string; // Can be a URL or a File object
    price: number; // Price of the package
    travel_type?: string; // Optional, e.g., "Domestic", "International"
    duration?: string; // Optional, e.g., "3 days", "1 week"
    rating?: number; // Optional, e.g., 4.5
    featured?: boolean; // Optional, true if the package is featured
    status: number; // Status of the package (e.g., active or inactive)
    destination_id?: number; // Optional, ID of the destination associated with the package
}

// Fetch all packages from the API
export const getPackages = async (): Promise<Package[]> => {
    const response = await fetch(`${apiConfig.baseurl}packages/`);
    if (!response.ok) {
        throw new Error("Failed to fetch packages");
    }
    return response.json();
};

// Add a new package to the API
export const addPackage = async (
    pkg: Omit<Package, "id">
): Promise<Package> => {
    const formData = new FormData();

    // Append the image file or URL to the form data
    if (pkg.image_url instanceof File) {
        formData.append("image", pkg.image_url);
    } else {
        formData.append("image_url", pkg.image_url);
    }

    // Append other package properties to the form data
    Object.entries(pkg).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value as string | Blob);
        }
    });

    const response = await fetch(`${apiConfig.baseurl}packages/`, {
        method: "POST",
        body: formData,
        headers:apiConfig.headers,
    });

    if (!response.ok) {
        throw new Error("Failed to add package");
    }
    return response.json();
};

// Fetch packages with pagination from the API
export const getPackagesWithPagination = async (
    page = 1,
    limit = 10
): Promise<{
    packages: Package[];
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalRecords: number;
    };
}> => {
    const response = await fetch(
        `${apiConfig.baseurl}packages/?page=${page}&limit=${limit}`
    );
    if (!response.ok) {
        throw new Error("Failed to fetch packages with pagination");
    }
    const data = await response.json();
    return {
        packages: data.packages,
        pagination: data.pagination,
    };
};

// Update an existing package in the API
export const updatePackage = async (
    id: number,
    pkg: Omit<Package, "id">
): Promise<Package> => {
    const formData = new FormData();

    // Append the image file or URL to the form data
    if (pkg.image_url instanceof File) {
        formData.append("image", pkg.image_url);
    } else {
        formData.append("image_url", pkg.image_url);
    }

    // Append other package properties to the form data
    Object.entries(pkg).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value as string | Blob);
        }
    });

    const response = await fetch(`${apiConfig.baseurl}packages/${id}/`, {
        method: "PUT",
        body: formData,
        headers:apiConfig.headers,
    });

    if (!response.ok) {
        throw new Error("Failed to update package");
    }
    return response.json();
};

// Delete a package from the API
export const deletePackage = async (id: number): Promise<void> => {
    const response = await fetch(`${apiConfig.baseurl}packages/${id}/`, {
        method: "DELETE",
        headers:apiConfig.headers,
    });

    if (!response.ok) {
        throw new Error("Failed to delete package");
    }
};
