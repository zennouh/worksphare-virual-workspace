export enum roleEnum {
  receptionist = 'receptionist',
  it = 'it',
  security = 'security',
  cleaning = 'cleaning',
  manager = "manager",
  other = 'other',
}

export enum roomEnum {
  conference = 'conference',
  security = 'security',
  server = 'server',
  reception = 'reception',
  staff = 'staff',
  vault = 'vault',
}

export const RoomAccess: Record<roomEnum, roleEnum[]> = {
  [roomEnum.conference]: [roleEnum.it, roleEnum.cleaning, roleEnum.manager, roleEnum.other],
  [roomEnum.security]: [roleEnum.security, roleEnum.manager, roleEnum.cleaning],
  [roomEnum.server]: [roleEnum.it, roleEnum.manager],
  [roomEnum.reception]: [roleEnum.receptionist, roleEnum.manager, roleEnum.cleaning],
  [roomEnum.staff]: [roleEnum.it, roleEnum.security, roleEnum.manager, roleEnum.cleaning, roleEnum.other],
  [roomEnum.vault]: [roleEnum.manager, roleEnum.other],
}
