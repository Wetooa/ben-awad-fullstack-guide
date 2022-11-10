import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:5000/graphql",
  documents: "./graphql/**/*.graphql",
  generates: {
    "./generated/graphql.tsx": {
      plugins: ["typescript", "typescript-urql"],
    },
  },
};

export default config;
