interface Navigator {
  virtualKeyboard?: {
    overlaysContent: boolean;
    boundingRect: DOMRect;
    show(): void;
    hide(): void;
    addEventListener(type: 'geometrychange', listener: (event: Event) => void): void;
    removeEventListener(type: 'geometrychange', listener: (event: Event) => void): void;
  };
}
