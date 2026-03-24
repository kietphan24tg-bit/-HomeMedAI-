import subprocess

keystore_path = r"d:\Workspace\WDA contest\HomeMedAI\android\app\debug.keystore"
cmd = [
    "keytool",
    "-list",
    "-v",
    "-keystore", keystore_path,
    "-alias", "androiddebugkey",
    "-storepass", "android",
    "-keypass", "android"
]

try:
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    with open("sha1_output.log", "w", encoding="utf-8") as f:
        f.write(result.stdout)
    print("Output saved to sha1_output.log")
except Exception as e:
    print(f"Error: {e}")
