export function formatDate(dateString:string, format = "YYMMDD") {
  const d = new Date(dateString);

  const yyyy = d.getFullYear();
  const yy = yyyy.toString().slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  if (format === "YYMMDD") return `${yy}-${mm}-${dd}`;
  if (format === "YYYYMMDD") return `${yyyy}-${mm}-${dd}`;
}