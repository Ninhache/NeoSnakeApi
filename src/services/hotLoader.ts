import chokidar from "chokidar";
import { processMarkdownFile, removeArticle } from "./article";

export function setupWatcher(directory: string) {
  const watcher = chokidar.watch(directory, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
  });

  watcher
    .on("add", processMarkdownFile)
    .on("change", processMarkdownFile)
    .on("unlink", removeArticle);
}
