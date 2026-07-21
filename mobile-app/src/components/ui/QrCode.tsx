import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import qrcode from "qrcode-generator";
import { radius } from "@/src/constants/Theme";

type Props = {
  /** The string to encode (e.g. an otpauth:// URL). */
  value: string;
  /** Rendered width/height of the code area in px (quiet zone padding is added around it). */
  size?: number;
};

type Segment = { start: number; length: number };

/**
 * Dependency-light QR code renderer: encodes with the pure-JS
 * `qrcode-generator` and draws each row's consecutive dark modules as one
 * merged View segment (no native SVG module needed, so no dev-client rebuild).
 * Always rendered on a white card with a quiet zone so scanners pick it up in
 * dark mode too.
 */
export default function QrCode({ value, size = 200 }: Props) {
  const rows = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(value);
    qr.make();
    const count = qr.getModuleCount();
    const result: Array<{ index: number; segments: Segment[] }> = [];
    for (let row = 0; row < count; row += 1) {
      const segments: Segment[] = [];
      let start = -1;
      for (let col = 0; col < count; col += 1) {
        if (qr.isDark(row, col)) {
          if (start < 0) start = col;
        } else if (start >= 0) {
          segments.push({ start, length: col - start });
          start = -1;
        }
      }
      if (start >= 0) segments.push({ start, length: count - start });
      result.push({ index: row, segments });
    }
    return { count: qr.getModuleCount(), list: result };
  }, [value]);

  const moduleSize = size / rows.count;

  return (
    <View style={styles.card} accessibilityLabel="QR code" accessibilityRole="image">
      <View style={{ width: size, height: size }}>
        {rows.list.map((row) => (
          <View key={row.index} style={[styles.row, { height: moduleSize }]}>
            {row.segments.map((segment) => (
              <View
                key={`${row.index}-${segment.start}`}
                style={{
                  position: "absolute",
                  left: segment.start * moduleSize,
                  width: segment.length * moduleSize,
                  height: moduleSize,
                  backgroundColor: "#000000",
                }}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderRadius: radius.md,
    padding: 14,
  },
  row: {
    width: "100%",
  },
});
