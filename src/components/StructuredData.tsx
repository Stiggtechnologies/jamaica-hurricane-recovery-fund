import { useEffect } from 'react';

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'Article' | 'NewsArticle' | 'Event' | 'DonateAction';
  data?: any;
}

export default function StructuredData({ type, data = {} }: StructuredDataProps) {
  useEffect(() => {
    let structuredData: any = {};

    switch (type) {
      case 'Organization':
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Jamaica Hurricane Recovery Fund',
          alternateName: 'JHRF',
          url: 'https://jamaicahurricanerecoveryfund.org',
          logo: 'https://jamaicahurricanerecoveryfund.org/logo.png',
          description: 'Raising $100 million for hurricane relief and recovery in Jamaica',
          foundingDate: '2024',
          founder: {
            '@type': 'Person',
            name: 'Orville Davis',
          },
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'Canada',
            addressRegion: 'Alberta',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'info@jamaicahurricanefund.org',
            contactType: 'Customer Service',
          },
          sameAs: [
            'https://www.facebook.com/jamaicahurricanefund',
            'https://twitter.com/jhrf_official',
            'https://www.linkedin.com/company/jamaica-hurricane-recovery-fund',
          ],
          ...data,
        };
        break;

      case 'WebSite':
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Jamaica Hurricane Recovery Fund',
          url: 'https://jamaicahurricanerecoveryfund.org',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://jamaicahurricanerecoveryfund.org/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
          ...data,
        };
        break;

      case 'DonateAction':
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'DonateAction',
          recipient: {
            '@type': 'Organization',
            name: 'Jamaica Hurricane Recovery Fund',
          },
          description: 'Support hurricane relief and recovery efforts in Jamaica',
          url: 'https://jamaicahurricanerecoveryfund.org/donate',
          ...data,
        };
        break;

      case 'Article':
      case 'NewsArticle':
        structuredData = {
          '@context': 'https://schema.org',
          '@type': type,
          headline: data.headline || data.title,
          description: data.description,
          image: data.image,
          datePublished: data.datePublished,
          dateModified: data.dateModified || data.datePublished,
          author: {
            '@type': 'Organization',
            name: data.author || 'Jamaica Hurricane Recovery Fund',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Jamaica Hurricane Recovery Fund',
            logo: {
              '@type': 'ImageObject',
              url: 'https://jamaicahurricanerecoveryfund.org/logo.png',
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': data.url,
          },
        };
        break;

      case 'Event':
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: data.name,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          location: data.location,
          organizer: {
            '@type': 'Organization',
            name: 'Jamaica Hurricane Recovery Fund',
            url: 'https://jamaicahurricanerecoveryfund.org',
          },
          ...data,
        };
        break;
    }

    const scriptId = `structured-data-${type}`;
    let scriptElement = document.getElementById(scriptId);

    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = scriptId;
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }

    scriptElement.textContent = JSON.stringify(structuredData);

    return () => {
      const element = document.getElementById(scriptId);
      if (element) {
        element.remove();
      }
    };
  }, [type, data]);

  return null;
}
