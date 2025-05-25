export type SchemaSdlSource = { sdlPath: string; endpoint?: never };
export type SchemaEndpointSource = { sdlPath?: never; endpoint: string };
export type SchemaSource = SchemaSdlSource | SchemaEndpointSource;

export interface GraphQLUsageOptions {
  schemaSource: SchemaSource;
  printTable?: boolean;
  saveReport?: boolean;
  include?: string | RegExp | Array<string | RegExp>;
  exclude?: string | RegExp | Array<string | RegExp>;
  queryDirectory?: string;
  outputFileName?: string;
}

export type QueryInfo = {
  name: string;
  type: string;
  path: string;
  line: number;
  found: boolean;
};
