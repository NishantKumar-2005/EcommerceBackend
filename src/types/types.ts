
export interface NewUserRequestBody {
    name: string;
    email: string;
    photo: string;
    role: "user" | "admin";
    dob: Date;
    gender:string;
    _id: string;
} 