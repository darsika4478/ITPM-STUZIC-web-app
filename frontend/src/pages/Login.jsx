import BaseLayout from "../layout/BaseLayout";

export default function Login() {
  return (
    <BaseLayout>
      <h1>Login</h1>
      <p style={{ color: "var(--c-accent)" }}>
        Temporary login page (Firebase will be added later).
      </p>
    </BaseLayout>
  );
}