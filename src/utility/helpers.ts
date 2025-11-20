import { roleEnum, RoomAccess, roomEnum } from './enum'
import { inputFields } from './mytypes'

export function checkRoomeAndRole(role: roleEnum, room: roomEnum): boolean {
  return RoomAccess[room].includes(role)
}

export function toRoleEnumValue(str: string): roleEnum | null {
  if (Object.values(roleEnum).includes(str as roleEnum)) {
    return str as roleEnum
  } else {
    return null
  }
}

export function toRoomEnumValue(str: string): roomEnum {
  return str as roomEnum
}

export function stringValidate(value: string, valueType: inputFields) {
  const regexHuman = /^[a-zA-Z][a-z]{1,}(\s?[a-z]{0,})*$/;
  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  const regexPhone = /^\+?[0-9](-?[0-9]{2,14})*$/
  const regexImg = /\.(jpg|jpeg|png|gif|bmp).*$/i

  if (valueType === "name") {
    return regexHuman.test(value);
  }
  if (valueType === "email") {
    return regexEmail.test(value)
  }
  if (valueType === "phone") {
    return regexPhone.test(value)
  }
  if (valueType === "image") {
    return regexImg.test(value)
  }

}
