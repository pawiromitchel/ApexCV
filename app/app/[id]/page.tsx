import React from "react";
import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import { getOwnedResume } from "@/lib/db";
import { CvEditor } from "@/components/editor/CvEditor";
import { DEVICE_ID_COOKIE, isValidDeviceId } from "@/lib/deviceAuth";

interface PageProps {
  params: { id: string };
}

export const dynamic = "force-dynamic";

export default function CvEditorPage({ params }: PageProps) {
  const cookieDeviceId = cookies().get(DEVICE_ID_COOKIE)?.value;
  const deviceId = isValidDeviceId(cookieDeviceId) ? cookieDeviceId : headers().get("x-device-id");

  // Only the owning device can open the editor; anything else is indistinguishable from a missing CV
  const resume = isValidDeviceId(deviceId) ? getOwnedResume(params.id, deviceId) : null;
  if (!resume) {
    notFound();
  }

  return <CvEditor initialData={resume} />;
}
