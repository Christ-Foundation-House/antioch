/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
// import { Html, Head, Main, NextScript } from "next/document";
import Document, { Head, Html, Main, NextScript } from "next/document";
import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import type { DocumentContext } from "next/document";

("next-auth/react");

const background = [
  `background-image: radial-gradient(circle,#1c1b36,#1e2041,#1f244d,#1f2a59,#1c2f66,#1a2f68,#172f6b,#142f6d,#142a65,#14255e,#132156,#121c4f);`,
  `background-image: radial-gradient(circle, #000000, #000000, #000000, #000000, #000000, #000000, #000000, #000000, #000000, #000000, #000000, #000000);`,
  `background-image: linear-gradient(to left bottom, #000000, #080003, #0d000a, #0e0012, #0b0218, #0b0218, #0b0218, #0b0218, #0e0012, #0d000a, #080003, #000000);`,
  `background-image: linear-gradient(to left bottom, #0f0f0f, #141417, #17181d, #181c24, #19212b, #19212b, #19212b, #19212b, #181c24, #17181d, #141417, #0f0f0f);`,
];

function MyDocument() {
  // const meta = {
  //   title: "WICF",
  //   description: "Wuhan ICF",
  //   image: "/favicon.png",
  // };

  return (
    <Html lang="en">
      <Head></Head>
      <body
        css={css`
          ${background[3]};
          // padding: 0px 20px;
          min-height: 100vh;
          height: fit-content;
          background-repeat: no-repeat;
          background-attachment: fixed;
          background-size: cover;
          position: relative;
        `}
      >
        {" "}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const cache = createCache();
  const originalRenderPage = ctx.renderPage;
  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => {
        const EnhancedApp = (props) => (
          <StyleProvider cache={cache}>
            <App {...props} />
          </StyleProvider>
        );
        EnhancedApp.displayName = "EnhancedApp";
        return EnhancedApp;
      },
    });

  const initialProps = await Document.getInitialProps(ctx);
  const style = extractStyle(cache, true);
  return {
    ...initialProps,
    styles: (
      <>
        {initialProps.styles}
        <style dangerouslySetInnerHTML={{ __html: style }} />
      </>
    ),
  };
};

export default MyDocument;
