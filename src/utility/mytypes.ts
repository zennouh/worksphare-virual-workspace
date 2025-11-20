import { roleEnum } from './enum'



export type inputFields = "name" | "email" | "phone" | "image"

export interface IExperience {
  id: string
  company: string
  role: string
  from: Date
  to: Date | null
}

export interface IMember {
  id: number
  name: string
  role: roleEnum
  zone:string,
  image: string
  email: string
  phone: string
  experience: IExperience[]
}

export interface IAMember extends IMember {
  left: number;
  top: number;
}