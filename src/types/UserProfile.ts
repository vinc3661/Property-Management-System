export interface UserProfile{
id:string,
email:string|null,
name:string,
role:"landlord"|"caretaker"|null,
landlordId:string|null,
phoneNumber:string|null,
};