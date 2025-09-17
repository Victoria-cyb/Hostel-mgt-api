import { GraphQLError } from "graphql"; 
import type { GraphQLErrorExtensions } from "graphql";


export class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

export const handleGqlError = ({
  error,
  extensions = null,
  errMsg,
}: {
  error: unknown;
  extensions?: string | null;
  errMsg?: string;
}) => {
  const ext: GraphQLErrorExtensions = {};

  const message = formatError(error, errMsg);

  if (extensions) {
    ext.extensions = {
      code: extensions,
    };
  }

  throw new GraphQLError(message, ext);
};

export const formatError = (error: unknown, errMsg?: string) => {
  if (
    error instanceof CustomError 
  ) {
    console.error(`[Error]: ${error.message}`);
    return error.message;
  }
  console.error(errMsg ?? `[Error]: ${error}`, { error });
  return "Something went wrong";
};
