export interface SubComponentProperties {
  axis?: 'ROW' | 'COLUMN' | string;
  mainAxisAlignment?: string;
  crossAxisAlignment?: string;
  width?: string | number;
  height?: string | number;
  padding?: number | string;
  paddingTop?: number;
  margin?: number | string;
  [key: string]: any;
}
