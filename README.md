# APIhandler (restful-api-handler)
APIhandler, in NPM: restful-api-handler, is a simple, lightweight class-based package for making RESTful API requests in JavaScript projects. It provides an easy-to-use interface for sending HTTP requests to an API using JSON. Aimed to have minimum config setup (virtually no required params) and yet powerful.

One of the key features is its "check" method, which tests the connectivity of your application before making any API requests. If the check fails, it will automatically retry the check after a configurable time interval.

Other features of APIhandler includes support for making multiple API requests at once, customizable success and failure callbacks, and more.

## Features

-   Simple interface for making API requests
-   Check method that tests connectivity before making requests and retry-interval after fail
-   Ability to make multiple API requests at once
-   Customizable success and failure callbacks
-   Strong typed and augmented with TypeScript for optimal guidance in your IDE.
-   ~~comes with unit-test Vitest in case you want to fork the project or colab.~~


## Installation

Use the CLI to navigate to the root of your projectfolder and type:
```npm i restful-api-handler```

## Setup
In your main file or component, for example App.vue, import the package and initialize your class instance like so:
```
<script setup lang="ts">
import { onMounted } from  'vue';
import APIHandler from "restful-api-handler";

onMounted(async ()=>{
	const APIconnection = new APIHandler();
	await APIconnection.check();
});
</script>
```
That's it! As you can see it uses a method called "check" to see if the connection is healthy. Run it and see if it's so.

## Basic config & use
### API baseURL
By default the base url for the API server is set to: **window.location.origin  +  '/api'**
However your can change this by your hearts content or even open a second channel if you like, by giving the class some config-object:
```
const APIconnA = new APIHandler({baseURL:"http://somegreatdomain.com/api/v2"}
const APIconnB = new APIhandler({baseURL:"http://localhost:3000"}
```
the baseURL is set as a public global so you can also set or change it trough the instance:
```
const APIconnA = new APIHandler({baseURL:"http://somegreatdomain.com/api/v2"}
// do whatever
APIconnA.baseURL = "http://otherGreatDomain.com/api"
// now you have switched to another server and can do requests here.
```
**Attention: whatever you do, don't suffix your url with a /**
*your IDE will warn you with a type error if you try ending with a slash*

### check request
Not required but recommended, before firing hell to that poor server we like to make sure it is actually there and we have internet to begin with. Another Vue example (ref is a making it a reactive value):
```
let isOk = ref(false)
const APIconnection = new APIHandler();
isOk = await APIconnection.check();
isOk ? notify("yes! Let's start the game") : notify("something wrong dude..");
```
**isOk** will now be eighter **true** or **false** indicating if there is a connection. If it is false, it will try to reconnect.

If you like to dipstick the connection for its ok-state you do like so:
```
await APIconnection.check()
// ... some stuff you like to do
let isStillOk = APIconnection.isOk()
```
In addition, if you like to get fancy, the **succes** or **failed** callbacks are called when using .check(). Here are their properties:
|isOk state |corresponding callback |attempted reconnect?
|--|--|--|
| true | succes()=>{status: "API-ready", response: ""} | no
| false | failed()=>(status: "no-API", err: ""} | no
| false | failed()=>(status: "connection-interupt", err: ""} | no
| true | succes()=>{status: "connection-restored", response: ""} | yes
| false | failed()=>{status: "reconnect-failed", err: ""} | yes

cool huh? as you can tell there is some reconnecting going on. See the reference docs to see how to change the intervaltime.


### endpoint request
Enough prepping. We want to send some request! Here is an example of a bare case scenario:
```
<script setup lang="ts">
import { onMounted } from  'vue';
import APIHandler from "restful-api-handler";

onMounted(async ()=>{
	const APIconnection = new APIHandler();
	await APIconnection
	.check()
	.requestJSON('/allproducts')
		.then((response)=>showProducts(response))
		.catch((err)=>showError("oops, something went wrong", err);	
});
</script>
```
or you could wait the requestJSON out and let the succes or failed callbacks do their job:
```
const APIconnection = new APIHandler({
		succes: (response)=>showProducts(response), 
		failed: ()=>showError("oops, you really did it this time", err)
	});
await APIconnection
.check()
.requestJSON('/allproducts');
```
### multi-request
Sometimes you just want to do a bunch of requests all at the same time. This is best done with **multiRequestJSON()**. You can do this with eighter an array of endpoints or objects.

With endpoints as an array of strings:
```
	const APIconnection = new APIHandler({
		succes: (response)=>showDRI(response), 
		failed: ()=>showError("oops, it's not going so well", err)
	});
  APIconnection.multiRequestJSON(['/DRI_energy', '/DRI_prot', '/DRI_water'])
  .then((responses)=>{
    console.log("multi", responses);
  })  
```
...or with objects in an array allowing options instead:
```
APIconnection.multiRequestJSON([
		{endpoint: '/posts', {method: 'POST', body: "some data to be send"}}, 
		{endpoint: '/DRI_prot'}, 
		{endpoint: '/DRI_water'},
	])
```
### full example
...

## Reference