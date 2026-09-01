import { getCurrentUser } from "@/lib/auth";
import { parseSheet } from "@/lib/payroll/model";
import { payrollFileName, payrollWorkbook } from "@/lib/payroll/workbook";

// POST /api/payroll — turns the roll the teacher just edited on
// /teacher/payroll into General Form No. 7(A) as an .xlsx download.
//
// A POST rather than a GET with query parameters because the sheet is the
// whole preview: every tick, every rate, every dropped holiday. Nothing here
// is persisted — the request body *is* the document, and the same numbers the
// teacher checked on screen are the ones that get written.
//
// It reads no course data, so there is no RLS to lean on: the teacher check
// below is the only gate, and it's the reason the route is closed to students
// even though a payroll says nothing about anyone's work.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "teacher") {
    return Response.json({ error: "Teachers only." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseSheet(body);
  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const bytes = payrollWorkbook(parsed.sheet);
  const fileName = payrollFileName(parsed.sheet);

  return new Response(new Blob([bytes as BlobPart]), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": String(bytes.length),
      "Cache-Control": "no-store",
    },
  });
}
