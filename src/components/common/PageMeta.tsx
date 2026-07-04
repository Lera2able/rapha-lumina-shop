import { HelmetProvider, Helmet } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";

const SITE_URL = 'https://raphalumina.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/rapha-lumina-logo.png`;

type StructuredData = Record<string, unknown> | Array<Record<string, unknown>>;

interface PageMetaProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogImage?: string;
  robots?: string;
  structuredData?: StructuredData;
}

const PageMeta = ({
  title,
  description,
  canonicalPath,
  ogTitle,
  ogDescription,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  robots = 'index,follow',
  structuredData,
}: PageMetaProps) => {
  const canonicalUrl = canonicalPath
    ? `${SITE_URL}${canonicalPath}`
    : (typeof window !== 'undefined' ? window.location.href : SITE_URL);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content="Rapha Lumina" />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImage} />

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <TooltipProvider>
      {children}
    </TooltipProvider>
  </HelmetProvider>
);

export default PageMeta;
