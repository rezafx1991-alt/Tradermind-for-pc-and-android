from pathlib import Path


ANDROID_DIR = Path(__file__).resolve().parents[1] / "android"
MAIN_ACTIVITY = (
    ANDROID_DIR
    / "app/src/main/java/app/tradermind/os/MainActivity.java"
)
MANIFEST = ANDROID_DIR / "app/src/main/AndroidManifest.xml"


def patch_main_activity() -> None:
    MAIN_ACTIVITY.write_text(
        """package app.tradermind.os;

import android.os.Bundle;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
    }
}
""",
        encoding="utf-8",
    )


def patch_manifest() -> None:
    content = MANIFEST.read_text(encoding="utf-8")
    if "android:windowSoftInputMode=" not in content:
        marker = '            android:launchMode="singleTask"'
        if marker not in content:
            raise RuntimeError("Could not find the generated MainActivity entry")
        content = content.replace(
            marker,
            marker + '\n            android:windowSoftInputMode="adjustResize"',
            1,
        )
        MANIFEST.write_text(content, encoding="utf-8")


if __name__ == "__main__":
    if not MAIN_ACTIVITY.exists() or not MANIFEST.exists():
        raise SystemExit("Capacitor Android project has not been generated")
    patch_main_activity()
    patch_manifest()
    print("Applied Android keyboard resize compatibility patch")