export interface IConfig {
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
}

export const enum EMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export interface IHeaders {
  [header: string]: string | number;
}

export type TQueryMap = Map<string, string>

export const queryString = (query: TQueryMap) =>
  Array.from(query)
    .map(q => encodeURIComponent(q[0]) + "=" + encodeURIComponent(q[1]))
    .join("&")

export const datePad = (n: number) => (n + "").padStart(2, "0")
