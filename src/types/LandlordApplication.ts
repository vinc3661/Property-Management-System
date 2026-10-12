export type LandlordApplicationStatus =
  | "pending"
  | "underReview"
  | "approved"
  | "rejected";


  export type LandlordApplication = {
applicationId: string;
id:string;
propertyAddress: string;
documentPath: string;
documentFileName: string;
status:LandlordApplicationStatus;
submitedAt:string;

  }

  export type PropertyApplication = {
    id: string;
    propertyAddress: string;
    documentPath: string;
    documentFileName: string;
    status:LandlordApplicationStatus;
  }