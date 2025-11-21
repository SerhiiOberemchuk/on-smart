type Prices = { price: number; oldPrice?: number | null };

export type Product = Prices & {
  id: string;
  brand: string;
  name: string;
  description: string;
  imgSrc: string;
  category: string;
  quantity: number;
  rating: 0 | 1 | 2 | 3 | 4 | 5;
  inStock: number;
  images: string[];
  logo: string;
  variants?: { id: string }[];
};
export type Product_Details = {
  product_id: string;
  characteristics_descrizione: { images: string[]; title: string; description: string };
  characteristics_specifiche: {
    images: string[];
    title: string;
    description: {
      title: string;
      items: { name: string; value: string }[];
    }[];
  };
  characteristics_documenti: { link: string[]; title: string };
  characteristics_valutazione: {
    recensioni: {
      clientName: string;
      rating: 0 | 1 | 2 | 3 | 4 | 5;
      comment: string;
      date: string;
    }[];
  };
};
