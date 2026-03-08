import { sanityClient } from './client';

// Fetch hero video URL
export async function getHeroVideo(): Promise<string | null> {
  const result = await sanityClient.fetch(
    `*[_type == "siteSettings" && _id == "siteSettings"][0]{
      "heroVideoUrl": heroVideo.asset->url
    }`
  );
  return result?.heroVideoUrl || null;
}

// Fetch all site settings
export async function getSiteSettings() {
  return sanityClient.fetch(
    `*[_type == "siteSettings" && _id == "siteSettings"][0]{
      heroVideo,
      "heroVideoUrl": heroVideo.asset->url,
      heroOverlayOpacity,
      heroHeadline,
      heroSubheadline
    }`
  );
}
