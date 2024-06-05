import type {BaseURL, RequestObj, GeneralConfig, APIHandlerInterface, Endpoint, RequestConfig } from "./types";

/** APIHandler class */
export default class APIHandler implements APIHandlerInterface {
  // definition vars
  private defaultConfig: RequestObj = {
    endpoint: '/',
    options: {
        method: 'GET'
      , headers: {
          'Accept-Charset': 'UTF-8'
        , 'Content-Type': 'application/json'
        , 'Accept': 'application/json'
      }
    }
  }
  public version: number = 1;
  /** how much time between tries to reconnect after a failed connection attempt (in ms) */
  public retryTime: number = 5000;
  /** base url of API that hosts all endpoints */
  public baseURL: BaseURL;
  /** boolean state if online & API is reachable. default: true in case you don't like to use a pre-check */
  public isOk: boolean;
  public apiURL: string;
  /** bearer token for authentication */
  public authToken: string | undefined;
  private intervalID: any;

  /** constructor APIHandler class (initialize vars) */
  constructor(config?:GeneralConfig)  {
    this.baseURL = config?.baseURL || ( window.location.origin + '/api' ) as BaseURL;
    if (config?.authToken) this.authToken = config.authToken;
    if (config?.successCallback) this.success = config.successCallback;
    if (config?.failedCallback) this.failed = config.failedCallback;
    if (config?.defaultConfig) this.defaultConfig = config.defaultConfig;
    this.isOk = true;
    this.apiURL = this.baseURL + this.defaultConfig.endpoint;
  }
  /** A check beforehand if there is a connection and API (root) is available. Needs asynced await te work properly! */
  public check = async ():Promise<boolean> => {
    this.isOk = navigator.onLine;

    if(this.intervalID && navigator.onLine === false) this.failed("reconnect-failed");

    window.addEventListener("offline", (e) => { 
      if(this.isOk !== navigator.onLine) { 
        this.failed("connection-interupt");
        this.intervalID = setInterval(this.check, this.retryTime);
      }
    }, {once: true})

    window.addEventListener("online",  (e) => { 
      if(this.isOk !== navigator.onLine){
        clearInterval(this.intervalID);
        this.success("connection-restored");
        this.check()
      }
    }, {once: true})

    if(navigator.onLine === true){
      await fetch(this.baseURL)
      .then((response)=>{
        this.isOk = response.ok
        this.success("API-ready", response);
      })
      .catch((err)=>{
        this.isOk = false;
        this.failed("no-API", err);
      })
    }
    else {
      this.isOk = false;
    }

    return this.isOk;
  }
  
  /** single API request with endpoint param and (optional) config object */
  public requestJSON = async (
    /** custom endpoint for this API-request. Must start with "/". i.e. "/users" */
    endpoint:Endpoint,
    /** optional config for this API-request. i.e. {method: 'POST', payload: {'title': 'hello world'}, headers: {'Content-Type': 'application/json'} } */
    config?:RequestConfig
    ):Promise<Response | false> => {
    if(this.isOk){
      const authToken = config?.authToken || this.authToken || undefined;
      this.apiURL = this.baseURL + (endpoint || this.defaultConfig.endpoint);
      const options = {
          method: config?.method || this.defaultConfig.options.method,
          body: JSON.stringify(config?.payload),
          headers: new Headers(Object.assign(
            authToken ? { 'Authorization': 'Bearer ' + authToken } : {},
            this.defaultConfig.options.headers,
            config?.headers
          )),
      }
      let response = await fetch(this.apiURL, options);
      if(!response.ok){
        switch(response.status){        
          case 400:
            this.failed("bad-request");
          break;
          case 401:
            this.failed("not-authorized-or-CORS-error");
          break;
          case 403:
            this.failed("forbidden");
          break;
          case 404:
            this.failed("not-found");
          break;
          case 408:
            this.failed("timeout");
          break;
          case 500:
            this.failed("server-error");
          break;
          case 502:
            this.failed("bad-gateway");
          break;
          default:
            this.failed("unusual-error");
          break;
        }
        return false;
      } else if ((options.method === "PUT" || options.method === "DELETE") && (response.status !== 201 && response.status !== 204) ){
        // according to const data = await response.json(); you should respond with 201 or 204 when using "PUT" or "DELETE"
        const data = await response.json();
        this.warning("unexpected-status-code-return", data);
        return data;
      } else {
        const data = await response.json();
        this.success("request-success", data);
        return data;
      }
    } else {
      this.failed("connection-attempt-failed");
      return false
    }
  }
  /** multiple API requests at once. needs an array of request objects or endpoint strings */
  public multiRequestJSON = async (
    /** array of endpoint URL strings */
    requestURLs:(RequestObj | Endpoint)[]
    ):Promise<(false | Response)[] | false> => {
      if(this.isOk){
        const requests = requestURLs.map(async (req) => {
          if (typeof req !== "string") {
            return this.requestJSON(req.endpoint, req.options ?? {});
          } else {
            return this.requestJSON(req);
          }
        });
        return Promise.all(requests);
      } else {
        this.failed("request-failed");
        return false;
      }
  }

  /** callback when succesful */
  public success = (status: string, response?: any) => {
    console.info("success, status: " + status, response);
    return {status, response};
  }

  /** callback when failed */
  public failed = (status: string, err?: any) => {
    console.error("failed, status: " + status, err);
    return {status, err};
  }  
  
  /** callback when behaviour is funky */
  public warning = (status: string, response?: any) => {
    console.warn("warning, status: " + status, response);
    return {status, response}
  }
}

