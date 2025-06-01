import apiConfig from '../apiConfig';

export interface Activity {
  id: number;
  name: string;
  published: string;
  destination_id?: number;
  description?: string;
  price: number;
  duration?: string;
  dest_name:string;
  image_url?: File | string;
}

export const getActivitiesWithPagination = async (
  page:number =1, 
  limit: number = 10
): Promise<{
  activities: Activity[];
  pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalRecords: number;
  };
}> => {
  const response = await fetch(`${apiConfig.baseurl}activities/?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch activities');
  }
  const data = await response.json();
  return {
    activities: data.activities,
    pagination: data.pagination,
  };
};

export const addActivity = async (activity: Omit<Activity, 'id'>): Promise<Activity> => {
  const formData = new FormData();
  formData.append('image', activity.image_url as File);
  Object.entries(activity).forEach(([key, value]) => {
    if (key !== 'image_url' && value !== undefined && value !== null) {
      formData.append(key, value as string | Blob);
    }
  });
  const response = await fetch(`${apiConfig.baseurl}activities/`, {
    method: 'POST',
    body: formData,
    headers:apiConfig.headers,
  });
  if (!response.ok) {
    throw new Error('Failed to add activity');
  }
  return response.json();
};

export const updateActivity = async (id: number, activity: Partial<Activity>): Promise<Activity> => {
  const formData = new FormData();
  formData.append('image', activity.image_url as File);
  Object.entries(activity).forEach(([key, value]) => {
    if (key !== 'image_url' && value !== undefined && value !== null) {
      formData.append(key, value as string | Blob);
    }
  });
  const response = await fetch(`${apiConfig.baseurl}activities/${id}`, {
    method: 'PUT',
    body: formData,
    headers:apiConfig.headers,
  });
  if (!response.ok) {
    throw new Error('Failed to update activity');
  }
  return response.json();
};

export const deleteActivity = async (id: number): Promise<void> => {
  const response = await fetch(`${apiConfig.baseurl}activities/${id}`, {
    method: 'DELETE',
    headers:apiConfig.headers,
  });
  if (!response.ok) {
    throw new Error('Failed to delete activity');
  }
};

export const uploadActivityImage = async (id: number, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${apiConfig.baseurl}activities/${id}/upload_image/`, {
    method: 'POST',
    body: formData,
    headers:apiConfig.headers,
  });

  if (!response.ok) {
    throw new Error('Failed to upload activity image');
  }

  const data = await response.json();
  return data.image_url; // Assuming the API returns the image URL
};

