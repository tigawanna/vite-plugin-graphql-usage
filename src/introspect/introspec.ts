import { getIntrospectedSchemaFromAPI } from "./introspect-api.js";
import { getIntrospectedSchemaFromSDL } from "./introspect-sdl.js";
import type { SchemaSource } from "../types.js";

export async function introspectSchema(schemaSource:SchemaSource) {
    if(schemaSource.sdlPath) {
        return await getIntrospectedSchemaFromSDL(schemaSource.sdlPath);
    }
    if(schemaSource.endpoint) {
        return await getIntrospectedSchemaFromAPI(schemaSource.endpoint);
    }
}
