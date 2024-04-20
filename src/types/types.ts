import exp from "constants";
import { NextFunction, Request, Response } from "express";

export interface NewUserRequestBody {
    name: string;
    email: string;
    photo: string;
    dob: Date;
    gender: string;
    _id: string;
}


export interface NewProductRequestBody {
    name: string;
    photo: string;
    price: number;
    stock: number;
    category: string;
}

export type SearchRequestQuery = {
    search?: string;
    price?: string;
    category?: string;
    sort?: string;
    page?: string;
}

export type ControllerType = (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;

export interface baseQuery {
    name?: {
        $regex: string,
        $options: string
    };
    price?: {
        $lte: number;
    };
    category?: string;

}
export type invalidateCacheType = {
    products?:boolean;
    order?:boolean;
    admin?:boolean;
    user?:string;
    orderId?:string;
    productId?:string | string[];
}


export type shippingInfo={
    address :string,
    city :string,
    state :string,
    pincode :number,

}
export type orderItems={    
        name:string,
        photo:string,
        price:number,
        quantity:number,
        productId:string,
}
export interface NewOrderRequestBody {
    shippingInfo:shippingInfo,
    user:string,
    subtotal:number,
    shippingCharges:number,
    tax:number,
    discount:number,
    total:number,
    status:string,
    orderItems:orderItems[];
}