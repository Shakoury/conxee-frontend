import {
  getUniversities,
  getFacultiesByUniversityId,
  getDepartments,
} from '@i-302/ng-unis';
import { api } from './api';
export interface Institution {
  id: string;
  name: string;
  sourceId?: string;
  available: boolean;
}
export const universitySuggestions = getUniversities();
export function sourceId(name: string) {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/\([^)]*\)/g, '')
      .trim();
  return (
    universitySuggestions.find((u) =>
      normalize(name).startsWith(normalize(u.name)),
    )?.id ?? ''
  );
}
export function facultySuggestions(id: string) {
  try {
    return getFacultiesByUniversityId(id).map((f) => ({
      value: f.id,
      label: f.name.replace(/\b\w/g, (c) => c.toUpperCase()),
    }));
  } catch {
    return [];
  }
}
export function departmentSuggestions(id: string, faculty: string) {
  try {
    const key =
      facultySuggestions(id).find(
        (f) => f.label.toLowerCase() === faculty.toLowerCase(),
      )?.value || faculty.toLowerCase().replaceAll(' ', '_');
    return getDepartments(id, key).map((d) => ({
      value: d,
      label: d.replace(/\b\w/g, (c) => c.toUpperCase()),
    }));
  } catch {
    return [];
  }
}
export async function searchInstitutions(
  query: string,
  signal: AbortSignal,
): Promise<Institution[]> {
  const data = await api<{
    data: { id: string; name: string }[];
    next_after?: string | null;
  }>(`/institutions?q=${encodeURIComponent(query)}`, { signal });
  const list = data.data;
  if (!Array.isArray(list))
    throw Error('Unsupported institution catalogue response');
  return list.map((item) => ({
    id: String(item.id),
    name: item.name,
    sourceId: sourceId(item.name),
    available: true,
  }));
}
