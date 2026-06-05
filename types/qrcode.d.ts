declare module 'qrcode' {
  export type QRCodeOptions = {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
    type?: string
    quality?: number
    margin?: number
    width?: number
    color?: { dark?: string; light?: string }
  }

  export function toDataURL(text: string, options?: QRCodeOptions): Promise<string>

  // minimal additional exports used by the library
  export function toCanvas(canvas: HTMLCanvasElement, text: string, options?: QRCodeOptions): Promise<HTMLCanvasElement>

  const _default: {
    toDataURL: typeof toDataURL
    toCanvas: typeof toCanvas
  }

  export default _default
}
