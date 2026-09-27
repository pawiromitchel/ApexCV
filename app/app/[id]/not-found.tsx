import { FileQuestion } from "lucide-react";
import { NotFoundView } from "@/components/NotFoundView";

export default function EditorNotFound() {
  return (
    <NotFoundView
      icon={<FileQuestion />}
      title="We can’t find that CV"
      body="It may have been deleted, or it belongs to a different browser or device. CVs are tied to the browser they were made in."
    />
  );
}
