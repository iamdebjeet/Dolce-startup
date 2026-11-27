/**
 * DOLCE — sync Google Form reviews to the website.
 *
 * Sends each new form response to <SITE_URL>/api/reviews/import, so the website can show the average
 * rating and the reviews you choose to feature (in /dolceadmin → Reviews). Only these answers are sent:
 * name (the site keeps the first name only), product, rating, review text, and the "May we feature…"
 * permission. Age range, gender and "how likely to recommend" are NOT sent.
 *
 * SETUP (once):
 *  1. Open the Google Form (edit view) → ⋮ menu → "Apps Script".
 *  2. Replace the editor contents with this file and click Save.
 *  3. ⚙ Project Settings → Script Properties → add:
 *       SITE_URL = https://dolcecafe.netlify.app       (your live site, no trailing slash)
 *       SECRET   = <the same value as FORM_WEBHOOK_SECRET in Netlify>
 *  4. In the editor, choose the function "setup" and click ▶ Run. Approve the permissions Google asks for.
 *     This imports all existing responses and turns on automatic sync for new ones.
 *
 * Re-running "setup" or "importAllResponses" is safe: responses are matched by id, never duplicated.
 */

// Form questions this script reads, matched case-insensitively.
var QUESTIONS = [
  { key: "name", exact: "name" },
  { key: "product", startsWith: "name of the product you liked" },
  { key: "rating", startsWith: "how would you rate your overall experience" },
  { key: "review", startsWith: "review us" },
  { key: "consent", startsWith: "may we feature your feedback" },
];

function toPayload_(response) {
  var out = { id: response.getId(), submittedAt: response.getTimestamp().toISOString() };
  response.getItemResponses().forEach(function (itemResponse) {
    var title = itemResponse.getItem().getTitle().trim().toLowerCase();
    QUESTIONS.forEach(function (q) {
      var match = q.exact ? title === q.exact : title.indexOf(q.startsWith) === 0;
      if (match && out[q.key] === undefined) out[q.key] = String(itemResponse.getResponse());
    });
  });
  return out;
}

function send_(payloads) {
  var props = PropertiesService.getScriptProperties();
  var siteUrl = (props.getProperty("SITE_URL") || "").replace(/\/+$/, "");
  var secret = props.getProperty("SECRET");
  if (!siteUrl || !secret) throw new Error("Set the SITE_URL and SECRET script properties first (Project Settings → Script Properties).");

  for (var i = 0; i < payloads.length; i += 200) {
    var res = UrlFetchApp.fetch(siteUrl + "/api/reviews/import", {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + secret },
      payload: JSON.stringify({ responses: payloads.slice(i, i + 200) }),
      muteHttpExceptions: true,
    });
    var code = res.getResponseCode();
    Logger.log("Sent " + Math.min(200, payloads.length - i) + " response(s): HTTP " + code + " " + res.getContentText());
    if (code !== 200) throw new Error("Website rejected the reviews (HTTP " + code + "): " + res.getContentText());
  }
}

/** Runs automatically on every new form submission (installed by setup). */
function onFormSubmit(e) {
  send_([toPayload_(e.response)]);
}

/** Sends every existing response (safe to re-run). */
function importAllResponses() {
  var responses = FormApp.getActiveForm().getResponses();
  if (!responses.length) { Logger.log("No responses yet."); return; }
  send_(responses.map(toPayload_));
}

/** One-time setup: install the on-submit trigger and import existing responses. */
function setup() {
  var form = FormApp.getActiveForm();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "onFormSubmit") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("onFormSubmit").forForm(form).onFormSubmit().create();
  importAllResponses();
  Logger.log("Done: automatic sync is on.");
}
