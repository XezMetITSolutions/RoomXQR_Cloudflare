import OfflineNotice from "../components/OfflineNotice";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <OfflineNotice />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
