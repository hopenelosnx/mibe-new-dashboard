import { Key } from "react";
import { api, base_url } from "../apiConfig";

export type EventType = "free" | "paid";

export interface CulturalEvent {
  title: string;
  description: string;
  destination: string;
  event_type: EventType;
  image: File | string | null;
  price: number;
  published?: string;
}

export interface CulturalEventProp {
  id: string | number | Key
  title: string;
  description: string;
  destination: string;
  event_type: EventType;
  image_url: File | string | null;
  price: number;
  published?: string;
}

/**add */
export const addCulturalEvent = async (data: FormData) => {

  const res = await api.post(`${base_url}travel-inspiration/event`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (!res.data) throw new Error('Failed to add cultural event');

  return res
};

/**delete */
export const deleteCulturalEvent = async (id: string | number) => {
  const res = await api.delete(`${base_url}travel-inspiration/event/${id}`);
  return res;
};
