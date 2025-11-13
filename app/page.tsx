import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Home() {
  const { data, error } = await supabase.from("posts").select("*");
  console.log(data, error);

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold">Hello Headless CMS</h1>
      <p>Supabase接続テスト完了！</p>

      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">管理画面</h1>
        <Button className="bg-blue-500 hover:bg-blue-700"> 新規作成</Button>
      </div>
    </main>
  );
}
