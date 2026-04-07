export type ImageAssetPipeline = {
  key: string;
  pattern: string;
  logPrefix: string;
  localDir: string;
  sourceExt: string;
  outputExt: string;
};

export type AcbAssetPipeline = {
  key: string;
  pattern: string;
  logPrefix: string;
  localDir: string;
  sourceExt: string;
  outputExt: string;
};

export type UploadTarget = {
  local: string;
  gcs: string;
};

export declare const imageAssetPipelines: ImageAssetPipeline[];
export declare const acbAssetPipelines: AcbAssetPipeline[];
export declare const uploadTargets: UploadTarget[];
export declare const auditTargets: Array<ImageAssetPipeline | AcbAssetPipeline>;
