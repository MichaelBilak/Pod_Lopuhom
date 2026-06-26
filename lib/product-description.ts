/** Removes embedded jewelry-care blocks from product descriptions (shown via UI instead). */
const CARE_SECTION_START =
  /(?:\n{1,2}|^)\s*(?:Уход за украшениями(?:\s+из\s+эпоксидной\s+смолы)?|Jewelry\s+[Cc]are(?:\s+for\s+epoxy\s+resin\s+jewelry)?|Cura\s+dei\s+gioielli(?:\s+in\s+resina\s+epossidica)?)\b[\s\S]*$/iu;

export function stripJewelryCareFromDescription(
  text: string | null | undefined
): string {
  if (!text) return "";
  return text.replace(CARE_SECTION_START, "").trim();
}

export function sanitizeProductDescriptionField(
  text: string | null | undefined
): string | null {
  const stripped = stripJewelryCareFromDescription(text);
  return stripped || null;
}
