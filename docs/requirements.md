# TaskFlow Requirements

## Product goal

TaskFlow is a responsive task management application that allows registered
users to securely create, organize, search, update, and delete their own tasks.

The application must prioritize correctness, security, maintainability,
testability, and clear user feedback.

## Core acceptance criteria

| ID      | Requirement          | Acceptance criteria                                                                                                    | Verification                            |
| ------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| AUTH-01 | Registration         | A visitor can register using a valid name, email, and password. The email must be unique.                              | API integration test and manual UI test |
| AUTH-02 | Login                | A registered user can log in using valid credentials. Invalid credentials produce a clear generic error.               | API integration test and manual UI test |
| AUTH-03 | JWT authentication   | Successful registration or login creates a JWT-based authenticated session.                                            | API integration test                    |
| AUTH-04 | Protected endpoints  | Requests without a valid session cannot access task endpoints.                                                         | API integration test                    |
| AUTH-05 | Logout               | An authenticated user can log out, after which the previous browser session can no longer access protected endpoints.  | API integration test and manual UI test |
| AUTH-06 | Session restoration  | Refreshing the browser restores a valid authenticated session without requiring another login.                         | API integration test and manual UI test |
| OWN-01  | Task ownership       | Every created task is assigned to the authenticated user, and a user can only list, update, and delete tasks they own. | Cross-user API integration test         |
| TASK-01 | Create task          | An authenticated user can create a valid task containing every required field.                                         | API integration test and UI test        |
| TASK-02 | Update task          | An authenticated owner can update one or more fields on a task.                                                        | API integration test and UI test        |
| TASK-03 | Delete task          | An authenticated owner can permanently delete a task after confirmation.                                               | API integration test and UI test        |
| TASK-04 | Required fields      | A task requires title, description, status, priority, and due date.                                                    | Validation tests                        |
| TASK-05 | Status values        | Only `todo`, `in-progress`, and `done` are accepted.                                                                   | Validation tests                        |
| TASK-06 | Priority values      | Only `low`, `medium`, and `high` are accepted.                                                                         | Validation tests                        |
| LIST-01 | Title search         | A user can perform case-insensitive partial-title searches over their own tasks.                                       | API integration test and UI test        |
| LIST-02 | Status filter        | A user can filter their own tasks by status.                                                                           | API integration test and UI test        |
| LIST-03 | Priority filter      | A user can filter their own tasks by priority.                                                                         | API integration test and UI test        |
| LIST-04 | Combined queries     | Search, status, and priority filters can be applied together.                                                          | API integration test                    |
| UX-01   | Responsive interface | All core workflows work on desktop and mobile layouts.                                                                 | Manual responsive test                  |
| UX-02   | Loading feedback     | Initial loading and data mutations display clear progress feedback.                                                    | Manual UI test                          |
| UX-03   | Error feedback       | Expected API failures produce understandable messages.                                                                 | Manual and automated tests              |
| UX-04   | Empty states         | The interface distinguishes between no tasks and no matching filtered tasks.                                           | UI test                                 |
| UX-05   | Validation feedback  | Invalid form fields display field-specific messages.                                                                   | UI and validation tests                 |
| SEC-01  | Password security    | Passwords are hashed with bcrypt and never returned by the API.                                                        | API integration test                    |
| SEC-02  | Backend validation   | Request bodies, parameters, and query strings are validated before business logic executes.                            | API tests                               |
| SEC-03  | Secret protection    | Secrets are stored in environment variables and excluded from Git.                                                     | Repository inspection                   |
| DOC-01  | Setup documentation  | A reviewer can run the project from a clean clone using the README.                                                    | Clean-install test                      |
| DOC-02  | Environment template | `.env.example` lists every required variable without real values.                                                      | Repository inspection                   |

## Product decisions

### Registration

- Name, email, and password are required.
- Emails are trimmed and normalized to lowercase.
- Passwords must contain 8–72 characters.
- Passwords must include uppercase, lowercase, and numeric characters.
- Duplicate emails return HTTP 409.
- Login errors do not reveal whether an email exists.

### Tasks

- Title is required and limited to 100 characters.
- Description is required and limited to 1000 characters.
- Status is required.
- Priority is required.
- Due date is required.
- Past due dates are allowed so overdue tasks can be represented.
- Deletion is permanent and requires UI confirmation.
- Task updates are partial; only supplied fields are changed.

### Task listing

- Search matches any case-insensitive part of the title.
- Search and filters use AND behavior when combined.
- Results are ordered by due date ascending by default.
- Pagination uses 12 tasks per page by default.
- The maximum API page size is 100.
- A task belonging to another user is returned as not found rather than forbidden,
  preventing the API from confirming that the task exists.

### Authentication

- The JWT contains only the user identifier and standard token claims.
- The JWT expires after one day.
- The browser receives the JWT through an httpOnly cookie.
- Production cookies require HTTPS.
- Expired sessions return HTTP 401 and send the user to the login page.
- Refresh tokens are outside the assessment scope.

## Planned bonus features

The following bonuses are planned in priority order:

1. TypeScript across the frontend and backend.
2. API integration tests.
3. Pagination.
4. Docker and Docker Compose.
5. Drag and drop between task statuses.
6. Focused frontend tests.
7. A deployed live version.

Task attachments are intentionally deferred unless all other work is complete.

## Out of scope

The following features will not be implemented unless the required and planned
bonus features are complete:

- Password reset
- Email verification
- Social login
- User roles and permissions
- Team workspaces
- Task sharing
- Recurring tasks
- Comments
- Notifications
- Offline support
- Real-time synchronization
- Task attachments
- Refresh-token rotation

## Definition of done

The project is complete when:

- Every core acceptance criterion is implemented.
- All backend request inputs are validated.
- Automated tests prove that users cannot access each other's tasks.
- Linting and TypeScript type checking pass.
- Automated tests pass.
- The production build succeeds.
- Core workflows have been tested at mobile and desktop sizes.
- The application works from a clean clone.
- No secrets exist in the repository or Git history.
- GitHub Actions passes.
- The live application works in a private browser session.
- The README includes setup, architecture, endpoints, environment variables,
  implemented features, bonus features, known issues, test credentials, actual
  time spent, and AI-use disclosure.
