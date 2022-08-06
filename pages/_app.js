import "../styles/globals.css";
import { ErrorBoundary } from "react-error-boundary";

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorPage}>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}
import { ErrorPage } from "../components/ErrorPage";

export default MyApp;
