# HTTP API tests

These request files use the VS Code REST Client extension to exercise the backend over HTTP.

1. Start MongoDB and run the backend with `npm start` from `Backend`.
2. Open `tests/auth.http` or `tests/categories.http`.
3. Send each request from top to bottom. The request names capture the registration response token and category ID for later requests.

The `Authorization: Bearer ...` header is required for protected endpoints. `Bearer` tells the backend that the captured value is a JWT token. Header order does not matter; the files place `Content-Type` first when both headers are needed for readability.

The test users use fixed email addresses. If a user already exists, delete it from MongoDB before running the registration request again.