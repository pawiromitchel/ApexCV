import { LinkIcon } from "lucide-react";
import { NotFoundView } from "@/components/NotFoundView";

export default function SharedCvNotFound() {
  return (
    <NotFoundView
      icon={<LinkIcon />}
      title="This CV link isn’t available"
      body="The link may have expired, been turned off by its owner, or been mistyped. Ask the person who sent it for a fresh link."
    />
  );
}
