import { useTranslation } from 'react-i18next';
import { VERSION } from '../../version';

export function Metadata(props: { title?: string; description?: string; imageUrl?: string }) {
  const { t } = useTranslation();
  const title = props.title ?? t('title', { titlePrefix: t('defaultTitlePrefix') });
  const description = props.description ?? t('description');
  const siteName = t('site_name');
  const url = 'https://hamproductions.github.io/llll-chart/';

  return (
    <>
      {/* <link rel="icon" type="image/svg+xml" href="/vite.svg" /> */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />

      <meta property="og:site_name" content={siteName} />

      <link rel="canonical" href={url} />
      <meta property="og:url" content={url} />

      <meta property="og:description" content={description} />
      <meta name="description" content={description} />
      <meta name="twitter:description" content={description} />

      <meta name="version" content={VERSION} />

      {props.imageUrl && (
        <>
          <meta property="og:image" content={props.imageUrl} />
          <meta name="twitter:image" content={props.imageUrl} />
        </>
      )}
    </>
  );
}
