export interface ChildProperties {
  axis?: 'ROW' | 'COLUMN' | string;
  mainAxisAlignment?: string;
  crossAxisAlignment?: string;
  gap?: number;
  width?: string | number;
  height?: string | number;
  weight?: number;
  [key: string]: any;
}
