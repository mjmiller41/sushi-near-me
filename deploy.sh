#!/bin/bash
source .env
echo "Deploying to: $PROJECT_ID"
DEST="ec2:/mnt/data/$PROJECT_ID"
rsync -avz -e ssh --delete _site/ $DEST &&
ssh ec2 "cd websites/ && docker-compose restart"
