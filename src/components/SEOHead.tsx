import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  canonical?: string;
}

export default function SEOHead({
  title = 'Jamaica Hurricane Recovery Fund - Rebuilding Stronger Together',
  description = 'Join us in raising $100 million for hurricane relief and recovery in Jamaica. Support immediate relief, long-term recovery, and climate-resilient rebuilding.',
  keywords = 'Jamaica, hurricane recovery, disaster relief, climate resilience, Caribbean aid, donate Jamaica, hurricane relief fund, rebuild Jamaica, disaster response',
  image = 'https://jamaicahurricanerecoveryfund.org/og-image.jpg',
  url = 'https://jamaicahurricanerecoveryfund.org',
  type = 'website',
  canonical,
}: SEOHeadProps) {
  useEffect(() => {
    document.title = title;

    const updateMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', image, 'property');
    updateMetaTag('og:url', url, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', 'Jamaica Hurricane Recovery Fund', 'property');

    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:title', title, 'name');
    updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:image', image, 'name');

    let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!linkElement) {
      linkElement = document.createElement('link');
      linkElement.rel = 'canonical';
      document.head.appendChild(linkElement);
    }
    linkElement.href = canonical || url;
  }, [title, description, keywords, image, url, type, canonical]);

  return null;
}
