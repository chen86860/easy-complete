import { createFileRoute } from "@tanstack/react-router";
import { App } from "../App.tsx";
import { faqs } from "../data.ts";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  SeoJsonLd,
  faqSchema,
  homeSchema,
  pageHead,
} from "../seo.tsx";

const ALTERNATES = [
  { locale: "en" as const, path: "/" },
  { locale: "zh-CN" as const, path: "/zh" },
];

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      path: "/",
      locale: "en",
      alternates: ALTERNATES,
    }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <SeoJsonLd data={homeSchema()} />
      <SeoJsonLd data={faqSchema(faqs)} />
      <App hrefs={{ en: "/", "zh-CN": "/zh" }} />
    </>
  );
}
