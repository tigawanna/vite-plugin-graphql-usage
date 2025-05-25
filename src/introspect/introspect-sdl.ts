import { parse, printSchema, buildSchema } from "graphql";
import { readFileSync } from "fs";


export type GraphqlSchemaMapvalue = {
  type: "Query" | "Mutation" | "Subscription";
  path: string;
  line: number;
};



function getGraphqlSchemaMapFromSDL(sdlContent: string) {
  const schema = buildSchema(sdlContent);
  const schemaMap = new Map<string, GraphqlSchemaMapvalue>();

  // Get query type
  const queryType = schema.getQueryType();
  if (queryType) {
    const fields = queryType.getFields();
    Object.keys(fields).forEach((fieldName) => {
      schemaMap.set(fieldName, {
        type: "Query",
        path: "",
        line: -1,
      });
    });
  }

  // Get mutation type
  const mutationType = schema.getMutationType();
  if (mutationType) {
    const fields = mutationType.getFields();
    Object.keys(fields).forEach((fieldName) => {
      schemaMap.set(fieldName, {
        type: "Mutation",
        path: "",
        line: -1,
      });
    });
  }

  // Get subscription type
  const subscriptionType = schema.getSubscriptionType();
  if (subscriptionType) {
    const fields = subscriptionType.getFields();
    Object.keys(fields).forEach((fieldName) => {
      schemaMap.set(fieldName, {
        type: "Subscription",
        path: "",
        line: -1,
      });
    });
  }

  return schemaMap;
}

export function getIntrospectedSchemaFromSDL(sdlPath: string) {
  const sdlContent = readFileSync(sdlPath, "utf-8");
  const schemaMap = getGraphqlSchemaMapFromSDL(sdlContent);
  const finalArray = Array.from(schemaMap.entries()).map(([key, value]) => ({
    name: key,
    type: value.type,
    path: value.path,
    line: value.line,
  }));
  return finalArray;
}

// Usage example
// const main = () => {
//   try {
//     const sdlContent = readFileSync("./schema.graphql", "utf-8");
//     const schemaMap = getGraphqlSchemaMapFromSDL(sdlContent);
//     const finalArray = Array.from(schemaMap.entries()).map(([key, value]) => ({
//       name: key,
//       type: value.type,
//       path: value.path,
//       line: value.line,
//     }));

//     console.log(finalArray);
//     console.table(finalArray);
//   } catch (error) {
//     console.error("Error reading SDL file:", error);
//   }
// };

// main();


