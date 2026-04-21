const fs = require('fs');
const path = require('path');

const root = process.cwd();

function removeIfExists(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  try {
    fs.rmSync(targetPath, { recursive: true, force: true });
    console.log(`[Fix] Removed stale native build artifacts: ${path.relative(root, targetPath)}`);
  } catch (error) {
    console.warn(
      `[Fix] Could not remove ${path.relative(root, targetPath)}: ${error.code || error.message}`
    );
  }
}

function patchBorderRadiiDrawableUtils() {
  const filePath = path.join(
    root,
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

  if (!fs.existsSync(filePath)) {
    console.log('[Fix] react-native-reanimated BorderRadiiDrawableUtils.java not found, skipping patch.');
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('bounds.width()')) {
    console.log('[Fix] react-native-reanimated is already patched or does not contain the bug.');
    return;
  }

  content = content.replace(/bounds\.width\(\)/g, 'view.getWidth()');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('[Fix] react-native-reanimated BorderRadiiDrawableUtils.java patched successfully.');
}

function patchWorkletsCMakeForWindows() {
  const filePath = path.join(
    root,
    'node_modules',
    'react-native-worklets',
    'android',
    'CMakeLists.txt'
  );

  if (!fs.existsSync(filePath)) {
    console.log('[Fix] react-native-worklets CMakeLists.txt not found, skipping patch.');
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const buggyHermesCondition =
    'if(${HERMES_ENABLE_DEBUGGER} AND NOT (WIN32 AND CMAKE_BUILD_TYPE MATCHES "Debug"))';
  const fixedHermesCondition =
    'if(HERMES_ENABLE_DEBUGGER AND NOT (WIN32 AND CMAKE_BUILD_TYPE MATCHES "Debug"))';

  if (content.includes(buggyHermesCondition)) {
    content = content.replace(buggyHermesCondition, fixedHermesCondition);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('[Fix] react-native-worklets CMakeLists.txt Hermes debugger condition fixed.');
    return;
  }

  if (!content.includes('Reduce clang frontend memory pressure on Windows debug builds.')) {
    content = content.replace(
      "set(CMAKE_CXX_STANDARD 20)\n",
      "set(CMAKE_CXX_STANDARD 20)\n\nif(WIN32 AND CMAKE_BUILD_TYPE MATCHES \"Debug\")\n  # Reduce clang frontend memory pressure on Windows debug builds.\n  set_property(GLOBAL PROPERTY JOB_POOLS worklets_compile_pool=1)\nendif()\n"
    );

    content = content.replace(
      "endif()\n\nset(BUILD_DIR",
      "endif()\n\nif(WIN32 AND CMAKE_BUILD_TYPE MATCHES \"Debug\")\n  string(REPLACE \" -fno-limit-debug-info\" \"\" CMAKE_CXX_FLAGS \"${CMAKE_CXX_FLAGS}\")\n  string(APPEND CMAKE_CXX_FLAGS \" -g0\")\nendif()\n\nset(BUILD_DIR"
    );

    content = content.replace(
      "add_library(worklets SHARED ${WORKLETS_COMMON_CPP_SOURCES}\n                            ${WORKLETS_ANDROID_CPP_SOURCES})\n",
      "add_library(worklets SHARED ${WORKLETS_COMMON_CPP_SOURCES}\n                            ${WORKLETS_ANDROID_CPP_SOURCES})\n\nif(WIN32 AND CMAKE_BUILD_TYPE MATCHES \"Debug\")\n  set_property(TARGET worklets PROPERTY JOB_POOL_COMPILE worklets_compile_pool)\nendif()\n"
    );

    content = content.replace(
      "  if(${HERMES_ENABLE_DEBUGGER})\n",
      "  if(HERMES_ENABLE_DEBUGGER AND NOT (WIN32 AND CMAKE_BUILD_TYPE MATCHES \"Debug\"))\n"
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('[Fix] react-native-worklets CMakeLists.txt patched for lower Windows debug memory usage.');
    return;
  }

  if (!content.includes(fixedHermesCondition) && content.includes('if(${HERMES_ENABLE_DEBUGGER})')) {
    content = content.replace('if(${HERMES_ENABLE_DEBUGGER})', fixedHermesCondition);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('[Fix] react-native-worklets CMakeLists.txt Hermes debugger condition normalized.');
    return;
  }

  console.log('[Fix] react-native-worklets CMakeLists.txt is already patched.');
}

function clearNativeArtifacts() {
  const staleDirs = [
    path.join(root, 'android', 'app', 'build'),
    path.join(root, 'android', 'build'),
    path.join(root, 'node_modules', 'react-native-reanimated', 'android', '.cxx'),
    path.join(root, 'node_modules', 'react-native-reanimated', 'android', 'build'),
    path.join(root, 'node_modules', 'react-native-worklets', 'android', '.cxx'),
    path.join(root, 'node_modules', 'react-native-worklets', 'android', 'build'),
  ];

  staleDirs.forEach(removeIfExists);
}

clearNativeArtifacts();
patchBorderRadiiDrawableUtils();
patchWorkletsCMakeForWindows();
