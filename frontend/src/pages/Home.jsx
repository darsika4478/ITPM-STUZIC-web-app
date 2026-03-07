import BaseLayout from "../layout/BaseLayout";

export default function Home() {
  return (
    <BaseLayout>
      <h1>Home Page</h1>
      <p style={{ color: "var(--c-accent)" }}>
        Your theme + header/footer are working.
      </p>
    </BaseLayout>
  );
}