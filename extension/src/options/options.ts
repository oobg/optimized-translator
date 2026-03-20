import { mountGlossaryUi } from "./glossary-ui.js";

const root = document.getElementById("root");
if (root) {
  document.body.setAttribute(
    "style",
    "margin:0;padding:20px;font:14px/1.5 system-ui,sans-serif;color:#24292f;background:#fff;"
  );
  void mountGlossaryUi(root);
}
