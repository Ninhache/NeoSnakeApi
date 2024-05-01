/**
 * Transform a title to a path
 * for example: "The Great Gatsby" -> "the-great-gatsby"
 *
 * @param title
 */
export function transformTitleToPath(title: string) {
  return title.toLowerCase().replace(/ /g, "-");
}
