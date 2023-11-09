import data from "./data.csv";

export type Ingredient = {
  id: number;
  name: string;
  weight: number;
  carbs: number;
  protein: number;
  kcal: number;
  lipids: number;
};

export default data as Ingredient[];
