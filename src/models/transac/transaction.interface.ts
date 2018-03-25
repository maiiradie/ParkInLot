import { Time } from "@angular/common";

export interface Transaction {
    transac_id?: string;
    date: Date;
    time_in: Time;
    time_out: Time;
    amount: number;
    ho_id: number;
    co_id:number;
    status: string;
    park_status: string;
}