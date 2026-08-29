export interface FrameSequenceConfig {
  basePath: string;
  prefix: string;
  ext: string;
  pad: number;
  startIndex: number;
  endIndex: number;
}

// Actual frame files are 02.png .. 30.png (29 frames). Edit only this
// object if the real filenames ever change — nothing else needs to.
export const WARRIOR_FRAMES: FrameSequenceConfig = {
  basePath: "/assets/warrior/",
  prefix: "",
  ext: ".png",
  pad: 2,
  startIndex: 2,
  endIndex: 30,
};

export const PHILOSOPHER_FRAMES: FrameSequenceConfig = {
  basePath: "/assets/philosopher/",
  prefix: "",
  ext: ".png",
  pad: 2,
  startIndex: 2,
  endIndex: 30,
};

export function frameUrl(config: FrameSequenceConfig, index: number): string {
  const num = String(index).padStart(config.pad, "0");
  return `${config.basePath}${config.prefix}${num}${config.ext}`;
}
