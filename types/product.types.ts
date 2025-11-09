type Prices = { price: number; oldPrice?: number | null };

export type Product = Prices & {
  id: string;
  brand: string;
  name: string;
  description: string;
  imgSrc: string;
  category: string;
  quantity: number;
  rating: number;
  inStock: number;
  images: string[];
  logo: string;
  variants?: { id: string }[];
};
