/** valid url chars without "/" */
type ValidUrlCharNoSlash = `${
  "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z" | 
  "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" | 
  "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "-" | "_" | "." | "!" | "?" | "~" | "#" | "*" | "'" | ";" | ":" | "@" | "&" | "=" | "+" | "$" | 
  "," | "(" | ")" | "[" | "]"}`;
  
  /** baseurl/host for API: scheme + host + basePath */
 export type BaseURL = `${string}${ValidUrlCharNoSlash}`
  
  /** endpoint-URL part of API. Must start with "/". i.e. "/articles" */
 export type Endpoint = `/${string}`
  
  /** config general for the class instance */
 export interface GeneralConfig {
    baseURL?:BaseURL,
    authToken?:string,
    successCallback?:(status:string, response?:any)=>any,
    failedCallback?:(status:string, err?:any)=>any,
  }
  
  /** config optional as request config */
 export interface RequestConfig {                          
    /** method of request. i.e. GET */
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    /** body content of requests like POST, PUT and PATCH */    
    payload?: any
    /** headers of requests as array of strings */
    headers?: HeadersInit
    /** JWT token for authentication */
    authToken?: string
  }
 export interface RequestObj extends RequestConfig {
    /** endpoint of API. Must start with "/". i.e. "/users" */
    endpoint: Endpoint
    options: RequestConfig
  }
  
  
  /** API Handler class */
  export interface APIHandlerInterface {
    /** baseURL is the complete host URL of the API without trailing "/". i.e. http://localhost:3000/api */
    apiURL: string;
    version: number;
    retryTime: number;
    isOk: boolean;
    check: () => Promise<boolean>;
    requestJSON: (endpoint: Endpoint, {}:RequestObj) => Promise<Response | false>;
    multiRequestJSON: (requestURLs: (Endpoint | RequestObj)[]) => Promise<(false | Response)[] | false>;
    success: (status: string, response?: any) => {status: string, response?: any};
    failed: (status: string, err?: any) => {status: string, err?: any};
    warning: (status: string, response?: any) => {status: string, response?: any};
  }