# Natours API

The project folder of the **Node.JS** Udemy course with back-end development best practises.
The following technologies were being used throughout the course (only the most important ones):
- Express.JS
- MongoDB with Atlas
- Mongoose

## Start API
- Run development mode: **npm start**
- Run production mode: **npm run start:prod**

## Security best practises (for future projects)

### Compromised database
- For password encryption use **bcrypt** library and a long (~32 characters long) salt
- Password reset token encryption with **SHA-256** and **crypto** library

### Brute force attacks
- Use **bcrypt** for logins (to make login requests slower)
- Implement rate limiting using **express-rate-limit** library
- *Implement maximum login attempts*

### Cross-site scripting (XSS) attacks
- Store JWT in **HTTPOnly** cookies
- Sanitize user input data - **xss-clean**
- Special HTTP headers with **helmet** package

### Denial-of-service (DOS) attacks
- Rate limiting - **express-rate-limit**
- Limit body payload in **body-parser**
- Avoid evil regular expressions

### NoSQL query injection
- Can be very powerful, must defense against it
- Using **mongoose** helps a lot beacuse of SchemaTypes
- Sanitize user input data - **express-mongo-sanitize**

### Other security best practises:

- **Always use HTTPS**
- Create random password reset tokens with **expiry dates**
- **Deny access to JWT after password change**
- Do **NOT** commit sensitize config data to **Git**
- Do **NOT** send error details to clients
- Prevent Cross-Site Request Forgery (**csurf** package)
- Require re-authentication before a high-value action
- Unokenent a blacklist of untrusted JWTs
- Confirm user email address after first creating account
- Keep user logged in with **refresh tokens** instead of JWTs
- Two-factor authentication
- Prevent parameter pollution causing Uncaught Exceptions using **hpp** library
