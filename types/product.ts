export interface ProductRecord {
  [key: string]: string | number | { [shipName: string]: { price_list: number[]; last_modified: string; } };
  category: string;
  img: string; // 新しいフィールドを追加
  last_modified_date: string;
  product_name: string;
  max: number;
  min: number;
  average: number;
  ships: {
    [shipName: string]: {
      price_list: number[];
      last_modified: string;
    };
  };
  group_name: string;
}

