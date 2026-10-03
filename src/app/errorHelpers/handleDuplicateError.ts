import { TGenericErrorResponse } from "../interfaces/error.type";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handlerDuplicateError = (err: any): TGenericErrorResponse => {

  const match = err?.message?.match(/dup key.*\{ (.*) \}/);

  let field = "Duplicate value";

  if (match && match[1]) {
    field = match[1];
  }

  return {
    statusCode: 400,
    message: `${field} already exists!!`,
  };
};