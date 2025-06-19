import { Partytown } from '@builder.io/partytown/react';
import { join } from 'path-browserify';

export function Head() {
  return (
    <>
      <script
        type="text/partytown"
        src="https://www.googletagmanager.com/gtag/js?id=G-BYFWL5ZFHY"
      ></script>

      <script
        type="text/partytown"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag() {
              dataLayer.push(arguments);
          }
          gtag("js", new Date());
          gtag("config", "G-BYFWL5ZFHY");
          `
        }}
      />

      <Partytown lib={join(import.meta.env.PUBLIC_ENV__BASE_URL ?? '', 'assets/partytown/')} />
    </>
  );
}
