import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { initDB } from "../lib/db";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" },
      { title: "BellaDonna Studio GO" },
      { name: "description", content: "BellaDonna Studio GO — Seu momento de beleza, do seu jeito. Agendamento online prático para pedicure, manicure, corte, sobrancelhas e muito mais." },
      { name: "author", content: "BellaDonna Studio GO" },
      { property: "og:title", content: "BellaDonna Studio GO" },
      { property: "og:description", content: "BellaDonna Studio GO — Seu momento de beleza, do seu jeito. Agendamento online prático para pedicure, manicure, corte, sobrancelhas e muito mais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@belladonnastudiogo" },
      { name: "twitter:title", content: "BellaDonna Studio GO" },
      { name: "twitter:description", content: "BellaDonna Studio GO — Seu momento de beleza, do seu jeito. Agendamento online prático para pedicure, manicure, corte, sobrancelhas e muito mais." },
      { property: "og:image", content: "https://belladonnastudiogo.netlify.app/og_image.png?v=6" },
      { name: "twitter:image", content: "https://belladonnastudiogo.netlify.app/og_image.png?v=6" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "BellaDonna Studio GO" },
      { name: "theme-color", content: "#09090b" },
      { name: "keywords", content: "salão de beleza, manicure, pedicure, sobrancelha, progressiva, cabelo feminino, agendamento online, belladonna, belladonnastudiogo" },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/og_image.png?v=6",
      },
      {
        rel: "apple-touch-icon",
        href: "https://belladonnastudiogo.netlify.app/og_image.png?v=6",
      },
      {
        rel: "canonical",
        href: "https://belladonnastudiogo.netlify.app",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HairSalon",
          "name": "BellaDonna Studio GO",
          "image": "https://belladonnastudiogo.netlify.app/og_image.png?v=6",
          "url": "https://belladonnastudiogo.netlify.app",
          "telephone": "+5562999999999",
          "priceRange": "$$",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Goiânia",
            "addressRegion": "GO",
            "addressCountry": "BR"
          },
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "06:00",
            "closes": "22:00"
          }
        })
      }
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tenant = params.get("t") || params.get("barberia");
      if (tenant) {
        window.localStorage.setItem("mbg_client_tenant", tenant);
      }
    }
    initDB();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
