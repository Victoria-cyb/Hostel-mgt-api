import { readFileSync, readdirSync } from "node:fs";
import path from "path";

export function readGqlSchemas() {
  const file_path = "../../../graphql";

  const folder_path = path.join(__dirname, file_path);

  const types = readdirSync(folder_path).map((file_name) => {
    return readFileSync(path.join(folder_path, file_name), {
      encoding: "utf-8",
    });
  });

  return types;
}
