import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pipette } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ColorFormat,
  DEFAULT_PICKER_COLOR,
  HsvaColor,
  getColorChannels,
  getHueColor,
  hexToHsva,
  hsvaToHex,
  hsvaToRgb,
  loadSavedColors,
  parseColorChannels,
  persistSavedColors,
  rgbToHex,
} from "./color-picker-utils";
import "./color-picker.scss";

export type ColorPickerPanelProps = {
  color?: string;
  onChange: (hex: string) => void;
  onChangeComplete?: (hex: string) => void;
};

type EyeDropperResult = { sRGBHex: string };
type EyeDropperInstance = { open: () => Promise<EyeDropperResult> };
type EyeDropperConstructor = new () => EyeDropperInstance;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getEyeDropper(): EyeDropperConstructor | null {
  if (typeof window === "undefined") return null;
  return (window as Window & { EyeDropper?: EyeDropperConstructor }).EyeDropper ?? null;
}

function usePointerDrag(onMove: (clientX: number, clientY: number) => void) {
  const dragging = useRef(false);

  const start = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      dragging.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      onMove(event.clientX, event.clientY);
    },
    [onMove]
  );

  const move = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!dragging.current) return;
      onMove(event.clientX, event.clientY);
    },
    [onMove]
  );

  const end = useCallback((event: React.PointerEvent<HTMLElement>) => {
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return { start, move, end };
}

const RGB_CHANNEL_LABELS = ["R", "G", "B"] as const;
const HSL_CHANNEL_LABELS = ["H", "S", "L"] as const;

export function ColorPickerPanel({ color, onChange, onChangeComplete }: ColorPickerPanelProps) {
  const [hsva, setHsva] = useState<HsvaColor>(() => hexToHsva(color || DEFAULT_PICKER_COLOR));
  const [format, setFormat] = useState<ColorFormat>("hex");
  const [channelInputs, setChannelInputs] = useState<[string, string, string]>(() =>
    getColorChannels(hexToHsva(color || DEFAULT_PICKER_COLOR), "hex")
  );
  const [alphaInput, setAlphaInput] = useState(() => String(hexToHsva(color || DEFAULT_PICKER_COLOR).a));
  const [savedColors, setSavedColors] = useState<string[]>(() => loadSavedColors());

  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);
  const hsvaRef = useRef(hsva);

  useEffect(() => {
    hsvaRef.current = hsva;
  }, [hsva]);

  const emitChange = useCallback(
    (next: HsvaColor, complete = false) => {
      const hex = hsvaToHex(next);
      onChange(hex);
      if (complete) onChangeComplete?.(hex);
    },
    [onChange, onChangeComplete]
  );

  const updateHsva = useCallback(
    (partial: Partial<HsvaColor>, complete = false) => {
      setHsva((current) => {
        const next = { ...current, ...partial };
        hsvaRef.current = next;
        setChannelInputs(getColorChannels(next, format));
        setAlphaInput(String(Math.round(next.a)));
        emitChange(next, complete);
        return next;
      });
    },
    [emitChange, format]
  );

  useEffect(() => {
    const next = hexToHsva(color || DEFAULT_PICKER_COLOR);
    setHsva(next);
    setChannelInputs(getColorChannels(next, format));
    setAlphaInput(String(Math.round(next.a)));
  }, [color]);

  const handleSvMove = useCallback(
    (clientX: number, clientY: number) => {
      const rect = svRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = clamp((clientX - rect.left) / rect.width, 0, 1);
      const y = clamp((clientY - rect.top) / rect.height, 0, 1);
      updateHsva({ s: x * 100, v: (1 - y) * 100 });
    },
    [updateHsva]
  );

  const handleHueMove = useCallback(
    (clientX: number) => {
      const rect = hueRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = clamp((clientX - rect.left) / rect.width, 0, 1);
      updateHsva({ h: x * 360 });
    },
    [updateHsva]
  );

  const handleAlphaMove = useCallback(
    (clientX: number) => {
      const rect = alphaRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = clamp((clientX - rect.left) / rect.width, 0, 1);
      updateHsva({ a: x * 100 });
    },
    [updateHsva]
  );

  const svDrag = usePointerDrag(handleSvMove);
  const hueDrag = usePointerDrag((clientX) => handleHueMove(clientX));
  const alphaDrag = usePointerDrag((clientX) => handleAlphaMove(clientX));

  const { r, g, b } = hsvaToRgb(hsva);
  const solidHex = rgbToHex(r, g, b);
  const currentHex = hsvaToHex(hsva);

  const handleChannelInputBlur = () => {
    const parsed = parseColorChannels(channelInputs, format, hsvaRef.current);
    if (!parsed) {
      setChannelInputs(getColorChannels(hsvaRef.current, format));
      return;
    }
    updateHsva(parsed, true);
  };

  const handleChannelChange = (index: number, value: string) => {
    setChannelInputs((current) => {
      const next: [string, string, string] = [...current];
      next[index] = value;
      return next;
    });
  };

  const handleAlphaInputBlur = () => {
    const numeric = Number(alphaInput.replace("%", "").trim());
    if (Number.isNaN(numeric)) {
      setAlphaInput(String(Math.round(hsvaRef.current.a)));
      return;
    }
    updateHsva({ a: clamp(numeric, 0, 100) }, true);
  };

  const handleEyedropper = async () => {
    const EyeDropper = getEyeDropper();
    if (!EyeDropper) return;
    try {
      const result = await new EyeDropper().open();
      updateHsva(hexToHsva(result.sRGBHex), true);
    } catch {
      // User cancelled the eyedropper.
    }
  };

  const handleAddSavedColor = () => {
    const hex = hsvaToHex(hsvaRef.current);
    setSavedColors((current) => {
      if (current.includes(hex)) return current;
      const next = [hex, ...current].slice(0, 18);
      persistSavedColors(next);
      return next;
    });
  };

  const handleSavedColorSelect = (savedColor: string) => {
    updateHsva(hexToHsva(savedColor), true);
  };

  return (
    <div className="color-picker-panel" onMouseDown={(event) => event.stopPropagation()}>
      <div
        ref={svRef}
        className="color-picker-sv"
        style={{ backgroundColor: getHueColor(hsva.h) }}
        onPointerDown={svDrag.start}
        onPointerMove={svDrag.move}
        onPointerUp={(event) => {
          svDrag.end(event);
          emitChange(hsvaRef.current, true);
        }}
        onPointerCancel={svDrag.end}>
        <div className="color-picker-sv__white" />
        <div className="color-picker-sv__black" />
        <div
          className="color-picker-sv__cursor"
          style={{
            left: `${hsva.s}%`,
            top: `${100 - hsva.v}%`,
            backgroundColor: solidHex,
          }}
        />
      </div>

      <div className="color-picker-slider-row">
        <button
          type="button"
          className="color-picker-eyedropper"
          onClick={handleEyedropper}
          disabled={!getEyeDropper()}
          aria-label="Pick color from screen">
          <Pipette className="h-3.5 w-3.5" />
        </button>

        <div className="color-picker-sliders">
          <div
            ref={hueRef}
            className="color-picker-slider color-picker-slider--hue"
            onPointerDown={hueDrag.start}
            onPointerMove={hueDrag.move}
            onPointerUp={(event) => {
              hueDrag.end(event);
              emitChange(hsvaRef.current, true);
            }}
            onPointerCancel={hueDrag.end}>
            <div className="color-picker-slider__thumb" style={{ left: `${(hsva.h / 360) * 100}%` }} />
          </div>

          <div
            ref={alphaRef}
            className="color-picker-slider color-picker-slider--alpha"
            onPointerDown={alphaDrag.start}
            onPointerMove={alphaDrag.move}
            onPointerUp={(event) => {
              alphaDrag.end(event);
              emitChange(hsvaRef.current, true);
            }}
            onPointerCancel={alphaDrag.end}>
            <div className="color-picker-slider__checkerboard" />
            <div
              className="color-picker-slider__alpha-fill"
              style={{
                background: `linear-gradient(to right, transparent, ${solidHex})`,
              }}
            />
            <div className="color-picker-slider__thumb" style={{ left: `${hsva.a}%` }} />
          </div>
        </div>
      </div>

      <div className="color-picker-inputs">
        <Select
          value={format}
          onValueChange={(value) => {
            const nextFormat = value as ColorFormat;
            setFormat(nextFormat);
            setChannelInputs(getColorChannels(hsvaRef.current, nextFormat));
          }}>
          <SelectTrigger className="color-picker-format-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="hex">Hex</SelectItem>
            <SelectItem value="rgb">RGB</SelectItem>
            <SelectItem value="hsl">HSL</SelectItem>
          </SelectContent>
        </Select>

        <div className="color-picker-value-inputs">
          {format === "hex" ?
            <label className="color-picker-hex-input">
              <span className="color-picker-hex-input__swatch" style={{ backgroundColor: currentHex }} />
              <input
                className="color-picker-hex-input__field"
                value={`#${channelInputs[0]}`}
                onChange={(event) => handleChannelChange(0, event.target.value.replace(/^#/, ""))}
                onBlur={handleChannelInputBlur}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                }}
                aria-label="Hex color value"
              />
            </label>
          : <div className="color-picker-channels">
              {(format === "rgb" ? RGB_CHANNEL_LABELS : HSL_CHANNEL_LABELS).map((label, index) => (
                <input
                  key={label}
                  className="color-picker-channel-input"
                  value={channelInputs[index]}
                  onChange={(event) => handleChannelChange(index, event.target.value)}
                  onBlur={handleChannelInputBlur}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                  }}
                  aria-label={`${label} value`}
                  inputMode="numeric"
                />
              ))}
            </div>
          }
        </div>

        <input
          className="color-picker-alpha-input"
          value={`${alphaInput}%`}
          onChange={(event) => setAlphaInput(event.target.value.replace("%", ""))}
          onBlur={handleAlphaInputBlur}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          aria-label="Opacity"
        />
      </div>

      <div className="color-picker-saved">
        <div className="color-picker-saved__header">
          <span>Saved</span>
          <button type="button" className="color-picker-saved__add" onClick={handleAddSavedColor}>
            + Add
          </button>
        </div>
        <div className="color-picker-saved__swatches">
          {savedColors.map((savedColor) => (
            <button
              key={savedColor}
              type="button"
              className="color-picker-saved__swatch"
              style={{ backgroundColor: savedColor }}
              onClick={() => handleSavedColorSelect(savedColor)}
              aria-label={`Use saved color ${savedColor}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
