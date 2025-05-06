# gallery-app

## Commands
### Bucket creation
- gcloud storage buckets create gs://imgs-public --location=europe-west1
- gcloud storage buckets create gs://images-depot --location=eu

### Deploy functions
- gcloud functions deploy enregistrement-2 --region=us-central1 --runtime=nodejs22 --trigger-bucket=images-depot --trigger-location=eu --entry-point=helloGCS --source=.
- gcloud functions deploy analyse --region=us-central1 --runtime=nodejs22 --trigger-bucket=imgs-public --trigger-location=europe-west1 --entry-point=analyse --source=. 

#### Command utilisé pour deployer avec les variables d'environment
- gcloud functions deploy enregistrement-2 --region=us-central1 --runtime=nodejs22 --trigger-bucket=images-depot --trigger-location=eu --entry-point=helloGCS --source=. --set-env-vars DB_USER=XXXX-user --set-env-vars DB_PASSWORD=XXXX --set-env-vars DB_NAME=XXXX --set-env-vars DB_SOCKET_PATH=/cloudsql/i-XXXXX-454811-u7:europe-west1:photo-XXXXXX

### DB Creation
- API activation in GCP console
- gcloud sql instances create photo-gallery --database-version=MYSQL_8_0_40
- gcloud sql databases create photos --instance=photo-gallery --charset=utf8mb4  

