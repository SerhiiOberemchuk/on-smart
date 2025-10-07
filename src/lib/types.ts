export type ProductType = {
	id: string;
	title: string;
	slug: string;
	price: number;
	variants?: { price: number; option: string }[];
};
export type Email = {
	email: string;
	name: string;
	text: string;
};
