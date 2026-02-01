import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/**
 * This file is web-only and used to configure the root HTML for every web page during static rendering.
 * The contents of this function only run in Node.js environments and do not have access to the DOM or browser APIs.
 */
export default function Root({ children }: PropsWithChildren) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />

                {/* PWA Meta Tags */}
                <meta name="theme-color" content="#6366f1" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="mobile-web-app-capable" content="yes" />

                {/* PWA Manifest */}
                <link rel="manifest" href="/manifest.json" />

                {/* Inline script to apply dark mode before React hydrates to prevent flash */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('color-scheme');
                  if (stored === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (stored === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
                    }}
                />

                {/* Prevent overscroll/bounce on iOS */}
                <ScrollViewStyleReset />
            </head>
            <body>{children}</body>
        </html>
    );
}
