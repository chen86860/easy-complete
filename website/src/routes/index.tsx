import { createFileRoute } from "@tanstack/react-router";
import { App } from "../App.tsx";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  SeoJsonLd,
  homeSchema,
  pageHead,
} from "../seo.tsx";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      path: "/",
    }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <SeoJsonLd data={homeSchema()} />
      <App />
    </>
  );
}
