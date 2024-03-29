import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";
const supabase = createClient<Database>(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_KEY ?? ""
);

export const getTopSlugsByCount = async (): Promise<{ slug: string }[]> => {
  const { data, error } = await supabase
    .from("views")
    .select("slug,count")
    .order("count", { ascending: false })
    .limit(5);

  return data as { slug: string }[];
};

///
const getViews = async (slug: string): Promise<number> => {
  const { data: views, error } = await supabase
    .from("views")
    .select(`count`)
    .match({ slug: slug })
    .single();

  if (error && error.details.includes(`0 rows`)) {
    const { data } = await supabase
      .from(`views`)
      .insert({ slug: slug, count: 1 }, { count: `planned` })
      .returns()
      .single();

    return (data as { count: number })?.count ?? 0;
  }
  return views?.count ?? 0;
};
///
const registerView = async (slug: string): Promise<void> => {
  await supabase.rpc("increment", {
    slug_text: slug,
  });
};

export { getViews, registerView };
