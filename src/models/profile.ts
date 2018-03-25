export interface Roles {
	admin?:boolean;
	establishment?:boolean;
	homeowner?:boolean;
	carowner?:boolean;
}

export interface Profile {
	email:string,
	// password:string,
	fname: string,
	lname: string,
	mobile: number,
	gender: string,
	roles:Roles
}