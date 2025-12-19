// // app/hdcp/[code]/page.tsx
// import { createClient } from "@/lib/supabase/server";
// import { notFound } from "next/navigation";

// type Props = {
//   params: {
//     code: string;
//   };
// };

// export default async function HdcpPublicPage({ params }: Props) {
//   const supabase = await createClient();
//   const code = params.code;

//   // ① code → golf_course_id を取得
//   const { data: course, error: courseError } = await supabase
//     .from("golf_courses")
//     .select("id, name")
//     .eq("code", code)
//     .single();

//   if (courseError || !course) {
//     notFound();
//   }

//   // ② golf_course_id で HDCP 公開データ取得
//   const { data: scores, error: scoresError } = await supabase
//     .from("hdcp_scores_public")
//     .select("id, player_name, hdcp")
//     .eq("golf_course_id", course.id)
//     .order("player_name", { ascending: true });

//   if (scoresError) {
//     return <p>Error: {scoresError.message}</p>;
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">
//         {course.name} HDCP表
//       </h1>

//       <table className="min-w-full border">
//         <thead>
//           <tr className="bg-gray-100 border-b">
//             <th className="p-2 text-left">プレイヤー名</th>
//             <th className="p-2 text-left">HDCP</th>
//           </tr>
//         </thead>
//         <tbody>
//           {scores && scores.length > 0 ? (
//             scores.map((row) => (
//               <tr key={row.id} className="border-b">
//                 <td className="p-2">{row.player_name}</td>
//                 <td className="p-2">
//                   {row.hdcp === null ? "未定" : row.hdcp}
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={2} className="p-4 text-gray-500">
//                 データがありません
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// import { supabasePublic } from '@/lib/supabase/public'
// import { notFound } from 'next/navigation'

// type Props = {
//   params: { code: string }
// }

// export default async function HdcpPublicPage({ params }: Props) {
//   const { code } = params

//   // ① golf_courses.code → id 取得
//   const { data: course, error: courseError } = await supabasePublic
//     .from('golf_courses')
//     .select('id, name')
//     .eq('code', code)
//     .single()

//   if (courseError || !course) {
//     notFound()
//   }

//   // ② hdcp_scores_public 取得
//   const { data: scores, error: scoresError } = await supabasePublic
//     .from('hdcp_scores_public')
//     .select('*')
//     .eq('golf_course_id', course.id)
//     .order('created_at', { ascending: false })

//   if (scoresError) {
//     throw new Error('Failed to load scores')
//   }

//   return (
//     <main>
//       <h1>{course.name} HDCP</h1>

//       <ul>
//         {scores.map(score => (
//           <li key={score.id}>
//             {score.player_name} : {score.hdcp}
//           </li>
//         ))}
//       </ul>
//     </main>
//   )
// }




export const dynamic = "force-dynamic";

import { supabasePublic } from "@/lib/supabase/public";

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  // 👇 ここが決定打
  const { code } = await params;

  console.log("SERVER code:", code);

  const { data, error } = await supabasePublic
    .from("golf_courses")
    .select("id, name")
    .eq("code", code)
    .single();

  return (
    <pre>
      {JSON.stringify({ code, data, error }, null, 2)}
    </pre>
  );
}
