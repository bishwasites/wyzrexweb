import { ExternalLinkIcon, FacebookIcon, InstagramIcon, LinkedInIcon, TikTokIcon, YouTubeIcon } from "@/components/site/Icons";
import type { SocialLink } from "@/lib/site";

export const SOCIAL_ICON_MAP: Record<SocialLink["name"], (props: { className?: string }) => React.JSX.Element> = {
  Instagram: InstagramIcon,
  LinkedIn: LinkedInIcon,
  Facebook: FacebookIcon,
  YouTube: YouTubeIcon,
  TikTok: TikTokIcon,
};

/**
 * Same lookup, but for the `socials` CMS table, where `platform` is a free
 * text field (an editor can type any network name) rather than the fixed
 * union above. Falls back to a generic link glyph for anything unrecognised
 * instead of crashing on a platform the icon map doesn't know.
 */
export function getSocialIcon(platform: string): (props: { className?: string }) => React.JSX.Element {
  const key = Object.keys(SOCIAL_ICON_MAP).find((k) => k.toLowerCase() === platform.trim().toLowerCase());
  return key ? SOCIAL_ICON_MAP[key as SocialLink["name"]] : ExternalLinkIcon;
}
