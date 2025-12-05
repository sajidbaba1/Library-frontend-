# LibraMinds Backend

## Configuration

This application uses environment variables for database configuration to ensure security.

### Required Environment Variables

You must set the following environment variables before running the application:

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | JDBC URL for PostgreSQL | `jdbc:postgresql://ep-sweet-bonus-adfmuvqv-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `DB_USERNAME` | Database username | `neondb_owner` |
| `DB_PASSWORD` | Database password | `your_password_here` |

### Running Locally

You can run the application with Maven by passing the variables:

```bash
DB_URL="jdbc:postgresql://ep-sweet-bonus-adfmuvqv-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" \
DB_USERNAME="neondb_owner" \
DB_PASSWORD="your_password_here" \
mvn spring-boot:run
```

Or when running tests:

```bash
DB_URL="jdbc:postgresql://ep-sweet-bonus-adfmuvqv-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" \
DB_USERNAME="neondb_owner" \
DB_PASSWORD="your_password_here" \
mvn clean install
```

## Deployment on Render

This project includes a `render.yaml` file for easy deployment as a Blueprint on [Render](https://render.com/).

1.  Push this code to a GitHub/GitLab repository.
2.  Log in to Render and create a new **Blueprint**.
3.  Connect your repository.
4.  Render will detect the `render.yaml`.
5.  You will be prompted to enter the values for `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`. Use the credentials provided for your Neon database.
6.  Click **Apply** to deploy.

Alternatively, you can manually create a **Web Service**:
- **Runtime:** Docker
- **Build Context:** `.` (Root directory) or `backend` (if you point directly there, adjust path) -> *Note: The `render.yaml` sets `dockerContext` to `./backend`.*
- **Dockerfile Path:** `./backend/Dockerfile`
- **Environment Variables:** Add `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` manually.
