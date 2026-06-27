import { LegalPage, getLegalMetadata } from "@/components/LegalPage";

export const generateMetadata = () => getLegalMetadata("terms");

export default function TermsRoute() {
  return <LegalPage kind="terms" />;
}