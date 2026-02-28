const fs = require("fs");
const path = require("path");

const componentArg = process.argv[2];

if (!componentArg) {
  console.error("❌ Please provide a component name.");
  process.exit(1);
}

const componentName = componentArg.charAt(0).toUpperCase() + componentArg.slice(1);

const folderName = componentArg.toLowerCase();
const styleFileName = `${folderName}.style.ts`;

const baseDir = path.join(__dirname, "..", "app/ui", folderName);

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

const storyTemplate = `import React from "react";
import { View } from "react-native";
import ${componentName} from "./${componentName}";

export default {
  title: "UI/${componentName}",
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

console.log(`✅ UI component "${componentName}" generated successfully.`);
