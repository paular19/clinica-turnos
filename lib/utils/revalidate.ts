import { revalidatePath } from "next/cache";

export async function revalidatePaths(paths: string[]) {
  try {
    for (const p of paths) {
      // revalidatePath is synchronous in app-router environment, but keep try/catch
      revalidatePath(p);
    }
  } catch (err) {
    console.error("Failed to revalidate paths", err);
  }
}
