export type SynthesizeAudioInput = {
  text: string;
  voiceId: string;
  style?: string;
};

export type SynthesizeAudioResult = {
  url: string;
};

export type JoinAudioResult = {
  url: string;
};

export interface AudioProvider {
  readonly id: string;
  synthesize(input: SynthesizeAudioInput): Promise<SynthesizeAudioResult>;
  join(urls: string[]): Promise<JoinAudioResult>;
}
