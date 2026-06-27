import { LegalPage, getLegalMetadata } from "@/components/LegalPage";

export const generateMetadata = () => getLegalMetadata("about");

export default function AboutRoute() {
  return <LegalPage kind="about" />;
}