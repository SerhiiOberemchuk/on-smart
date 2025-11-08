export type Product = {
  id: string;
  brand: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number | null;
  imgSrc: string;
  category: string;
  quantity: number;
  rating: number;
  inStock: number;
  images: string[];
  logo: string;
};
