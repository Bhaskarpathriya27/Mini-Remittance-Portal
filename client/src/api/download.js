import { api } from "./axios";
export async function download(path, filename) {
  const res = await api.get(path, { responseType: "blob" });
  const blob = new Blob([res.data]);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
