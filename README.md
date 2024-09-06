# Vidsphere Backend

The backend API for the Vidsphere project, a video-sharing platform. This repository contains the server-side code, built with Node.js, Express.js, and MongoDB, providing RESTful endpoints for managing user accounts, videos, comments, and likes.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Register, login, and logout functionality with JWT-based authentication.
- **Video Management**: Upload, update, delete, and retrieve videos.
- **Commenting System**: Add, edit, delete, and view comments on videos.
- **Like and Dislike Videos**: Users can like or dislike videos.
- **User Profiles**: View and edit user profiles.
- **Secure and Scalable**: Built with best practices for security and scalability.

## Tech Stack

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing user data, video details, and comments.
- **Mongoose**: ODM for MongoDB.
- **JWT**: JSON Web Tokens for secure user authentication.
- **Multer**: Middleware for handling `multipart/form-data` for file uploads.

## Installation

Follow these steps to set up the project locally:

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/vidsphere-backend.git
    cd vidsphere-backend
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Set up MongoDB:**

    Make sure you have a running instance of MongoDB. You can use a local MongoDB instance or a service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

4. **Configure environment variables:**

    Create a `.env` file in the root directory and add the following variables:

    ```bash
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    ```

5. **Run the server:**

    ```bash
    npm start
    ```

    The server should now be running on `http://localhost:5000`.

## Environment Variables

Make sure to configure the following environment variables in your `.env` file:

- `PORT`: Port number for the server (default is 5000).
- `MONGO_URI`: Connection string for the MongoDB database.
- `JWT_SECRET`: Secret key for signing JWT tokens.

## Usage

After setting up the backend, you can use tools like [Postman](https://www.postman.com/) or [cURL](https://curl.se/) to interact with the API. You can also connect the backend with the [Vidsphere Frontend](https://github.com/your-username/vidsphere-frontend) to see the full application in action.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit them (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
