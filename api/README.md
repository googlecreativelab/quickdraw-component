# Quick, Draw Data API

In order to self-host, it's easiest to use Google Cloud Platform. [Create a GCP project](https://console.cloud.google.com/cloud-resource-manager) if do not have one already for your projct.  The following instructions assume you have your GCP Project ID handy.

## Copy the Quick, Draw! data

The bucket contains 191.63 GB of doodles. Assuming multiregional storage, and at the time of writing this, your cost would be ($0.026 * 191.63) = $4.98 per month. Storage and transferring between GCS buckets may vary based on your bucket location (it's free to transfer in the same region, bucket to bucket). [You can find more details here](https://cloud.google.com/storage/pricing#network-pricing).

1. In your GCP Project, go to [Storage > Browser](https://pantheon.corp.google.com/storage/browser) and create a bucket with a unique id of your choosing (leave all other default settings)
2. Go to [Storage > Transfer](https://pantheon.corp.google.com/storage/transfer)
3. Select "Google Cloud Storage bucket" as the source, and enter ```gs://quickdraw-data-complete``` and the Cloud Storage bucket source.  Press continue.
4. Enter ```gs://YOUR_BUCKET_ID``` where ```YOUR_BUCKET_ID``` is the unique id you chose in the first step.  Leave all other default settings and press continue.
5. Leave the default transfer settings to run now, and press "Create". The files will now transfer over.

## Running the API locally

1. Run ```npm install``` in this directory
2. In the root of this API directory, create a ```config.json``` file replacing the values below (```GCS_BUCKET_ID``` is the bucket you created when copying the data over in the above step) :

		{
		  "projectId": "YOUR_PROJECT_ID",
		  "bucketId": "GCS_BUCKET_ID"
		}


**NOTE:** *If you secure your bucket to certain roles, you can add your service account credential key in this config file by adding:* ```"keyFilename": "./PATH_TO_SERVICE_ACCOUNT_KEY"```


You can now run ```npm start``` and the server should run locally on your machine at ```http://localhost:8080```.  You can then try sending a request using the instructions below.


## Send a request

Choose your local or production server:

```
# If you're running locally, you won't need an API key.
$ export ENDPOINTS_HOST=http://localhost:8080

$ export ENDPOINTS_HOST=https://YOUR_PROJECT_ID.appspot.com
$ export ENDPOINTS_KEY=AIza...
```

Send the request:

```
$ curl -vv -H 'Content-Type: application/json' "${ENDPOINTS_HOST}/drawing/cat/count?key=${ENDPOINTS_KEY}"
```

If you're running locally, you won't need an API key.

## Deploying the API

1. You will need to make sure you have Python 2.7.x installed as well as the [Google Cloud SDK](https://cloud.google.com/sdk/install) on your local machine.

1. Change ```__app.yaml``` to ```app.yaml``` and inside the file, update ```name: YOUR_PROJECT_ID.appspot.com``` replacing  ```YOUR_PROJECT_ID``` with the ID of the project you created in GCP where the files live.

2. Change ```__openapi-appengine.yaml``` to ```openapi-appengine.yaml``` and inside the file, update ```host: "YOUR_PROJECT_ID.appspot.com"``` replacing  ```YOUR_PROJECT_ID``` with the same project ID.

3. Run ```npm run deploy-spec``` to deploy your API definition file

4. Run ```npm run deploy``` to deploy your application code

## License

The component & API fall under the Apache 2.0 license.

This data is made available by Google, Inc. under the [Creative Commons Attribution 4.0 International license.](https://creativecommons.org/licenses/by/4.0/)