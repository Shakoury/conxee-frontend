declare module '@i-302/ng-unis' {
  export function getUniversities(): { id: string; name: string }[];
  export function getFacultiesByUniversityId(
    id: string,
  ): { id: string; name: string }[];
  export function getDepartments(id: string, faculty: string): string[];
}
