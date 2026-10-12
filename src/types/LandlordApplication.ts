export type LandlordApplicationStatus =
  | "pending"
  | "underReview"
  | "approved"
  | "rejected";


  export type LandlordApplication = {
applicationId: string;
id:string;
property:PropertySubmission[];
documentPath: string;
documentFileName: string;
status:LandlordApplicationStatus;
submitedAt:string;

  }

  export type PropertySubmission = {
    id: string;
    propertyAddress: string;
    documentPath: string;
    documentFileName: string;
    status:LandlordApplicationStatus;
  }