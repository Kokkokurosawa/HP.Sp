/** "YYYY-MM-DD" を表示用の "YYYY.MM.DD" に変換する */
export function formatDate(isoDate: string): string {
  return isoDate.replaceAll("-", ".");
}
