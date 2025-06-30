# Use the latest Node.js image as the base image
FROM node:22.14.0

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN yarn

# Copy the rest of the application code
COPY . .

# prisma cli
RUN npx prisma

# Update the database schema
RUN npx prisma db pull

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN yarn build

# Expose the port the app runs on
EXPOSE 7877

# Start the application
CMD ["yarn", "start"]