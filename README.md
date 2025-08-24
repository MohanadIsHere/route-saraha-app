
# Route Saraha App

A secure and scalable anonymous messaging platform built with Node.js, Express, MongoDB, and JWT authentication.

## Features

- User Authentication & Authorization (JWT, Refresh Tokens)
- Anonymous Messaging System
- Cloudinary for Media Storage
- Robust Validation with Joi
- Rate Limiting & Helmet for Security
- Email Notifications with Nodemailer
- Google OAuth Support
- Modular & Scalable Architecture

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **Validation**: Joi
- **Cloud & Storage**: Cloudinary, Multer
- **Security**: Helmet, Rate Limiter
- **Environment Management**: dotenv

## Project Structure

```
route-saraha-app/
├── app.js                # Main app entry point
├── src/
│   ├── server.js         # Server configuration
│   ├── config/           # Environment variables
│   ├── db/               # Database connection and models
│   ├── middlewares/      # Authentication & validation middlewares
│   ├── modules/
│   │   ├── auth/         # Auth controllers, services, validation
│   │   ├── user/         # User management
│   │   ├── messages/     # Messaging logic
├── .env                  # Environment variables
├── package.json          # Dependencies & scripts
```

## Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/route-saraha-app.git
cd route-saraha-app
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables  
Create a `.env` file in the root directory and configure:

```
DB_URI
NODE_ENV
PORT=3000
JWT_ACCESS_TOKEN_SECRET
JWT_ACCESS_TOKEN_SECRET_ADMIN
JWT_REFRESH_TOKEN_SECRET
JWT_EXPIRES_IN
JWT_REFRESH_TOKEN_EXPIRES_IN
ENCRYPTION_KEY
ENCRYPTION_KEY_ADMIN
EMAIL
PASSWORD
SALT_ROUNDS
GOOGLE_CLIENT_SECRET
GOOGLE_CLIENT_ID
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

4. Run the app
```bash
npm run dev
```
or
```bash
npm start
```

## API Endpoints (Sample)

### Auth
- **POST** `/auth/register` - Create account
- **POST** `/auth/login` - Login & get token

### Messages
- **POST** `/messages` - Send anonymous message
- **GET** `/messages` - Get messages for a user

👉 [Full API Documentation on Postman](https://documenter.getpostman.com/view/37358976/2sB3HetNeK)

## Contributing

1. Fork the repo
2. Create a feature branch
3. Submit a pull request
4. Give it a star 🥹 !
