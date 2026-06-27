import { LegalPage, getLegalMetadata } from "@/components/LegalPage";

export const generateMetadata = () => getLegalMetadata("contact");

export default function ContactRoute() {
  return <LegalPage kind="contact" />;
}