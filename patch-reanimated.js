const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  'node_modules',
  'react-native-reanimated',
  'android',
  'src',
  'reactNativeVersionPatch',
  'BorderRadiiDrawableUtils',
  'latest',
  'com',
  'swmansion',
  'reanimated',
  'BorderRadiiDrawableUtils.java'
);

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('bounds.width()')) {
    content = content.replace(/bounds\.width\(\)/g, 'view.getWidth()');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('[Fix] react-native-reanimated BorderRadiiDrawableUtils.java patched successfully.');
  } else {
    console.log('[Fix] react-native-reanimated is already patched or does not contain the bug.');
  }
} else {
  console.log('[Fix] react-native-reanimated BorderRadiiDrawableUtils.java not found, skipping patch.');
}
