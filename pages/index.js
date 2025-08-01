import Head from 'next/head';
import TeraboxDownloader from '../components/TeraboxDownloader';

export default function Home() {
  return (
    <>
      <Head>
        <title>Terabox Downloader - Free Direct Download Links</title>
        <meta name="description" content="Get direct download links from Terabox sharing URLs instantly" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TeraboxDownloader />
    </>
  );
}