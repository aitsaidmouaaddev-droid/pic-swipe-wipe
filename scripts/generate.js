const fs = require("fs");
const path = require("path");

/**
 * Usage:
 *   node generate.js Button -ui
 *   node generate.js Button -c
 *
 * Flags:
 *   -ui  => app/ui/composant/<folderName>
 *   -c   => app/components/<folderName>
 */

const args = process.argv.slice(2);

const hasUI = args.includes("-ui");
const hasC = args.includes("-c");

if ((hasUI && hasC) || (!hasUI && !hasC)) {
  console.error('❌ Please pass exactly one flag: "-ui" or "-c".');
  console.error("   Examples:");
  console.error("   node generate.js Button -ui");
  console.error("   node generate.js Button -c");
  process.exit(1);
}

// component name = first arg that is not a flag
const componentArg = args.find((a) => !a.startsWith("-"));

if (!componentArg) {
  console.error("❌ Please provide a component name.");
  process.exit(1);
}

// Convert "video-player" / "video_player" / "video player" => "VideoPlayer"
const toPascalCase = (str) =>
  str
    .replace(/[_\s]+/g, "-")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

const componentName = toPascalCase(componentArg);
const folderName = componentArg.toLowerCase().replace(/\s+/g, "-");
const styleFileName = `${folderName}.style.ts`;

// Choose base folder based on flag
const targetDir = hasUI ? path.join("app", "ui", "composant") : path.join("app", "components");

const baseDir = path.join(__dirname, "..", targetDir, folderName);

if (fs.existsSync(baseDir)) {
  console.error("❌ Component already exists.");
  process.exit(1);
}

fs.mkdirSync(baseDir, { recursive: true });

/* ===========================
   File templates
=========================== */

const componentTemplate = `import React from "react";
import { View, Text } from "react-native";
import styles from "./${folderName}.style";

const ${componentName} = () => {
  return (
    <View style={styles.container}>
      <Text>${componentName} Component</Text>
    </View>
  );
};

export default ${componentName};
`;

const styleTemplate = `import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
});
`;

const testTemplate = `import React from "react";
import { render } from "@testing-library/react-native";
import ${componentName} from "./${componentName}";

describe("${componentName}", () => {
  it("renders correctly", () => {
    const { getByText } = render(<${componentName} />);
    expect(getByText("${componentName} Component")).toBeTruthy();
  });
});
`;

const storyTitlePrefix = hasUI ? "UI" : "Components";
const storyTemplate = `import React from "react";
import { View } from "react-native";
import ${componentName} from "./${componentName}";

export default {
  title: "${storyTitlePrefix}/${componentName}",
  component: ${componentName},
};

export const Default = () => (
  <View style={{ flex: 1 }}>
    <${componentName} />
  </View>
);
`;

/* ===========================
   Write files
=========================== */

fs.writeFileSync(path.join(baseDir, `${componentName}.tsx`), componentTemplate);
fs.writeFileSync(path.join(baseDir, styleFileName), styleTemplate);
fs.writeFileSync(path.join(baseDir, `${componentName}.test.tsx`), testTemplate);
fs.writeFileSync(path.join(baseDir, `${componentName}.stories.tsx`), storyTemplate);

console.log(
  `✅ ${hasUI ? "UI" : "Component"} "${componentName}" generated successfully in "${targetDir}/${folderName}".`,
);
