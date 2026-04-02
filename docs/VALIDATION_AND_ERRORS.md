# Validation and Error Strategy

## Validation
- Validate `body`, `params`, and `query` with Zod schemas.
- Reject unknown or malformed values with `400`.
- Domain rules checked in service layer (e.g., inactive user modification attempts).

## Error Classes
- `ValidationError` -> `400`
- `AuthenticationError` -> `401`
- `AuthorizationError` -> `403`
- `NotFoundError` -> `404`
- `ConflictError` -> `409`
- `DomainError` -> `422`
- fallback -> `500`

## Error Response Shape
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not allowed to perform this action",
    "details": []
  }
}

## Logging
- Log structured errors with requestId, route, actorId.
- Never log passwords or tokens.
