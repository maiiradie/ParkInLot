export interface Roles {
	homeowner?:boolean;
}

export interface Profile {
    address: string,
    capacity: number,
    details: string,
    roles:Roles
}