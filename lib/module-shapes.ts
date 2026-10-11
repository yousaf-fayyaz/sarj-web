/** Shared contours keep the SVG fallback and the live 3D artwork consistent. */
export const moduleSubjects = [
  "payroll",
  "attendance",
  "leave",
  "self-service",
  "performance",
  "employee-files",
] as const;

export type ModuleSubject = (typeof moduleSubjects)[number];

export const moduleContours = {
  payroll: "M0-86a86 86 0 1 1 0 172a86 86 0 1 1 0-172Z",
  leave: "M-103-93h178a16 16 0 0 1 16 16V93a16 16 0 0 1-16 16H-103a16 16 0 0 1-16-16V-77a16 16 0 0 1 16-16Z",
  "self-service": "M-62-119h116a22 22 0 0 1 22 22V97a22 22 0 0 1-22 22H-62a22 22 0 0 1-22-22V-97a22 22 0 0 1 22-22Z",
  "employee-files": "M-86-105H34L78-61V104H-86Z",
} as const;

export const fingerprintRidges = [
  "M-72 95C-94 58-99 18-91-24C-82-77-47-105 0-105C54-105 93-69 95-15C98 35 80 76 68 103",
  "M-61 99C-83 58-87 20-80-22C-72-67-41-93 0-93C47-93 81-61 83-14C86 30 70 70 56 101",
  "M-49 102C-69 66-77 23-68-20C-60-57-34-81 0-81C40-81 69-54 71-13C73 30 55 71 44 98",
  "M-36 103C-57 68-64 24-56-17C-50-48-28-69 0-69C33-69 57-47 59-12C61 30 44 67 31 97",
  "M-22 100C-44 63-52 24-44-15C-39-39-22-57 0-57C25-57 45-39 47-10C49 26 32 63 18 92",
  "M-7 94C-32 59-39 22-32-12C-28-31-16-45 0-45C18-45 33-31 35-9C37 24 22 57 7 83",
  "M7 71C-16 45-28 19-20-9C-17-23-10-33 0-33C12-33 22-23 23-7C25 15 13 35 8 46",
  "M21 58C9 55-4 37-9 19C-14 1-10-21 1-21C15-21 15-4 10 8",
  "M-91 59C-102 24-105-14-94-50",
  "M95 54C109 14 107-33 91-65",
];
