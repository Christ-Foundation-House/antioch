// /** @jsxImportSource @emotion/react */
// import { css } from "@emotion/react";
// import Head from "next/head";
// import "antd/dist/antd.css";
// import "antd/dist/reset.css";
import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";

import Router from "next/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { DefaultSeo } from "next-seo";

import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import weekYear from "dayjs/plugin/weekYear";

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);

NProgress.configure({
  showSpinner: false,
});
Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

// import "@/styles/main.css";
// import "@/styles/responsive.css";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import { ToastContainer } from "react-toastify";
import { LayoutMain } from "@/layouts/layoutMain";
import { ConfigProvider } from "antd";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";

import { api } from "@/utils/api";
import SEO from "@/next-seo.config";

function App({ Component, pageProps: { session, ...pageProps } }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
          },
        },
      }),
  );
  return (
    <>
      <ConfigProvider>
        {/* <Head>
          <link
            rel="alternate"
            type="application/rss+xml"
            title="RSS"
            href="/feed.xml"
          />
        </Head> */}
        <DefaultSeo {...SEO} />
        <QueryClientProvider client={queryClient}>
          <Hydrate state={pageProps.dehydratedState}>
            <SessionProvider session={session}>
              <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
              <LayoutMain>
                <Component {...pageProps} />
              </LayoutMain>
            </SessionProvider>
          </Hydrate>
        </QueryClientProvider>
        <Analytics />
      </ConfigProvider>
    </>
  );
}
export default api.withTRPC(App);
