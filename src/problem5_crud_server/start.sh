#!/bin/sh
echo "Running Prisma generate..."
yarn db:generate

echo "Migrating..."
yarn db:migrate

echo "Seeding..."
yarn db:seed

echo "Starting application..."
yarn start
