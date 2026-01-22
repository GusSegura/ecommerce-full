import z from 'zod';

export interface Ropa {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  imagesUrl: string[];    // arreglo de URLs que manda el backend
  category: string;       // ObjectId como string
  season?: string;     // opcional: si en el futuro quieres usar temporada
  imagenHover?: string;   // opcional: para hover si deseas
  [key: string]: any;     // permite propiedades extras sin romper compilación
}
  

  export type ProductResponse = {
  products: Ropa[];
  pagination: {
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalPages: number;
    totalResults: number;
  };
};

export const cartProductSchema = z.object({
    _id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
    imageUrl: z.string().optional(),
    stock: z.number(),
    category: z.string(),
});