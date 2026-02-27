export const dynamic = "force-dynamic";
export const revalidate = false;
export const fetchCache = "force-no-store";

import HashCallbackClient from "./HashCallbackClient";

export default function Page() {
  return <HashCallbackClient />;
}
