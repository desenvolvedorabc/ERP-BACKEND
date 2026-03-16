import { unlink } from "node:fs";

export function deleteFile(path: string) {
  unlink(`./public/${path}`, (err) => {
    console.log(err);
  });
}
