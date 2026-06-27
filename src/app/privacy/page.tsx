import { LegalPage, getLegalMetadata } from "@/components/LegalPage";

export const generateMetadata = () => getLegalMetadata("privacy");

export default function PrivacyRoute() {
  return <LegalPage kind="privacy" />;
}