export interface Range {
  from: string;
  to: string;
}

export interface Query {
  query: string;
  key?: string;
}

export interface ExploreUrlState {
  datasource: string;
  queries: Query[];
  range: Range;
}
