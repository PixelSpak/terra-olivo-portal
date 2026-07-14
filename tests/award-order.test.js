const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

function readAwardOrder() {
  const filePath = path.join(process.cwd(), "src", "lib", "types.ts");
  const source = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
  );

  let awardOrder;

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "AWARD_ORDER" &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      awardOrder = node.initializer.elements.map((element) => {
        assert.ok(
          ts.isStringLiteral(element),
          "expected AWARD_ORDER to contain only string literals",
        );
        return element.text;
      });
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  assert.ok(awardOrder, "expected to find AWARD_ORDER in src/lib/types.ts");
  return awardOrder;
}

test("Best of country awards are alphabetized after TOP TEN", () => {
  const awardOrder = readAwardOrder();
  const topTenIndex = awardOrder.indexOf("TOP TEN");
  assert.notEqual(topTenIndex, -1, "expected TOP TEN in AWARD_ORDER");

  const countryAwards = [
    "Best of Argentina",
    "Best of Australia",
    "Best of Brazil",
    "Best of Creta",
    "Best of Greece",
    "Best of Italy",
    "Best of Portugal",
    "Best of Spain",
    "Best of Turkey",
  ];

  assert.deepEqual(
    awardOrder.slice(topTenIndex + 1, topTenIndex + 1 + countryAwards.length),
    countryAwards,
  );

  assert.ok(
    awardOrder.indexOf("Best Flavored Oil") > awardOrder.indexOf("Best of Turkey"),
    "expected Best of country awards to stay above Best Flavored Oil",
  );
});
