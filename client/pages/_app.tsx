import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider, ColorModeProvider, theme } from "@chakra-ui/react";
import { createClient, Provider } from "urql";

const client = createClient({
  url: "http://localhost:5000/graphql/",
  fetchOptions: {
    credentials: "include",
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <ChakraProvider theme={theme}>
        <ColorModeProvider>
          <Component {...pageProps} />
        </ColorModeProvider>
      </ChakraProvider>
    </Provider>
  );
}
