import { defineConfig } from "drizzle-kit";
 
export default defineConfig({
  schema: "./configs/schema.js",
  out: "./drizzle",
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://AI-Form-Builder_owner:kzgP7B5JCoTV@ep-small-leaf-a5gwiqnt.us-east-2.aws.neon.tech/AI-Form-Builder?sslmode=require',
  }
});