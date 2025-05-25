async function introspectGraphQlSchema(graphqlEndpoint: string) {
  const introspectionQuery = `
  query {
        __schema {
          queryType {
            name
            fields{
              name
              isDeprecated
   
            }
          }
          mutationType {
            name
            kind
            fields{
              name
              isDeprecated
  
            }
          }
          subscriptionType {
            name
            kind
            fields{
              name
              isDeprecated
  
            }
          }
        }
  }
  
  `;
  try {
    const response = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: introspectionQuery,
      }),
    });

    if (!response.ok) {
      throw new Error(`introspection failed : ${response.statusText}`);
    }

    const data = (await response.json()) as IntrospectionRResult;
    if (!data || !data.data || !data.data.__schema) {
      throw new Error("Invalid introspection response structure");
    }
    // console.log('Introspection data:', JSON.stringify(data, null, 2));
    console.log("Introspection completed successfully");
    return data;
  } catch (error) {
    console.error("Error during introspection:", error);
    throw new Error(
      `Introspection failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }}

export type IntrospectionRResult = {
  data: {
    __schema: {
      queryType: {
        name: string;
        fields: {
          name: string;
          isDeprecated: boolean;
        }[];
      } | null;
      mutationType: {
        name: string;
        kind: string;
        fields: {
          name: string;
          isDeprecated: boolean;
        }[];
      } | null;
      subscriptionType: {
        name: string;
        kind: string;
        fields: {
          name: string;
          isDeprecated: boolean;
        }[];
      } | null;
    };
  };
};

export type GraphqlSchemaMapvalue = {
  type: "Query" | "Mutation" | "Subscription";
  path: string;
  line: number;
};

function getGraphqlSchemaMap(introspectionResult: IntrospectionRResult) {
  const schemaMap = new Map<string, GraphqlSchemaMapvalue>();
  const schema = introspectionResult.data.__schema;
  schema.queryType?.fields.forEach((field) => {
    schemaMap.set(field.name, {
      type: "Query",
      path: "",
      line: -1,
    });
  });

  schema.mutationType?.fields.forEach((field) => {
    schemaMap.set(field.name, {
      type: "Mutation",
      path: "",
      line: -1,
    });
  });

  schema.subscriptionType?.fields.forEach((field) => {
    schemaMap.set(field.name, {
      type: "Subscription",
      path: "",
      line: -1,
    });
  });

  return schemaMap;
}

export async function getIntrospectedSchemaFromAPI(graphqlEndpoint: string) {
  const response = await introspectGraphQlSchema(graphqlEndpoint);
  const schemaMap = getGraphqlSchemaMap(response);
  const finalArray = Array.from(schemaMap.entries()).map(([key, value]) => ({
    name: key,
    type: value.type,
    path: value.path,
    line: value.line,
  }));
  return finalArray;
}

// const main = () => {
//   introspectGraphQlSchema()
//     .then((result) => {
//       const schemaMap = getGraphqlSchemaMap(result);
//       const finalArray  =Array.from(schemaMap.entries()).map(([key, value]) => ({
//         name: key,
//         type: value.type,
//         path: value.path,
//         line: value.line,
//       }))
//       console.log(finalArray)
//       console.table(
//         finalArray
//       );

//     })
//     .catch((error) => {
//       console.error("Error in main function:", error);
//     });
// }
// main();
